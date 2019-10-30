import { LunarSourceReader } from './FileReader'

export interface Variable {
    value: unknown
    constant: boolean
}

export class Enviroment {
    public variables: Record<string, Variable>

    private variablePrefix = '___'

    public constructor(
        public parent: Enviroment | null,
        public input: LunarSourceReader
    ) {
        this.variables = Object.create(
            this.parent ? this.parent.variables : Object
        )
    }

    private prependPrefix(name: string) {
        return this.variablePrefix + name
    }

    public extend() {
        return new Enviroment(this, this.input)
    }

    public lookup(name: string) {
        let scope: Enviroment = this

        while (scope) {
            if (scope.variables.hasOwnProperty(this.prependPrefix(name))) {
                return scope
            }

            if (!scope.parent) {
                throw new Error(`Cannot lookup scope for variable ${name}`)
            }

            scope = scope.parent
        }
    }

    public get(name: string) {
        const pname = this.prependPrefix(name)

        if (pname in this.variables) {
            return this.variables[pname].value
        }

        this.input.endWith(`Undefined variable ${name}`)
    }

    public set(name: string, value: unknown) {
        const scope = this.lookup(name)
        const pname = this.prependPrefix(name)

        // let's not allow defining globals from a nested environment
        if (!scope && this.parent) {
            this.input.endWith(`Cannot defined global variable ${name}`)
        }

        const variable = scope ? scope.variables[pname] : this.variables[pname]

        if (!variable.constant) {
            variable.value = value
            return value
        }

        return this.input.endWith(`Cannot assign to constant variable ${name}`)
    }

    public define(name: string, variable: Variable) {
        const pname = this.prependPrefix(name)

        if (this.variables.hasOwnProperty(pname)) {
            return this.input.endWith(`Variable ${name} was already declared!`)
        }

        this.variables[pname] = variable

        return variable.value
    }

    public defineConst(name: string, value: unknown) {
        this.define(name, { value, constant: true })

        return value
    }
}
