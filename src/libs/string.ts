import { Enviroment } from '../classes/Enviroment'
import { withMetadata } from '../helpers/withMetadata'

export const string = (enviroemnt: Enviroment) => {
    enviroemnt.defineConst(
        'concat',
        withMetadata(['...strings'], (...strings: string[]) => {
            return strings.reduce(
                (previous, current) => `${previous}${current}`,
                ''
            )
        })
    )
}
