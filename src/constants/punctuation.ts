export enum punctuation {
    comma = ',',
    semicolon = ';',
    openParenthesis = '(',
    closeParenthesis = ')',
    openBracket = '{',
    closeBracket = '}',
    openSquareBracket = '[',
    closeSquareBracket = ']'
}

export const punctuationValues = Object.values(punctuation).filter(
    current => current.length === 1
)
