import { Ast, AstNodeType } from '../types/Ast'

export const isNodeOfType = <T extends AstNodeType>(
    expression: Ast<any>,
    type: T
): expression is Ast<T> => {
    return expression.type === type
}
