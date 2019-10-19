export enum punctuation {
    'comma' = ',',
    'semicolon' = ';',
    'openParanthesis' = '(',
    'closeParanthesis' = ')',
    'openBracket' = '{',
    'closeBracket' = '}',
    'openSquareBracket' = '[',
    'closeSquareBracket' = ']'
}

export const punctuationValues = Object.values(punctuation).filter(
    current => current.length === 1
)
