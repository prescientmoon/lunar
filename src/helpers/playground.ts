import { LunarSourceReader } from '../classes/FileReader'
import { LunarCommand } from '../types/Command'
import { Enviroment } from '../classes/Enviroment'
import { createInterface } from 'readline'
import { createAst } from './createAst'
import { evaluate } from './evaluate'
import chalk from 'chalk'
import { logResult } from './logResult'

export const playground = (command: LunarCommand) => async () => {
    const readline = createInterface({
        input: process.stdin,
        output: process.stdout
    })

    command.silent = true

    const question = (question: string) =>
        new Promise<string>(resolve => {
            readline.question(question, resolve)
        })

    const reader = new LunarSourceReader(command.logger)

    const globalEnviroment = new Enviroment(null, reader)
    globalEnviroment.define('print', console.log)

    let errors: number[] = []

    while (true) {
        const answer = await question('> ')

        reader.exit = errors.push.bind(errors)
        reader.fromString(answer)

        const ast = await createAst(reader, command)

        if (errors.length) {
            continue
        }

        try {
            logResult(evaluate(ast, globalEnviroment))
        } catch (err) {
            console.error(chalk.red(err))
        }
    }
}
