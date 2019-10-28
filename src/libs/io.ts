import { Enviroment } from '../classes/Enviroment'
import { withMetadata } from '../helpers/withMetadata'
import { question } from '../helpers/question'

export const inputOutput = (enviroemnt: Enviroment) => {
    enviroemnt.defineConst(
        'print',
        withMetadata(['...strings'], (...strings: string[]) => {
            process.stdout.write(
                Buffer.from(
                    strings.reduce(
                        (previous, current) => previous + current.toString(),
                        ''
                    )
                )
            )
        })
    )

    enviroemnt.defineConst('clear', withMetadata([], console.clear))
    enviroemnt.defineConst('println', withMetadata(['...strings'], console.log))
    enviroemnt.defineConst('question', withMetadata(['query'], question))
    enviroemnt.defineConst('exit', withMetadata(['code'], process.exit))
}
