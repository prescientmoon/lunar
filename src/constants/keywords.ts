export type keyword = 'if' | 'else' | 'true' | 'false' | 'const'

export const keywords: Record<keyword, string> = {
    if: 'if',
    else: 'else',
    true: 'true',
    false: 'false',
    const: 'const'
}

export const keywordNames = Object.values(keywords)
