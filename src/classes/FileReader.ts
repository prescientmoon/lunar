import { readFile } from 'fs-extra'
import { CommandLogger } from './CommandLogger'
import chalk from 'chalk'

export class LunarSourceReader {
    private source: string = ''

    private lastX = 0
    private position = [0, 0]
    private index = 0

    public constructor(
        public logger: CommandLogger,
        public exit = process.exit
    ) {}

    public reset() {
        this.position = [0, 0]
        this.index = 0
        this.lastX = 0
    }

    public async fromFile(entry: string) {
        this.logger.log(entry)

        try {
            this.fromString((await readFile(entry)).toString())
        } catch {
            this.endWith(`Something went wrong while reading ${entry}`)
        }
    }

    public fromString(source: string) {
        this.reset()

        this.source = `{
            ${source}
        }`
            .split('\n')
            .map(s => s.trim())
            .join('\n')
    }

    public peek() {
        return this.source.charAt(this.index)
    }

    public next() {
        const ch = this.source.charAt(this.index++)

        this.lastX = this.position[1]

        if (ch === '\n') {
            this.position[0]++
            this.position[1] = 0
        } else {
            this.position[1]++
        }

        return ch
    }

    public eof() {
        return this.peek() == ''
    }

    public endWith(message: string) {
        console.error(chalk.redBright(message))
        this.exit(1)
    }

    public croak(message: string, throwError = false) {
        const spaces = this.position[1] - 1

        const errorMessage = [
            `${message} (${this.position[0] - 1}:${this.position[1]})`,
            `${this.source.split('\n')[this.position[0]]}`,
            `${' '.repeat(spaces)}^`
        ].join('\n')

        if (throwError) {
            throw new Error(errorMessage)
        } else {
            this.endWith(errorMessage)
        }
    }
}
