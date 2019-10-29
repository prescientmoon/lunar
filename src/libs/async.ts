import { Enviroment } from '../classes/Enviroment'
import { withMetadata } from '../helpers/withMetadata'

export const async = (enviroemnt: Enviroment) => {
    enviroemnt.defineConst(
        'parallel',
        withMetadata(
            ['...functions'],
            async (...functions: (() => Promise<unknown>)[]) => {
                const result = await Promise.all(
                    functions.map(_function => _function())
                )

                return result[result.length - 1]
            }
        )
    )

    enviroemnt.defineConst(
        'race',
        withMetadata(
            ['...functions'],
            async (...functions: (() => Promise<unknown>)[]) =>
                Promise.race(functions.map(_function => _function()))
        )
    )
}
