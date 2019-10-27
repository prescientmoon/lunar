import { Token } from '../classes/Token'
import { tokens } from '../constants/Tokens'

export const isTokenOfType = <T extends tokens>(
    token: Token,
    type: T
): token is Token<T> => {
    return token.type === type
}
