import * as Inquirer from 'inquirer'
import { WordList } from './WordList'

const quitCode = 'q'

async function main(): Promise<void> {
  const wordList = new WordList(require('./words.json'))
  let guessResults = 'xxxxx'
  while (wordList.size > 0 && guessResults !== 'ggggg') {

   const round = await Inquirer.prompt([
      {
        name: 'guess',
        type: 'input',
        message: 'Enter a guess or "q" to quit:',
        default: quitCode,
        validate: validGuess,
      }, {
        name: 'results',
        type: 'input',
        message: 'Enter the results of this guess:',
        transformer: (input: string): string => {
          input = input.replace(/[^xyg]/ig, '-')
          const colors: { [key: string]: string; } = {
            x: String.fromCodePoint(11036),
            y: String.fromCodePoint(129000),
            g: String.fromCodePoint(129001),
            '-': String.fromCodePoint(10060)
          };
          return input.split('').map(letter => colors[letter]).join('')
        },
        validate: validResult,
        when: (answers: { [key: string]: string }) => answers.guess !== quitCode
      }
    ])
    const guess = round.guess
    guessResults = round.results

    if (guess === quitCode) break
    wordList.processExternalResult(guess, guessResults.split(''))
    
    const { show } = await Inquirer.prompt({
      name: 'show',
      type: 'confirm',
      message: `There are now ${wordList.size} words remaining in the list. Show them?`,
      default: false,
      when: () => guessResults !== 'ggggg',
    })

    if (show) {
      console.log(wordList.words)
    }
  }

  console.log('App finished.')
}

/**
 * Check if a guess is valid.
 * @param input The guess to process.
 * @returns True if the guess is valid, or an error string if it is invalid.
 */
async function validGuess(input: string): Promise<boolean|string> {
  if (input === quitCode) return true
  if (input.length !== 5) return 'Guess must be five characters.'
  if (!/[A-Za-z]+/.test(input)) return 'Guess must contain only the letters A-Z.'

  return true;
}

/**
 * Check if a result is valid.
 * @param input The result to process.
 * @returns True if the result is valid, or an error string if it is invalid.
 */
async function validResult(input: string): Promise<boolean|string> {
  if (input.length !== 5) return 'Result must be five characters.'
  if (!/^[xyg]+$/i.test(input)) return 'Result must be made up of "x", "y", or "g" only.'

  return true
}

main()