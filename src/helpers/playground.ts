import { LunarSourceReader } from '../classes/FileReader'
import { LunarCommand } from '../types/Command'
import { createInterface, Interface } from 'readline'
import { createAst } from './createAst'
import { evaluate } from './evaluate'
import chalk from 'chalk'
import { logResult } from './logResult'
import { createStandardEnviroment } from './createStandardEnviroment'
import { question } from './question'

export const createPlayground = (command: LunarCommand) => () => {
    const reader = new LunarSourceReader(command.logger)
    const globalEnviroment = createStandardEnviroment(reader)

    let errors: number[] = []

    const execute = () =>
        setTimeout(async () => {
            const answer = await question('> ')

            if (answer === '.exit') {
                return
            }

            reader.exit = errors.push.bind(errors)
            reader.fromString(answer)

            const ast = await createAst(reader, command)

            if (errors.length) {
                errors = []
                return execute()
            }

            try {
                logResult(await evaluate(ast, globalEnviroment))
            } catch (err) {
                console.error(chalk.red(err))
            }

            execute()
        }, 0)

    return execute()
}
