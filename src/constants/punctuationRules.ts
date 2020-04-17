import { punctuation as p } from './punctuation'
import { DelimitedParsingConfig } from '../types/Skippable'

export const functionArgumentsRules: DelimitedParsingConfig = {
    start: [p.openParenthesis, true],
    stop: p.closeParenthesis,
    separator: p.comma
}

export const variableDeclarationRules: DelimitedParsingConfig = {
    separator: [p.comma, true],
    stopEarly: true
}

export const programRules: DelimitedParsingConfig = {
    start: p.openBracket,
    stop: p.closeBracket,
    separator: p.semicolon
}
