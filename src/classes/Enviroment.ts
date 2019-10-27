import { LunarSourceReader } from './FileReader'

export interface Variable {
    value: unknown
    constant: boolean
}

export class Enviroment {
    public variables: Record<string, Variable>

    public constructor(
        public parent: Enviroment | null,
        public input: LunarSourceReader
    ) {
        this.variables = Object.create(
            this.parent ? this.parent.variables : Object
        )
    }

    public extend() {
        return new Enviroment(this, this.input)
    }

    public lookup(name: string) {
        let scope: Enviroment = this

        while (scope) {
            if (scope.variables.hasOwnProperty(name)) {
                return scope
            }

            if (!scope.parent) {
                throw new Error(`Cannot lookup scope for variable ${name}`)
            }

            scope = scope.parent
        }
    }

    public get(name: string) {
        if (name in this.variables) {
            return this.variables[name].value
        }

        this.input.endWith(`Undefined variable ${name}`)
    }

    public set(name: string, value: unknown) {
        const scope = this.lookup(name)

        // let's not allow defining globals from a nested environment
        if (!scope && this.parent) {
            this.input.endWith(`Cannot defined global variable ${name}`)
        }

        const variable = scope ? scope.variables[name] : this.variables[name]

        if (!variable.constant) {
            return value
        }

        return this.input.endWith(`Cannot assign to constant variable ${name}`)
    }

    public define(name: string, variable: Variable) {
        if (this.variables.hasOwnProperty(name)) {
            return this.input.endWith(`Variable ${name} was already declared!`)
        }

        this.variables[name] = variable

        return variable.value
    }

    public defineConst(name: string, value: unknown) {
        this.define(name, { value, constant: true })

        return value
    }
}
