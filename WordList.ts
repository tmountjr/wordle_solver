import { union, difference, intersect } from './helpers';

export class WordList {
  protected groupings: Map<string, Set<string>>[];
  protected words: Set<string>;
  public size: number = 0;
  private readonly wordLength: number = 0;

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
    return union(...this.groupings.map(v => v[letter]).filter(x => x));
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
    for (let word of this.words) {
      for (let i = 0; i < this.wordLength; i++) {
        if (this.groupings.length !== this.wordLength) this.groupings.push(new Map<string, Set<string>>());
        const letter = word[i];
        if (!(letter in this.groupings[i])) this.groupings[i][letter] = new Set<string>();
        this.groupings[i][letter].add(word);
      }
    }
    this.size = this.words.size;
  }
}