import { Enviroment } from '../classes/Enviroment'
import { Ast, AstNodeType } from '../types/Ast'
import { createFunction } from './createFunction'
import { applyBinaryOperator, applyUnaryOperator } from './applyOperator'
import { isNodeOfType } from './isNodeOfType'
import { addStackToError } from './logResult'

export const evaluate = <T extends AstNodeType>(
    expression: Ast<T>,
    enviroment: Enviroment
) => {
    if (
        isNodeOfType(expression, AstNodeType.string) ||
        isNodeOfType(expression, AstNodeType.number) ||
        isNodeOfType(expression, AstNodeType.boolean)
    ) {
        return expression.value
    } else if (isNodeOfType(expression, AstNodeType.variable)) {
        return enviroment.get(expression.value)
    } else if (isNodeOfType(expression, AstNodeType.unaryOperator)) {
        return applyUnaryOperator(
            expression.operator,
            evaluate(expression.body, enviroment)
        )
    } else if (isNodeOfType(expression, AstNodeType.binaryOperator)) {
        return applyBinaryOperator(
            expression.operator,
            evaluate(expression.left, enviroment),
            evaluate(expression.right, enviroment)
        )
    } else if (isNodeOfType(expression, AstNodeType.anonymousFunction)) {
        return createFunction(enviroment, expression, evaluate)
    } else if (isNodeOfType(expression, AstNodeType.conditional)) {
        const condition = evaluate(expression.condition, enviroment)

        if (condition) {
            return evaluate(expression.then, enviroment)
        } else if (expression.else) {
            return evaluate(expression.else, enviroment)
        }

        return false
    } else if (isNodeOfType(expression, AstNodeType.program)) {
        let result = 0

        for (const line of expression.program) {
            result = evaluate(line, enviroment)
        }

        return result
    } else if (isNodeOfType(expression, AstNodeType.functionCall)) {
        const target = evaluate(expression.target, enviroment) as Function
        const _arguments = expression.arguments.map(argument =>
            evaluate(argument, enviroment)
        )

        try {
            return target.apply(null, _arguments)
        } catch (error) {
            throw new Error(addStackToError(error.message as string, target))
        }
    } else if (isNodeOfType(expression, AstNodeType.assign)) {
        if (!isNodeOfType(expression.left, AstNodeType.variable)) {
            throw new Error(
                `Cannot assign to: ${JSON.stringify(expression.left)}`
            )
        }

        return enviroment.set(
            expression.left.value,
            evaluate(expression.right, enviroment)
        )
    } else if (isNodeOfType(expression, AstNodeType.define)) {
        let currentReturn: unknown = false

        for (const { name, constant, initialValue } of expression.variables) {
            currentReturn = enviroment.define(name, {
                constant,
                value: evaluate(initialValue, enviroment)
            })
        }

        return currentReturn
    }

    throw new Error(`Cannot evaluate node: ${JSON.stringify(expression)}`)
}
