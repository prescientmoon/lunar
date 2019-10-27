import { Enviroment } from '../classes/Enviroment'

export const inputOutput = (enviroemnt: Enviroment) => {
    enviroemnt.defineConst('print', (...strings: string[]) => {
        process.stdout.write(
            strings.reduce(
                (previous, current) => previous + current.toString(),
                ''
            )
        )
    })

    enviroemnt.defineConst('println', console.log)
    enviroemnt.defineConst('clear', console.clear)
}
