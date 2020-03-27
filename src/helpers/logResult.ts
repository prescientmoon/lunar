import chalk from 'chalk'
import { functionMetadata } from './createFunction'
import { withMetadata, metadata } from '../types/withMetadata'

// This file contains some of the ugliest code I've ever written

const logValue = (value: any) => console.log(chalk.green(value))

export const functionToString = (target: withMetadata<Function>) => {
    const name = target?.[metadata]?.variableName ?? ''

    return `fn ${name} (${target(functionMetadata)})`
}
export const logResult = (result: unknown) => {
    if (result instanceof Function) {
        logValue(functionToString(result as withMetadata<Function>))
    } else if (result !== undefined) {
        logValue(result)
    }
}

export const addStackToError = (old: string, target: Function, indent = 2) => {
    const lines = old.split('\n')

    return [
        ...lines,
        `${' '.repeat(indent * lines.length)}at ${chalk.underline(
            functionToString(target as withMetadata<Function>)
        )}`
    ].join('\n')
}
