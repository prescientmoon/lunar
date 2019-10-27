import { Enviroment } from '../classes/Enviroment'

export const include = (
    enviroment: Enviroment,
    ...libraries: ((enviroment: Enviroment) => void)[]
) => {
    for (const library of libraries) {
        library(enviroment)
    }
}
