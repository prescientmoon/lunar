import { Enviroment } from '../classes/Enviroment'
import { Ast, AstNodeType } from '../types/Ast'
import { createFunction } from './createFunction'
import { applyOperator } from './applyOperator'

const isNodeOfType = <T extends AstNodeType>(
    expression: Ast<any>,
    type: T
): expression is Ast<T> => {
    return expression.type === type
}

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
    } else if (isNodeOfType(expression, AstNodeType.binaryOperator)) {
        return applyOperator(
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

        return target.apply(null, _arguments)
    }

    throw new Error(
        `Cannot evaluate node: ${expression} with enviroment: ${enviroment}`
    )
}
