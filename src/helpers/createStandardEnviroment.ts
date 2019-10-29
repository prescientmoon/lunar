import { LunarSourceReader } from '../classes/FileReader'
import { Enviroment } from '../classes/Enviroment'
import { include } from './include'
import { inputOutput } from '../libs/io'
import { math } from '../libs/math'
import { cast } from '../libs/cast'
import { string } from '../libs/string'
import { async } from '../libs/async'
import { time } from '../libs/time'

export const createStandardEnviroment = (reader: LunarSourceReader) => {
    const enviroment = new Enviroment(null, reader)

    include(enviroment, inputOutput, math, cast, string, async, time)

    return enviroment
}
