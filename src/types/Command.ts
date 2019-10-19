import { Command } from 'commander'

export interface LunarCommand extends Command {
    output: string
    tokens: boolean
}
