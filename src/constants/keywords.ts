export type keyword = 'if' | 'else' | 'true' | 'false' | 'const' | 'then' | 'fn'

export const keywords = {
    if: 'if',
    then: 'then',
    else: 'else',
    true: 'true',
    false: 'false',
    const: 'const',
    fn: 'fn'
} as const

export const keywordNames = Object.values(keywords)
