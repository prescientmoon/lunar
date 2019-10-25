import { operators } from '../constants/operators'

const toNumber = (x: unknown) => {
    if (typeof x !== 'number') {
        throw new Error(`Expected number but got ${JSON.stringify(x)}`)
    }

    return x
}

const div = (x: unknown) => {
    if (toNumber(x) === 0) {
        throw new Error('Cannot divide by zero')
    }

    return toNumber(x)
}

export const applyOperator = (
    operator: operators,
    left: unknown,
    right: unknown
) => {
    switch (operator) {
        case operators.add:
            return toNumber(left) + toNumber(right)
        case operators.substract:
            return toNumber(left) - toNumber(right)
        case operators.multiply:
            return toNumber(left) * toNumber(right)
        case operators.divide:
            return toNumber(left) / div(right)
        case operators.modulo:
            return toNumber(left) % div(right)
        case operators.power:
            return toNumber(left) ** toNumber(right)
        case operators.bitwiseAnd:
            return toNumber(left) & toNumber(right)
        case operators.bitwiseOr:
            return toNumber(left) | toNumber(right)
        case operators.bitwiseXor:
            return toNumber(left) ^ toNumber(right)
        case operators.and:
            return left && right
        case operators.or:
            return left || right
        case operators.xor:
            return (left || right) && !(left && right)
        case operators.smaller:
            return toNumber(left) < toNumber(right)
        case operators.greater:
            return toNumber(left) > toNumber(right)
        case operators.smallerOrEqual:
            return toNumber(left) <= toNumber(right)
        case operators.greaterOrEqual:
            return toNumber(left) >= toNumber(right)
        case operators.equal:
            return left === right
        case operators.notEqual:
            return left !== right
    }

    throw new Error(`Can't apply operator ${operator}`)
}
