import { functionMetadata } from './createFunction'

export const withMetadata = <T extends unknown[], R>(
    names: string[],
    target: (...args: T) => Promise<R> | R
) => (...params: T) => {
    if (params[0] === functionMetadata) {
        return names
    } else {
        return target(...params)
    }
}
