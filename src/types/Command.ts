import { Command } from 'commander'
import { CommandLogger } from '../classes/CommandLogger'

export interface LunarCommand extends Command {
    output: string
    tokens: boolean
    silent: boolean
    logger: CommandLogger
}
