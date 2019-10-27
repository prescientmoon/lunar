import { LunarSourceReader } from '../classes/FileReader'
import { Enviroment } from '../classes/Enviroment'
import { include } from './include'
import { inputOutput } from '../libs/io'

export const createStandardEnviroment = (reader: LunarSourceReader) => {
    const enviroment = new Enviroment(null, reader)

    include(enviroment, inputOutput)

    return enviroment
}
