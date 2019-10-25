import { LunarCommand } from '../types/Command'
import { AstBuilder } from '../classes/AstBuilder'
import { createTokenStream } from './createTokenStream'
import { LunarSourceReader } from '../classes/FileReader'

export const createAst = async (
    reader: LunarSourceReader,
    command: LunarCommand
) => {
    const tokenStream = await createTokenStream(reader, command)
    const astBuilder = new AstBuilder(tokenStream)
    const ast = astBuilder.parseProgram()

    if (command.ast) {
        command.logger.inspect(ast)
    }

    return ast
}
