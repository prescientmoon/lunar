import { LunarSourceReader } from '../classes/FileReader'
import { LunarCommand } from '../types/Command'
import { createAst } from './createAst'
import { evaluate } from './evaluate'
import chalk from 'chalk'
import { logResult } from './logResult'
import { createStandardEnviroment } from './createStandardEnviroment'
import { question } from './question'
import { replCommands } from '../constants/replCommands'

export const createPlayground = (command: LunarCommand) => () => {
    console.log(
        chalk.yellow(
            `Welcome to the lunar playground! Use ':help' to see a list of all the available commands.`
        )
    )

    const reader = new LunarSourceReader(command.logger)
    const globalEnviroment = createStandardEnviroment(reader)

    let errors: number[] = []

    const execute = () =>
        Promise.resolve().then(async () => {
            errors = []

            const answer = await question('> ')

            for (const { value, exec } of replCommands) {
                if (answer.trim() === value) {
                    exec()
                    return execute()
                }
            }

            reader.exit = errors.push.bind(errors)
            reader.fromString(answer)

            const ast = await createAst(reader, command).catch(error =>
                reader.endWith(error.message)
            )

            if (errors.length) {
                return execute()
            }

            try {
                if (ast) {
                    logResult(await evaluate(ast, globalEnviroment))
                } else {
                    throw new Error('Failed to evaluate ast')
                }
            } catch (err) {
                console.error(chalk.red(err))
            }

            return execute()
        })

    return execute()
}
