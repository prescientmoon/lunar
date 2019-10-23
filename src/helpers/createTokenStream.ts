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
    program.logger.log(chalk.green(`Reading files...`))

    const reader = new LunarSourceReader(
        resolve(process.cwd(), entry),
        program.logger
    )

    await reader.start()

    program.logger.log(chalk.green('Parsing tokens...'))

    try {
        const tokenizer = new LunarTokenReader(reader)

        if (program.tokens) {
            const tokens: Array<TokenPrintData> = []

            while (tokenizer.peek()) {
                const next = tokenizer.next()

                tokens.push({
                    ...next,
                    _typeName: next.typeName(),
                    _name: next.name()
                })
            }
            program.logger.table(tokens)

            reader.reset()
        }
    } catch (error) {
        reader.logError(error)
    }

    return new LunarTokenReader(reader)
}
