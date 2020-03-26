import { ReplCommand } from '../types/ReplCommand'
import chalk from 'chalk'

export const replCommands: ReplCommand[] = [
    {
        value: ':exit',
        description: 'exit the playground',
        exec: () => process.exit(0)
    },
    {
        value: ':clear',
        description: 'clear the console',
        exec: console.clear
    },
    {
        value: ':help',
        description: 'print the descriptions of all commands',
        exec: () =>
            console.log(
                chalk.yellow(
                    replCommands
                        .map(
                            ({ value, description }) =>
                                `${value}${' '.repeat(
                                    longestCommand - value.length + 4
                                )}${description}`
                        )
                        .join('\n')
                )
            )
    }
]

const longestCommand = Math.max(
    ...replCommands.map(({ value }) => value.length)
)
