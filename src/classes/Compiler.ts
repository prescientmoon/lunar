import { readFile } from 'fs-extra'
import { CommandLogger } from './CommandLogger'

export class LunarSourceReader {
    private source: string = ''

    private position = [0, 0]
    private index = 0

    public constructor(public entry: string, public logger: CommandLogger) {}

    public reset() {
        this.position = [0, 0]
        this.index = 0
    }

    public async start() {
        this.logger.log(this.entry)

        try {
            this.source = `{
                ${(await readFile(this.entry)).toString()}
            }`
                .split('\n')
                .map(s => s.trim())
                .join('\n')
        } catch {
            throw new Error(`Something went wrong while reading ${this.entry}`)
        }
    }

    public peek() {
        return this.source.charAt(this.index)
    }

    public next() {
        const ch = this.source.charAt(this.index++)

        if (ch == '\n') {
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

    public croak(message: string) {
        throw new Error(
            [
                `${message} (${this.position[0] - 1}:${this.position[1]})`,
                `${this.source.split('\n')[this.position[0]]}`,
                `${' '.repeat(this.position[1] - 1)}^`
            ].join('\n')
        )
    }
}
