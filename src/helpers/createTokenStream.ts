import { LunarCommand } from '../types/Command'
import chalk from 'chalk'
import { LunarSourceReader } from '../classes/Compiler'
import { resolve } from 'path'
import { TokenPrintData } from '../types/TokenPrintData'
import { LunarTokenReader } from '../classes/TokenReader'

export const createTokenStream = async (
    entry: string,
    program: LunarCommand
) => {
    try {
        program.logger.log(chalk.green(`Reading files...`))

        const reader = new LunarSourceReader(
            resolve(process.cwd(), entry),
            program.logger
        )

        await reader.start()

        program.logger.log(chalk.green('Parsing tokens...'))

        const tokenizer = new LunarTokenReader(reader)
        const tokens: Array<TokenPrintData> = []

        while (tokenizer.peek()) {
            const next = tokenizer.next()

            tokens.push({
                ...next,
                name: next.name()
            })
        }

        if (program.tokens) {
            program.logger.table(tokens)
        }

        reader.reset()
        tokenizer.reset()

        return new LunarTokenReader(reader)
    } catch (err) {
        console.error(chalk.red(`Error while parsing the file: ${err.message}`))
    }
}
