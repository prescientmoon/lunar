import { operators } from './operators'
import { keyword } from './keywords'

export enum tokens {
    number,
    keyword,
    variable,
    operator,
    string,
    punctuation
}

export type TokenValueMap = {
    [tokens.number]: number
    [tokens.keyword]: keyword
    [tokens.variable]: string
    [tokens.operator]: operators
    [tokens.string]: string
    [tokens.punctuation]: string
}
