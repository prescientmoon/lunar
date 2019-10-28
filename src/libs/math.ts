import { Enviroment } from '../classes/Enviroment'
import { withMetadata } from '../helpers/withMetadata'

export const math = (enviroemnt: Enviroment) => {
    enviroemnt.defineConst(
        'randomInt',
        withMetadata(['min', 'max'], (min: number, max: number) => {
            return min + Math.floor(Math.random() * (max - min))
        })
    )
}
