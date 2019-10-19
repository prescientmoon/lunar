import { readFile, ensureFile } from 'fs-extra'

export class LunarSourceReader {
    private source: string = ''

    private position = [0, 0]
    private index = 0

    public constructor(public entry: string) {}

    public async start() {
        console.log(this.entry)

        try {
            this.source = (await readFile(this.entry)).toString()
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

    public croak(msg: string) {
        throw new Error(`${msg} (${this.position[0]}:${this.position[1]})`)
    }
}
