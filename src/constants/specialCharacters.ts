export type specialCharacter = 'quote' | 'comment'

export const specialCharacters: Record<specialCharacter, string[]> = {
    comment: ['#'],
    quote: [`"`, `'`]
}

export const specialCharacterNames = Object.values(specialCharacters).flat()
