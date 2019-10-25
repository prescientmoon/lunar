import { ImportanceSequence } from '../classes/ImportanceSequence'

export enum operators {
    add = '+',
    substract = '-',
    multiply = '*',
    divide = '/',
    divideBy = ':',
    modulo = '%',
    assign = '=',
    bitwiseAnd = '&',
    bitwiseOr = '|',
    bitwiseXor = '^',
    and = '&&',
    or = '||',
    xor = '^^',
    smaller = '<',
    smallerOrEqual = '<=',
    greater = '>',
    greaterOrEqual = '>=',
    equal = '==',
    notEqual = '!=',
    not = '!',
    walrus = ':=',
    power = '**'
}

export const operatorValues = Object.values(operators)
export const unary = [operators.not, operators.substract] as const

export type unaryOperator = operators.not | operators.substract

const sequence = new ImportanceSequence()

export const operatorImportance: Record<operators, number> = {
    [operators.assign]: sequence.last(),
    [operators.walrus]: sequence.next(),
    [operators.or]: sequence.next(),
    [operators.xor]: sequence.next(),
    [operators.and]: sequence.next(),
    [operators.smaller]: sequence.next(),
    [operators.greater]: sequence.last(),
    [operators.smallerOrEqual]: sequence.last(),
    [operators.greaterOrEqual]: sequence.last(),
    [operators.equal]: sequence.last(),
    [operators.notEqual]: sequence.last(),
    [operators.bitwiseOr]: sequence.next(),
    [operators.bitwiseXor]: sequence.next(),
    [operators.bitwiseAnd]: sequence.next(),
    [operators.add]: sequence.next(),
    [operators.substract]: sequence.last(),
    [operators.multiply]: sequence.next(),
    [operators.divide]: sequence.last(),
    [operators.divideBy]: sequence.last(),
    [operators.modulo]: sequence.last(),
    [operators.power]: sequence.next(),
    [operators.not]: sequence.next()
}
