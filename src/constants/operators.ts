import { ImportanceSequence } from '../classes/ImportanceSequence'

export interface Operator {
    value: string
    binary?: boolean
    unary?: boolean
}

export enum operatorIds {
    add,
    substract,
    multiply,
    divide,
    modulo,
    assign,
    bitwiseAnd,
    bitwiseOr,
    bitwiseXor,
    and,
    or,
    xor,
    smaller,
    smallerOrEqual,
    greater,
    greaterOrEqual,
    equal,
    notEqual,
    not,
    power,
    pipe
}

export const operators: Record<operatorIds, Operator> = {
    [operatorIds.add]: {
        value: '+',
        binary: true
    },
    [operatorIds.and]: {
        value: '&&',
        binary: true
    },
    [operatorIds.assign]: {
        value: '=',
        binary: true
    },
    [operatorIds.bitwiseAnd]: {
        value: '&',
        binary: true
    },
    [operatorIds.bitwiseOr]: {
        value: '|',
        binary: true
    },
    [operatorIds.bitwiseXor]: {
        value: '^',
        binary: true
    },
    [operatorIds.divide]: {
        value: '/',
        binary: true
    },
    [operatorIds.equal]: {
        value: '==',
        binary: true
    },
    [operatorIds.greater]: {
        value: '>',
        binary: true
    },
    [operatorIds.greaterOrEqual]: {
        value: '>=',
        binary: true
    },
    [operatorIds.modulo]: {
        value: '%',
        binary: true
    },
    [operatorIds.multiply]: {
        value: '*',
        binary: true
    },
    [operatorIds.not]: {
        value: '!',
        unary: true
    },
    [operatorIds.notEqual]: {
        value: '!=',
        binary: true
    },
    [operatorIds.or]: {
        value: '||',
        binary: true
    },
    [operatorIds.power]: {
        value: '**',
        binary: true
    },
    [operatorIds.smaller]: {
        value: '<',
        binary: true
    },
    [operatorIds.smallerOrEqual]: {
        value: '<=',
        binary: true
    },
    [operatorIds.substract]: {
        value: '-',
        binary: true,
        unary: true
    },
    [operatorIds.xor]: {
        value: '^^',
        binary: true
    },
    [operatorIds.pipe]: {
        value: '|>',
        binary: true
    }
}

export const operatorValues = Object.values(operators)
export const maxOperatorLength = Math.max(
    ...operatorValues.map(operator => operator.value.length)
)

export const unary = [operatorIds.not, operatorIds.substract] as const

export type unaryOperator = operatorIds.not | operatorIds.substract

const sequence = new ImportanceSequence()

export const operatorImportance: Record<operatorIds, number> = {
    [operatorIds.assign]: sequence.last(),
    [operatorIds.or]: sequence.next(),
    [operatorIds.xor]: sequence.next(),
    [operatorIds.and]: sequence.next(),
    [operatorIds.smaller]: sequence.next(),
    [operatorIds.greater]: sequence.last(),
    [operatorIds.smallerOrEqual]: sequence.last(),
    [operatorIds.greaterOrEqual]: sequence.last(),
    [operatorIds.equal]: sequence.last(),
    [operatorIds.notEqual]: sequence.last(),
    [operatorIds.pipe]: sequence.next(),
    [operatorIds.bitwiseOr]: sequence.next(),
    [operatorIds.bitwiseXor]: sequence.next(),
    [operatorIds.bitwiseAnd]: sequence.next(),
    [operatorIds.add]: sequence.next(),
    [operatorIds.substract]: sequence.last(),
    [operatorIds.multiply]: sequence.next(),
    [operatorIds.divide]: sequence.last(),
    [operatorIds.modulo]: sequence.last(),
    [operatorIds.power]: sequence.next(),
    [operatorIds.not]: sequence.next()
}
