export interface ReplCommand {
    value: string
    description: string
    exec: () => void
}
