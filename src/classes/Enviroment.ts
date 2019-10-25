import { LunarSourceReader } from './FileReader'

export class Enviroment {
    public variables: Record<string, unknown>

    public constructor(
        public parent: Enviroment | null,
        public input: LunarSourceReader
    ) {
        this.variables = Object.create(
            this.parent ? this.parent.variables : null
        )
    }

    public extend() {
        return new Enviroment(this, this.input)
    }

    public lookup(name: string) {
        let scope: Enviroment = this

        while (scope) {
            if (Object.prototype.hasOwnProperty.call(scope.variables, name)) {
                return scope
            }

            scope = scope.parent
        }
    }

    public get(name: string) {
        if (name in this.variables) {
            return this.variables[name]
        }

        this.input.endWith(`Undefined variable ${name}`)
    }

    public set(name: string, value: unknown) {
        const scope = this.lookup(name)
        // let's not allow defining globals from a nested environment
        if (!scope && this.parent) {
            this.input.endWith(`Undefined variable ${name}`)
        }

        if (scope) {
            scope.variables[name] = value
        } else {
            this.variables[name] = value
        }

        return value
    }

    public define(name: string, value: unknown) {
        return (this.variables[name] = value)
    }
}
