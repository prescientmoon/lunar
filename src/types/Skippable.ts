import { punctuation } from '../constants/punctuation'

const { isArray } = Array

export type Skippable = punctuation | [punctuation, boolean]

export const skippableValue = (x: Skippable): punctuation =>
    isArray(x) ? x[0] : x

export type DelimitedParsingConfig = Partial<{
    start: Skippable
    stop: Skippable
    separator: Skippable
    stopEarly: boolean
}>
