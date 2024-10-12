// Array with all keywords
export const keywordNames = [
    'if',
    'then',
    'else',
    'true',
    'false',
    'declare',
    'const',
    'fn'
] as const

// Extract types from array
export type keyword = (typeof keywordNames)[number]

// did this to allow me to chane keywords while still getting typechecking
export const keywords = Object.fromEntries(
    keywordNames.map((name) => [name, name])
) as unknown as {
    [key in keyword]: key
}
