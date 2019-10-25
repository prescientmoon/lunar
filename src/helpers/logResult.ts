import chalk from 'chalk'
import { functionMetadata } from './createFunction'

// This file contains some of the ugliest code I've ever written

const logValue = (value: any) => console.log(chalk.green(value))

export const logResult = (result: unknown) => {
    if (result instanceof Function) {
        logValue(`fn (${result(functionMetadata)})`)
    } else if (result !== undefined) {
        logValue(result)
    }
}
