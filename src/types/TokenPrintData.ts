import { tokens } from '../constants/Tokens'
import { Token } from '../classes/Token'

export interface TokenPrintData<T extends Token = Token> {
    type: Token['type']
    value: Token['value']
    name: ReturnType<T['name']>
}
