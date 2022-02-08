import { union, difference, intersect } from './helpers';

export class WordList {
  protected groupings: Map<string, Set<string>>[];
  protected words: Set<string>;
  public size: number = 0;
  private readonly wordLength: number = 0;
  protected wordsWithLetter: Map<string, Set<string>>;

  constructor(words: string[]) {
    this.wordLength = words[0].length;
    if (!words.every(w => w.length === this.wordLength)) throw new Error('All words must be the same length.');
    this.words = new Set<string>(words);
    this.regenerateList();
  }

  /**
   * Removes all words with the given letter from the word list.
   * @param letter The letter to remove
   */
  public removeLetter(letter: string): void {
    const wordsWith = this.containsAny(letter);
    this.words = difference(this.words, wordsWith);
    this.regenerateList();
  }

  /**
   * Return a list of all words containing the given letter regardless of position.
   * @param letter The letter to search for.
   */
  public containsAny(letter: string): Set<string> {
    if (this.words.size === 0) throw new Error('Word list is empty.');
    return this.wordsWithLetter.get(letter) || new Set<string>();
  }

  /**
   * Return a list of all words containing the given letter in the given position.
   * @param letter The letter to search for.
   * @param index The index at which to search.
   */
  public containsAtIndex(letter: string, index: number): Set<string> {
    if (this.words.size === 0) throw new Error('Word list is empty.');
    return this.groupings[index][letter] || new Set<string>();
  }

  /**
   * Process the results of a guess.
   * @param guess The guess that generated the results.
   * @param results The results of a guess; must contain ONLY 'x', 'g', and 'y' and must match the length of the guess.
   */
  public processExternalResult(guess: string, results: string[]): void {
    // Validate input.
    if (results.length !== this.wordLength) throw new Error('Results length must match the word length.');
    if (!results.every(r => r === 'x' || r === 'g' || r === 'y')) throw new Error('Results must include ONLY "x", "g", and "y" values.');
    if (guess.length !== this.wordLength) throw new Error('Supplied guess is not the same length as the words in the word list.');

    // Convert the results into an object mapping.
    const details: { [key: string]: number[] } = { x: [], y: [], g: [] };
    results.forEach((result, index) => details[result].push(index));

    // Remove all words based on 'x' values.
    if (details['x'].length) {
      const toRemove = union(...details['x'].map(i => guess[i]).map(letter => this.wordsWithLetter.get(letter) || new Set<string>()));
      if (toRemove.size > 0) {
        const prevWordsSize = this.words.size;
        this.words = difference(this.words, toRemove);
        const afterWordsSize = this.words.size;
        if (prevWordsSize !== afterWordsSize) this.regenerateList();
      }
    }

    // Filter the list to words that include 'y' and have 'g' in specific positions.
    if (details['g'].length) {
      const mustHave = intersect(...details['g'].map(position => this.containsAtIndex(guess[position], position)));
      if (mustHave.size > 0) {
        const prevWordsSize = this.words.size;
        this.words = intersect(this.words, mustHave);
        this.regenerateList();
        const afterWordsSize = this.words.size;
        if (prevWordsSize !== afterWordsSize) this.regenerateList();
      }
    }


    if (details['y'].length) {
      let mustHave = intersect(...details['y'].map(i => this.containsAny(guess[i])));
      mustHave = difference(mustHave, ...details['y'].map(i => this.containsAtIndex(guess[i], i)));
      if (mustHave.size > 0) {
        const prevWordsSize = this.words.size;
        this.words = intersect(this.words, mustHave);
        const afterWordsSize = this.words.size;
        if (prevWordsSize !== afterWordsSize) this.regenerateList();
      }
    }
  }

  /**
   * Get a random word from the list.
   * @param mustContain A list of letters that the random word must contain.
   * @returns A word from the list.
   */
  public getRandomWord(...mustContain: string[]): string {
    if (this.words.size > 0) {
      let pool: Set<string>;
      if (mustContain.length > 0) {
        pool = intersect(...mustContain.map(letter => this.containsAny(letter)));
      } else {
        pool = this.words;
      }
      return [...pool][Math.floor(Math.random() * this.words.size)];
    }
    throw new Error('Cannot get random word from empty list.');
  }

  /**
   * Regenerate the groupings list based on the current list of words available.
   */
  private regenerateList(): void {
    this.groupings = [];
    this.wordsWithLetter = new Map<string, Set<string>>();
    for (let word of this.words) {
      for (let i = 0; i < this.wordLength; i++) {
        // Populate the groupings object.
        if (this.groupings.length !== this.wordLength) this.groupings.push(new Map<string, Set<string>>());
        const letter = word[i];
        if (!(letter in this.groupings[i])) this.groupings[i][letter] = new Set<string>();
        this.groupings[i][letter].add(word);

        // Populate the wordsWithLetter object.
        if (!this.wordsWithLetter.has(letter)) {
          this.wordsWithLetter.set(letter, new Set<string>([word]));
        } else {
          const prev = this.wordsWithLetter.get(letter) || new Set<string>();
          prev.add(word);
          this.wordsWithLetter.set(letter, prev);
        }
      }
    }

    // Update the size property.
    this.size = this.words.size;
  }
}