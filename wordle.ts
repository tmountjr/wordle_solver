import * as fs from 'fs';
import * as path from 'path';
import * as SetOperations from './helpers';

function wordle() {
  // const words: string[] = fs.readFileSync(path.resolve('./words.txt')).toString().split('\n');
  const words: string[] = ["aa",
    "ab",
    "ad",
    "ag",
    "ah",
    "ai",
    "am",
    "an",
    "as",
    "at",
    "aw",
    "ax",
    "ay",
    "ba",
    "be",
    "bi",
    "bo",
    "by",
    "da",
    "do",
    "dy",
    "ee",
    "eh",
    "el",
    "em",
    "en",
    "er",
    "ex",
    "fa",
    "ga",
    "gi",
    "go",
    "ha",
    "he",
    "hi",
    "ho",
    "id",
    "if",
    "in",
    "io",
    "is",
    "it",
    "ja",
    "jo",
    "Ju",
    "ka",
    "ki",
    "la",
    "li",
    "lo",
    "ma",
    "me",
    "mi",
    "mo",
    "mu",
    "my",
    "ne",
    "no",
    "nu",
    "ob",
    "od",
    "of",
    "og",
    "oh",
    "oi",
    "ok",
    "om",
    "on",
    "op",
    "or",
    "os",
    "ou",
    "ow",
    "ox",
    "oy",
    "oz",
    "pa",
    "pi",
    "po",
    "qi",
    "ra",
    "re",
    "ri",
    "se",
    "si",
    "so",
    "ta",
    "te",
    "ti",
    "to",
    "uh",
    "um",
    "up",
    "us",
    "wa",
    "we",
    "wu",
    "xi",
    "xu",
    "ye",
    "yi",
    "yo",
    "yu"]
  
  const grouped: { [key: string]: Set<string>; }[] = [{}, {}];
  
  for (let word of words) {
    for (let i = 0; i < 2; i++) {
      const letter = word[i];
  
      if (!(letter in grouped[i])) grouped[i][letter] = new Set<string>();
      grouped[i][letter].add(word);
    }
  }
  
  const targetWord: string = 'is';
  let guess: string = 'of';
  
  const turnResults: string[] = [];
  let rounds = 0;
  
  while (guess !== targetWord && rounds < 6) {
    rounds++;
  
    let results = _wordleResults(targetWord, guess);
    let details: { [key: string]: number[] } = { x: [], y: [], g: [] };
    results.forEach((result, index) => details[result].push(index));

    // First things first, remove letters that don't ever appear.
    details['x'].forEach(deadLetterIndex => {
      const deadLetter = guess[deadLetterIndex];
      grouped.forEach((v, pos) => delete grouped[pos][deadLetter]);
    });

    // This is not deleting all letters from [grouped] that contain a.
    // For eample: [ 0: { a: [ 'aa', 'ab' ], b: [ 'ba', 'be' ] } ]
    // deleting 'a' from position 1 still leaves ['ba', 'be'] in postion 0 starting with b.
    // almost like we need to regenerate the groupings each time
    // or use a data structure that will ferret out interior letters efficiently.
    // TODO: will a trie work here?

    // Start building a pool of next guesses
    let pool = new Set<string>();

    // Work through the "green" spaces
    if (details['g'].length) {
      const poolCandidates = details['g'].map(i => {
        const letter = guess[i];
        return grouped[i][letter];
      });
      pool = SetOperations.intersect(...poolCandidates);
    }

    // Now work through the letters that were found but incorrectly placed
    if (details['y'].length) {
      const poolCandidates = details['y'].map(i => {
        const letter = guess[i];
        // Get all words that have [letter] in any position EXCEPT [i]
        const allWordsWithLetter = grouped.filter((v, idx) => idx !== i).map(x => x[letter]);
        return SetOperations.intersect(...allWordsWithLetter);
      });
      pool = SetOperations.intersect(pool, ...poolCandidates);
    }

    // Now delete the guess from the pool if it somehow survived
    pool.delete(guess);

    // Push a results glyph
    const colors = _wordleColors(results);
    turnResults.push(`${guess} ${colors}`)

    // Print this round's results
    console.log(`Round ${rounds}...`)
    console.log(`Guess: ${guess}`, colors);

    // Get a new guess.
    if (pool.size === 0) {
      pool = grouped[0][Object.keys(grouped[0])[0]];
    }
    guess = [...pool][Math.floor(Math.random() * pool.size)];
  }


  if (guess === targetWord) {
    const results = _wordleColors(Array(2).fill('g'));
    turnResults.push(`${guess} ${results}`);
  } else {
    console.log('Failed to find a solution.');
  }
  console.log(turnResults);
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