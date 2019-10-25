import { LunarCommand } from '../types/Command'
import { createAst } from './createAst'
import { evaluate } from './evaluate'
import { Enviroment } from '../classes/Enviroment'
import { resolve } from 'path'
import { LunarSourceReader } from '../classes/FileReader'

export const interpret = async (path: string, command: LunarCommand) => {
    const reader = new LunarSourceReader(command.logger)

    await reader.fromFile(resolve(process.cwd(), path))

    const ast = await createAst(reader, command)
    const globalEnviroment = new Enviroment(null, reader)

    globalEnviroment.define('print', console.log)

    const result = evaluate(ast, globalEnviroment)

    if (result !== undefined) {
        command.logger.log(result)
    }
}
