import { Command } from 'commander'
import { LunarCommand } from './types/Command'
import { CommandLogger } from './classes/CommandLogger'
import { interpret } from './helpers/interpret'
import { playground } from './helpers/playground'

const program = new Command() as LunarCommand

program
    .version('0.0.1')
    .description('Compiler for lunarlang')
    .name('lunar')

program
    .option('-t, --tokens', 'output individual tokens', false)
    .option('-l, --log', 'display information', false)
    .option('-a, --ast', 'display ast', false)

program.logger = new CommandLogger(program)

program
    .command('compile <entry>')
    .alias('c')
    .option('-o, --output <path>', 'specify the path to the output')
    .action(async (entry: string) => {
        console.log(`This command is still in development`)
    })

program
    .command('execute <entry>')
    .alias('exec')
    .action(async (entry: string) => {
        interpret(entry, program)
    })

program.command('playground').action(playground(program))

program.parse(process.argv)
