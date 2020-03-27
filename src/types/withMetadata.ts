export const metadata = Symbol('metadata')

export type withMetadata<T> = T & {
    [metadata]?: {
        variableName?: string
    }
}
