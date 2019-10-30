import { Enviroment } from '../classes/Enviroment'
import { withMetadata } from '../helpers/withMetadata'
import { sleep } from '../helpers/sleep'
import { performance } from 'perf_hooks'

export const time = (enviroemnt: Enviroment) => {
    const start = performance.now()

    enviroemnt.defineConst(
        'sleep',
        withMetadata(['seconds'], (time: number) => sleep(time * 1000))
    )

    enviroemnt.defineConst(
        'now',
        withMetadata([], () => performance.now() - start)
    )
}
