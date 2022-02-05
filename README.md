# Wordle Solver
Small-ish TypeScript implementation of Wordle logic. In a nutshell, pick a word, see if any letters are exact matches (represented by a green square), misplaced (represented by a yellow square), or simply not found. Based on that set of results, make a new guess. Keep going until you guess the word or run out of tries.

## Known bugs
* If a word contains the same letter twice, the system might throw an error.
* Occasionally the word list will end up empty before all the guesses have been used.

## Potential Optimizations
* Seems like the set theory operations (`union`, `intersect`, and `difference`) could possibly be optimized since they ultimately rely on converting to and from arrays.
* The methods in `WordList` could be optimized to accept a range of letters rather than doing set operations one letter at a time.
* I keep thinking there's a more efficient way of storing the word list that doesn't involve `n` separate `Map` objects but I haven't come up with anything cleaner so far.

## Running
1. Clone the repo locally.
1. Run `npm install`.
1. Run `npm run start` to kick off the program.
1. Repeat.

## Underlying Set Theory
Every move ends up being an exercise in set theory. Before the first move is taken, the set of available words is the entire list of 5-letter English words. As soon as a guess is registered, we can start whittling down the set.

First thing we do is collect all the letters we know do not appear in the solution at all and remove them from the list of candidate words. In set terms, we take the **difference** of A (the main list of words) and B (all the words that contain letters we know do not appear in the final solution).

Second thing we do is look at the letters that we know are in the proper position. If there is more than one letter in the proper position, we take the **intersection** of the subsets where the `n`th character of a candidate word matches the letter we know is in that position.

Finally we look at the letters that we know exist in the solution but are not yet in the proper place. We once again take the **intersection** of the subset yielded in the previous result, this time comparing it with all words that have those letters in the proper positions _and_ contain the other letters we know are in the final solution.

Depending on how many words were removed, this can substantially constrain the list of words. For each subsequent step, we go through the same operations, first removing non-candidates and then filtering the resulting pool of candidate words. After 5 steps the pool of words ideally will have shrunk from tens of thousands of words to less then a dozen.

## Implementation
The `WordList` class is instantiated with an array of words to be used as the original list of candidate words. This list is converted into a `Set` and stored as a protected member of the class.

Since looping through potentially thousands of words initially is computationally expensive, we want to do it as few times as possible (ideally only once). Borrowing a trick fom non-relational NoSQL databases, when we instantiate the `Set`, we can analyze each word in turn and pre-compute some subsets. Specifically, the class stores `Map` objects for each ordinal position of the word, the key of which is the letter at that position and the value of which is another `Set` of words having that letter at that position. Take a three-word list as an example:

```
// words: ['car', 'con', 'bar']
[
  {
    'c': ['car', 'con'],
    'b': ['bar']
  },
  {
    'a': ['car', 'bar'],
    'o': ['con']
  },
  {
    'r': ['car', 'bar'],
    'n': ['con']
  }
]
```

With this data structure it is possible to find any word with any letter in any ordinal position, eg. `list[1]['a']` returns all words with `a` in the second position (zero-based), while `list[2]['n']` returns all words ending in `n`.

In a future release it's likely the class will contain a second pre-computed set: a list of words containing a given letter in _any_ position:
```
{
  'c': ['car', 'con'],
  'a': ['car', 'bar'],
  'r': ['car', 'bar'],
  'o': ['con'],
  'n': ['con'],
  'b': ['bar']
}
```

Without this list, the only way to generate a list of all words containing 'a' would be to take the **union** of `list[0]['a']...list[n]['a']`.

The class also has the ability to remove all words with a given letter from the main list and then re-calculate the pre-computed lists based on the new list of words.

Another potential optimization, especially around minimizing the number of guesses, might be to keep track of a third subset of data: the number of times a letter appears in the overall set:
```
{
  'c': 2,
  'a': 2,
  'r': 2,
  'o': 1,
  'n': 1,
  'b': 1
}
```

This data could help inform what letter to use when picking the starting letter for the next word by choosing the most commonly-used letter still available in the next guess.

Finally the class provides a way to select a random word from the list of words after all the set operations have been completed and the list of words has been trimmed down; this guess is the seed for the next round.

## Contributing
Think you squashed a bug or figured out how to implement one of those optimizations? Open a PR! This was done over the course of a weekend and was primarily meant as a learning experience, so if there's a way to learn more, I'm all for it.

**Because this was a learning experience I didn't look too closely into issues of copyright, ownership of the word "Wordle," etc. No infringement is intended and I'll happily change things up if it's a problem.**
