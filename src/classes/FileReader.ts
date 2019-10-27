import { readFile } from 'fs-extra'
import { CommandLogger } from './CommandLogger'
import chalk from 'chalk'

interface ReaderPositionData {
    index: number
    position: [number, number]
}

export class LunarSourceReader {
    private source: string = ''

    private position = [0, 0]
    private index = 0

    private stack: ReaderPositionData[] = []

    public constructor(
        public logger: CommandLogger,
        public exit: (code: number) => unknown = process.exit
    ) {}

    public push() {
        this.stack.push({
            index: this.index,

            // don't copy by reference
            position: [...this.position] as [number, number]
        })
    }

    public pop() {
        const popped = this.stack.pop()

        if (popped !== undefined) {
            this.position = popped.position
            this.index = popped.index
        }
    }

    public reset() {
        this.position = [0, 0]
        this.index = 0
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

    public peek(length = 1) {
        return this.source.substr(this.index, length)
    }

    public next(length = 1) {
        const characters = this.source.substr(this.index++, length)

        for (const character of characters) {
            if (character === '\n') {
                this.position[0]++
                this.position[1] = 0
            } else {
                this.position[1]++
            }
        }

        return characters
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
