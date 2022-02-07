import * as fs from 'fs';
import * as path from 'path';
import { WordList } from './WordList';
import { intersect, difference } from './helpers';

function wordle() {
  const words: string[] = fs.readFileSync(path.resolve('./words.txt')).toString().split('\n');
  let wordList = new  WordList(words);
  const targetWord = words[Math.floor(Math.random() * words.length)];
  let guess: string = 'arose';
  
  const turnResults: string[] = [];
  let rounds = 0;
  
  while (guess !== targetWord && rounds < 6) {
    rounds++;
  
    let results = _wordleResults(targetWord, guess);
    let details: { [key: string]: number[] } = { x: [], y: [], g: [] };
    results.forEach((result, index) => details[result].push(index));

    // First things first, remove letters that don't ever appear.
    // Use a set in case the word in question contained two of the same letter.
    const setToDelete: string[] = [...new Set(...details['x'].map(i => guess[i]))];
    setToDelete.forEach(deadLetter => wordList.removeLetter(deadLetter));

    // Start building a pool of next guesses
    let pool = new Set<string>();

    // Work through the "green" spaces
    if (details['g'].length) {
      const poolCandidates = details['g'].map(guessIndex => {
        const letter = guess[guessIndex];
        return wordList.containsAtIndex(letter, guessIndex);
      });
      pool = intersect(...poolCandidates);
    }

    // Now work through the letters that were found but incorrectly placed
    if (details['y'].length) {
      const poolCandidates = details['y'].map(guessIndex => {
        const letter = guess[guessIndex];
        // Get all words that have [letter] in any position EXCEPT [i]
        const allWordsWithLetter = difference(
          wordList.containsAny(letter),
          wordList.containsAtIndex(letter, guessIndex)
        );
        return allWordsWithLetter;
      });
      if (pool.size === 0) {
        pool = intersect(...poolCandidates)
      } else {
        pool = intersect(pool, ...poolCandidates);
      }
    }

    // Now delete the guess from the pool if it somehow survived
    pool.delete(guess);

    // Rebuild the word list (now that we've done the computations) because the
    // pool found here really is the pool we should be working from.
    if (pool.size > 0) wordList = new WordList([...pool]);

    // Push a results glyph
    const colors = _wordleColors(results);
    turnResults.push(`${guess} ${colors} (${wordList.size} possibilities left)`)

    // Print this round's results
    console.log(turnResults[turnResults.length - 1]);

    // Get a new guess.
    guess = wordList.getRandomWord();
  }


  if (guess === targetWord) {
    rounds++;
    const results = _wordleColors(Array(guess.length).fill('g'));
    turnResults.push(`${guess} ${results} (${wordList.size} possibilities left)`);
    console.log(turnResults[turnResults.length - 1]);
    console.log(`Success! Found match in ${rounds} turns.`);
  } else {
    console.log('Failed to find a solution.');
    console.log(`Word was: ${targetWord}`);
  }
}

/**
 * Get the results of a guess.
 * @param target The target word
 * @param guess The word we're guessing is a match
 * @returns A string array indicating whether guess[i] was a direct match, was found elsewhere, or was not found at all.
 */
function _wordleResults(target: string, guess: string): string[] {
  return guess.split('').map((letter, index) => {
    if (target.indexOf(letter) === index) {
      // letter found in the right spot
      return 'g'; // g for green
    }
    else if (target.indexOf(letter) !== -1) {
      // letter found but in the wrong spot
      return 'y'; // y for yellow
    }
    // letter not found at all
    return 'x'; // x for grey
  });
}

/**
 * Get a color-coded output string of results.
 * @param results The raw string of results
 * @returns A color-coded output string.
 */
function _wordleColors(results: string[]): string {
  const colors: { [key: string]: string; } = {
    x: String.fromCodePoint(11036),
    y: String.fromCodePoint(129000),
    g: String.fromCodePoint(129001)
  };
  return results.map(x => colors[x]).join('');
}

wordle();