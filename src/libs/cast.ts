import { Enviroment } from '../classes/Enviroment'
import { withMetadata } from '../helpers/withMetadata'

export const cast = (enviroemnt: Enviroment) => {
    enviroemnt.defineConst(
        'int',
        withMetadata(['value'], (x: unknown) => {
            return Math.floor(Number(x))
        })
    )

    enviroemnt.defineConst('float', withMetadata(['value'], Number))
    enviroemnt.defineConst('string', withMetadata(['value'], String))
}
