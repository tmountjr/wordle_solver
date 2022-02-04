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

    // Start building a pool of next guesses
    let pool = new Set<string>();

    // Work through the "green" spaces
    if (details['g'].length) {
      for (const correctlyPlacedLetterIndex of details['g']) {
        const correctlyPlacedLetter = guess[correctlyPlacedLetterIndex];
        if (pool.size === 0) {
          pool = grouped[correctlyPlacedLetterIndex][correctlyPlacedLetter]
        } else {
          const comparitor = grouped[correctlyPlacedLetterIndex][correctlyPlacedLetter];
          pool = new Set([...pool].filter(word => comparitor.has(word)));
        }
      }
    }

    // Now work through the letters that were found but incorrectly placed
    if (details['y'].length) {
      for (const foundLetterIndex of details['y']) {
        const foundLetter = guess[foundLetterIndex];
        if (pool.size === 0) {
          // since we don't know WHERE the letter should go, grab all words
          // containing that letter, then remove words with that letter in the
          // index (else it would be green)
          pool = wordContains.get(foundLetter) || new Set<string>();
        } else {
          // intersect all words with this letter
          const comparitor = wordContains.get(foundLetter) || new Set<string>();
          pool = new Set([...pool].filter(word => comparitor.has(word)));
        }

        // remove any words that have that letter in the current position (would
        // be green in that case)
        const comparitor = grouped[foundLetterIndex][foundLetter];
        pool = new Set([...pool].filter(word => comparitor.has(word)));
      }
    }

    // Finally eliminate all words from the pool and future consideration where
    // we know the letter is not found.
    for (const deadLetterIndex of details['x']) {
      const deadLetter = guess[deadLetterIndex];
      if (pool.size > 0) {
        const contains = wordContains.get(deadLetter) || new Set<string>();
        pool = new Set([...pool].filter(word => contains.has(word)));
      }

      // Remove all words from the "grouped" list with that letter in any position
      for (let i = 0; i < 2; i++) {
        delete grouped[i][deadLetter];
      }

      // Remove all words from the "wordContains" list with that letter
      // Can't just delete from "wordContains" though because those words are
      // repeated. Instead, create a new "wordContains" list by filtering out the
      // initial word list.
      const contains = wordContains.get(deadLetter) || new Set<string>();
      const temp: string[] = words.filter(word => !contains.has(word));
      wordContains = new Map<string, Set<string>>();
      for (const word of temp) {
        for (let i = 0; i < 2; i++) {
          const letter = word[i];
          let temp = wordContains.get(letter) || new Set<string>();
          temp.add(word);
          wordContains.set(letter, temp);
        }
      }
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
      pool = wordContains.get([...wordContains.keys()][0]) || new Set<string>();
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

function _wordleColors(results: string[]): string {
  const colors: { [key: string]: string; } = {
    x: String.fromCodePoint(11036),
    y: String.fromCodePoint(129000),
    g: String.fromCodePoint(129001)
  };
  return results.map(x => colors[x]).join('');
}

wordle();