import { LunarCommand } from '../types/Command'
import chalk from 'chalk'
import { LunarSourceReader } from '../classes/FileReader'
import { TokenPrintData } from '../types/TokenPrintData'
import { LunarTokenReader } from '../classes/TokenReader'

export const createTokenStream = async (
    reader: LunarSourceReader,
    program: LunarCommand
) => {
    program.logger.log(chalk.green('Parsing tokens...'))

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

    return new LunarTokenReader(reader)
}
