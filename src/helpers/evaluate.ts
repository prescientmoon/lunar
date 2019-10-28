import { Enviroment } from '../classes/Enviroment'
import { Ast, AstNodeType } from '../types/Ast'
import { createFunction } from './createFunction'
import { applyBinaryOperator, applyUnaryOperator } from './applyOperator'
import { isNodeOfType } from './isNodeOfType'
import { addStackToError } from './logResult'

export const evaluate = async <T extends AstNodeType>(
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
            await evaluate(expression.body, enviroment)
        )
    } else if (isNodeOfType(expression, AstNodeType.binaryOperator)) {
        return await applyBinaryOperator(
            expression.operator,
            await evaluate(expression.left, enviroment),
            await evaluate(expression.right, enviroment)
        )
    } else if (isNodeOfType(expression, AstNodeType.anonymousFunction)) {
        return createFunction(enviroment, expression, evaluate)
    } else if (isNodeOfType(expression, AstNodeType.conditional)) {
        const condition = await evaluate(expression.condition, enviroment)

        if (condition) {
            return await evaluate(expression.then, enviroment)
        } else if (expression.else) {
            return await evaluate(expression.else, enviroment)
        }

        return false
    } else if (isNodeOfType(expression, AstNodeType.program)) {
        const scope = enviroment.extend()

        let result = 0

        for (const line of expression.program) {
            result = await evaluate(line, scope)
        }

        return result
    } else if (isNodeOfType(expression, AstNodeType.functionCall)) {
        const target = await evaluate(expression.target, enviroment)

        if (!(target instanceof Function)) {
            throw new Error(`${target} is not a function`)
        }

        const _arguments: unknown[] = []

        for (const argument of Array.from(expression.arguments)) {
            _arguments.push(await evaluate(argument, enviroment))
        }

        try {
            return target(..._arguments)
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
            await evaluate(expression.right, enviroment)
        )
    } else if (isNodeOfType(expression, AstNodeType.define)) {
        let currentReturn: unknown = false

        for (const { name, constant, initialValue } of expression.variables) {
            currentReturn = enviroment.define(name, {
                constant,
                value: await evaluate(initialValue, enviroment)
            })
        }

        return currentReturn
    }

    throw new Error(`Cannot evaluate node: ${JSON.stringify(expression)}`)
}
