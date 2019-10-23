import { tokens, TokenValueMap } from '../constants/Tokens'
import { Ast, AstNodeType } from '../types/Ast'

export class Token<T extends tokens = tokens> {
    public constructor(public type: T, public value: TokenValueMap[T]) {}

    public name() {
        return tokens[this.type]
    }

    public toAstNode(): Ast {
        if (this.type === tokens.string) {
            return {
                type: AstNodeType.string,
                value: this.value as string
            }
        } else if (this.type === tokens.variable) {
            return {
                type: AstNodeType.variable,
                value: this.value as string
            }
        } else if (this.type === tokens.number) {
            return {
                type: AstNodeType.number,
                value: this.value as number
            }
        } else
            throw new Error(
                `Cannot convert token to Ast node: ${JSON.stringify(this)}`
            )
    }
}
