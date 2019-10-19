import { tokens, TokenValueMap } from '../constants/Tokens'

export class Token<T extends tokens = tokens> {
    public constructor(public type: T, public value: TokenValueMap[T]) {}

    public name() {
        return tokens[this.type]
    }
}
