import { Enviroment } from '../classes/Enviroment'

export const inputOutput = (enviroemnt: Enviroment) => {
    enviroemnt.defineConst('print', (strings: string[]) => {
        for (const string of strings) {
            process.stdout.write(string)
        }
    })

    enviroemnt.defineConst('printLn', console.log)
}
