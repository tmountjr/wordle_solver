import { union, difference, intersect } from './helpers';

export class WordList {
  protected groupings: Map<string, Set<string>>[] = [];
  protected wordPool: Set<string>;
  public size: number = 0;
  private readonly wordLength: number = 0;
  protected wordsWithLetter = new Map<string, Set<string>>();
  protected protectedLetters = new Set<string>();

  constructor(words: string[]) {
    this.wordLength = words[0].length;
    if (!words.every(w => w.length === this.wordLength)) throw new Error('All words must be the same length.');
    this.wordPool = new Set<string>(words);
    this.regenerateList();
  }

  /**
   * Removes all words with the given letter from the word list.
   * @param letter The letter to remove
   */
  public removeLetter(letter: string): void {
    const wordsWith = this.containsAny(letter);
    this.wordPool = difference(this.wordPool, wordsWith);
    this.regenerateList();
  }

  /**
   * Return a list of all words containing the given letter regardless of position.
   * @param letter The letter to search for.
   */
  public containsAny(letter: string): Set<string> {
    if (this.wordPool.size === 0) throw new Error('Word list is empty.');
    return this.wordsWithLetter.get(letter) || new Set<string>();
  }

  /**
   * Return a list of all words containing the given letter in the given position.
   * @param letter The letter to search for.
   * @param index The index at which to search.
   */
  public containsAtIndex(letter: string, index: number): Set<string> {
    if (this.wordPool.size === 0) throw new Error('Word list is empty.');
    return this.groupings[index].get(letter) || new Set<string>();
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
    results.forEach((result, index) => {
      details[result].push(index);

      // "Protect" any letters guessed (either yellow or green) from being removed later.
      if (result === 'y' || result === 'g') this.protectedLetters.add(guess[index]);
    });

    // Remove all words based on 'x' values.
    if (details['x'].length) {
      // Rather than blindly remove letters, make sure that we're not removing letters that we know should exist in the solution.
      const unprotectedLettersToRemove: string[] = [...difference(
        new Set<string>(details['x'].map(i => guess[i])),
        this.protectedLetters
      )];
      let toRemove = new Set<string>();
      if (unprotectedLettersToRemove.length > 0) {
        toRemove = union(...unprotectedLettersToRemove.map(letter => this.wordsWithLetter.get(letter) || new Set<string>()));
      }

      // Also remove any letters that may have been seen before but still have
      // another instance of that letter in a wrong spot.
      let temp = new Set<string>();
      details['x'].forEach(i => temp = union(temp, (this.groupings[i].get(guess[i]) || new Set<string>())));
      toRemove = union(toRemove, temp);

      if (toRemove.size > 0) {
        const prevWordsSize = this.wordPool.size;
        this.wordPool = difference(this.wordPool, toRemove);
        const afterWordsSize = this.wordPool.size;
        if (prevWordsSize !== afterWordsSize) this.regenerateList();
      }
    }

    // Filter the list to words that include 'y' and have 'g' in specific positions.
    if (details['g'].length) {
      const mustHave = intersect(...details['g'].map(position => this.containsAtIndex(guess[position], position)));
      if (mustHave.size > 0) {
        const prevWordsSize = this.wordPool.size;
        this.wordPool = intersect(this.wordPool, mustHave);
        this.regenerateList();
        const afterWordsSize = this.wordPool.size;
        if (prevWordsSize !== afterWordsSize) this.regenerateList();
      }
    }


    if (details['y'].length) {
      let mustHave = intersect(...details['y'].map(i => this.containsAny(guess[i])));
      mustHave = difference(mustHave, ...details['y'].map(i => this.containsAtIndex(guess[i], i)));
      if (mustHave.size > 0) {
        const prevWordsSize = this.wordPool.size;
        this.wordPool = intersect(this.wordPool, mustHave);
        const afterWordsSize = this.wordPool.size;
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
    if (this.wordPool.size > 0) {
      let pool: Set<string>;
      if (mustContain.length > 0) {
        pool = intersect(...mustContain.map(letter => this.containsAny(letter)));
      } else {
        pool = this.wordPool;
      }
      return [...pool][Math.floor(Math.random() * this.wordPool.size)];
    }
    throw new Error('Cannot get random word from empty list.');
  }

  /**
   * Regenerate the groupings list based on the current list of words available.
   */
  private regenerateList(): void {
    this.groupings = [];
    this.wordsWithLetter = new Map<string, Set<string>>();
    for (let word of this.wordPool) {
      for (let i = 0; i < this.wordLength; i++) {
        // Populate the groupings object.
        if (this.groupings.length !== this.wordLength) this.groupings.push(new Map<string, Set<string>>());
        const letter = word[i];
        const temp = this.groupings[i].get(letter) || new Set<string>();
        temp.add(word);
        this.groupings[i].set(letter, temp);

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
    this.size = this.wordPool.size;
  }

  /**
   * Get a list of available words (read-only).
   */
  get words(): string[] {
    return [...this.wordPool];
  }
}