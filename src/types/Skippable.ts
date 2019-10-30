import { punctuation } from '../constants/punctuation'

export interface Skippable {
    required?: boolean
    value: punctuation
}

export type DelimitedParsingConfig = Partial<{
    start: Skippable
    stop: Skippable
    separator: Skippable
    stopEarly: boolean
}>
