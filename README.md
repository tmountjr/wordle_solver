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

## Contributing
Think you squashed a bug or figured out how to implement one of those optimizations? Open a PR! This was done over the course of a weekend and was primarily meant as a learning experience, so if there's a way to learn more, I'm all for it.

**Because this was a learning experience I didn't look too closely into issues of copyright, ownership of the word "Wordle," etc. No infringement is intended and I'll happily change things up if it's a problem.**