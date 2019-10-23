import { LunarCommand } from '../types/Command'
import { createTokenStream } from './createTokenStream'
import { AstBuilder } from '../classes/AstBuilder'

export const interpret = async (path: string, command: LunarCommand) => {
    const tokenStream = await createTokenStream(path, command)

    try {
        const ast = new AstBuilder(tokenStream)

        command.logger.inspect(ast.parseProgram())
    } catch (e) {
        tokenStream.input.logError(e)
    }
}
