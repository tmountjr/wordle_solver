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
  let rounds = 1;
  
  while (rounds <= 6) {
    if (guess === targetWord) break;
    let results = _wordleResults(targetWord, guess);

    // Process the results within the WordList.
    wordList.processExternalResult(guess, results);

    // Push a results glyph
    const colors = _wordleColors(results);
    turnResults.push(`${guess} ${colors} (${wordList.size} possibilities left)`)

    // Print this round's results
    console.log(turnResults[turnResults.length - 1]);

    if (rounds < 6) {
      // Get a new guess.
      guess = wordList.getRandomWord();
      rounds++;
    } else if (rounds === 6) break;
  }


  if (guess === targetWord) {
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
    let toReturn = 'x';
    if (target.indexOf(letter) > -1) {
      toReturn = 'y';
      if (target[index] === letter) {
        toReturn = 'g';
      }
    }
    return toReturn;
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