import { tokens, TokenValueMap } from '../constants/Tokens'
import { Ast, AstNodeType } from '../types/Ast'
import { operatorIds } from '../constants/operators'
import { punctuation } from '../constants/punctuation'

export class Token<T extends tokens = tokens> {
    public constructor(public type: T, public value: TokenValueMap[T]) {}

    public typeName() {
        return tokens[this.type]
    }

    /**
     * Returns the name of the token. Only used for logging.
     * Do not use for actual checking of the type.
     */
    public name() {
        try {
            switch (this.type) {
                case tokens.keyword:
                    return this.value
                case tokens.number:
                    return 'number'
                case tokens.string:
                    return 'string'
                case tokens.variable:
                    return 'variable'
                // We can use '!' beause the errors are caught at runtime by the catch block.
                case tokens.operator:
                    return Object.entries(operatorIds).find(
                        ([, value]) => value === this.value
                    )![0]
                case tokens.punctuation:
                    return Object.entries(punctuation).find(
                        ([, value]) => value === this.value
                    )![0]
            }
        } catch (error) {
            console.error(
                `Encountered an error while searching for the name of ${this.value}: ${error.message}`
            )
        }

        throw new Error(`Cannot get name for token ${JSON.stringify(this)}`)
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
