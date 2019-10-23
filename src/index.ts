import { Command } from 'commander'
import { LunarCommand } from './types/Command'
import { CommandLogger } from './classes/CommandLogger'
import { createTokenStream } from './helpers/createTokenStream'
import { interpret } from './helpers/interpret'

const program = new Command() as LunarCommand

program
    .version('0.0.1')
    .description('Compiler for lunarlang')
    .name('lunar')

program
    .option('-o, --output <path>', 'specify the path to the output')
    .option('-t, --tokens', 'output individual tokens', false)
    .option('-s, --silent', 'display information', false)

program.logger = new CommandLogger(program)

program.command('compile <entry>').action(async (entry: string) => {})
program.command('execute <entry>').action(async (entry: string) => {
    interpret(entry, program)
})

program.parse(process.argv)
