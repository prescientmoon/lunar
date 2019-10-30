import { punctuation } from './punctuation'
import { DelimitedParsingConfig } from '../types/Skippable'

export const functionArgumentsRules: DelimitedParsingConfig = {
    start: {
        value: punctuation.openParanthesis,
        required: true
    },
    stop: {
        value: punctuation.closeParanthesis,
        required: true
    },
    separator: {
        value: punctuation.comma
    }
}

export const variableDeclarationRules: DelimitedParsingConfig = {
    separator: {
        required: true,
        value: punctuation.comma
    },
    stopEarly: true
}

export const programRules: DelimitedParsingConfig = {
    start: {
        value: punctuation.openBracket
    },
    stop: {
        value: punctuation.closeBracket
    },
    separator: {
        value: punctuation.semicolon
    }
}
