import { Command } from 'commander'
import { LunarCommand } from './types/Command'
import { LunarSourceReader } from './classes/Compiler'
import chalk from 'chalk'
import { resolve } from 'path'
import { LunarTokenReader } from './classes/TokenReader'
import { TokenPrintData } from './types/TokenPrintData'

const program = new Command() as LunarCommand

program
    .version('0.0.1')
    .description('Compiler for lunarlang')
    .name('lunar')

program
    .option('-o, --output <path>', 'specify the path to the output')
    .option('-t, --tokens', 'output individual tokens', false)

program.command('compile <entry>').action(async (entry: string) => {
    try {
        if (!program.output) {
            throw new Error(chalk.red('Output arg not found'))
        }

        console.log(chalk.green(`Compiling ${entry}...`))
        console.log(chalk.green(`Reading files...`))

        const reader = new LunarSourceReader(resolve(process.cwd(), entry))

        await reader.start()

        console.log(chalk.green('Parsing tokens...'))

        const tokenizer = new LunarTokenReader(reader)
        const tokens: Array<TokenPrintData> = []

        while (tokenizer.peek()) {
            const next = tokenizer.next()

            tokens.push({
                ...next,
                name: next.name()
            })
        }

        if (program.tokens) {
            console.table(tokens)
        }
    } catch (err) {
        console.log(chalk.red(`CompilationError: ${err.message}`))
    }
})

program.parse(process.argv)
