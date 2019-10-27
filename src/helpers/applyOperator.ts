import { operatorIds, unaryOperator } from '../constants/operators'
import { Enviroment } from '../classes/Enviroment'
import { Ast, AstNodeBody, AstNodeType } from '../types/Ast'
import { isNodeOfType } from './isNodeOfType'

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

export const applyUnaryOperator = (operator: unaryOperator, body: unknown) => {
    // TODO: refactor

    if (operator === operatorIds.substract) {
        return -toNumber(body)
    } else if (operator === operatorIds.not) {
        return !body
    }

    throw new Error(`Can't apply operator ${operator}`)
}

export const applyBinaryOperator = (
    operator: operatorIds,
    left: unknown,
    right: unknown
) => {
    // TODO: refactor

    if (operator === operatorIds.add) {
        return toNumber(left) + toNumber(right)
    } else if (operator === operatorIds.substract) {
        return toNumber(left) - toNumber(right)
    } else if (operator === operatorIds.multiply) {
        return toNumber(left) * toNumber(right)
    } else if (operator === operatorIds.divide) {
        return toNumber(left) / div(right)
    } else if (operator === operatorIds.modulo) {
        return toNumber(left) % div(right)
    } else if (operator === operatorIds.power) {
        return toNumber(left) ** toNumber(right)
    } else if (operator === operatorIds.bitwiseAnd) {
        return toNumber(left) & toNumber(right)
    } else if (operator === operatorIds.bitwiseOr) {
        return toNumber(left) | toNumber(right)
    } else if (operator === operatorIds.bitwiseXor) {
        return toNumber(left) ^ toNumber(right)
    } else if (operator === operatorIds.and) {
        return left && right
    } else if (operator === operatorIds.or) {
        return left || right
    } else if (operator === operatorIds.xor) {
        return (left || right) && !(left && right)
    } else if (operator === operatorIds.smaller) {
        return toNumber(left) < toNumber(right)
    } else if (operator === operatorIds.greater) {
        return toNumber(left) > toNumber(right)
    } else if (operator === operatorIds.smallerOrEqual) {
        return toNumber(left) <= toNumber(right)
    } else if (operator === operatorIds.greaterOrEqual) {
        return toNumber(left) >= toNumber(right)
    } else if (operator === operatorIds.equal) {
        return left === right
    } else if (operator === operatorIds.notEqual) {
        return left !== right
    }

    throw new Error(`Can't apply operator ${operator}`)
}
