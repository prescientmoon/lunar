import { LunarCommand } from '../types/Command'
import { createAst } from './createAst'
import { evaluate } from './evaluate'
import { Enviroment } from '../classes/Enviroment'
import { resolve } from 'path'
import { LunarSourceReader } from '../classes/FileReader'
import { logResult } from './logResult'

export const interpret = async (path: string, command: LunarCommand) => {
    const reader = new LunarSourceReader(command.logger)

    await reader.fromFile(resolve(process.cwd(), path))

    const ast = await createAst(reader, command)
    const globalEnviroment = new Enviroment(null, reader)

    globalEnviroment.define('print', console.log)

    try {
        const result = evaluate(ast, globalEnviroment)
        logResult(result)
    } catch (error) {
        reader.endWith(error.message)
    }
}
