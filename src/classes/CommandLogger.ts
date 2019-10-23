import { LunarCommand } from '../types/Command'
import { inspect } from 'util'

export class CommandLogger {
    public constructor(public command: LunarCommand) {}

    public guardLog<T extends unknown[]>(
        args: T,
        callback: (...args: T) => void
    ) {
        if (!this.command.silent) {
            callback(...args)
        }
    }

    public log(...args: Parameters<typeof console.log>) {
        this.guardLog(args, console.log)
    }

    public table(...args: Parameters<typeof console.table>) {
        this.guardLog(args, console.table)
    }

    public inspect(o: object) {
        // Credit: https://stackoverflow.com/questions/10729276/how-can-i-get-the-full-object-in-node-jss-console-log-rather-than-object
        this.log(inspect(o, false, null, true))
    }
}
