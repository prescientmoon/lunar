import { LunarTokenReader } from './TokenReader'
import { Ast, AstNodeType } from '../types/Ast'
import { tokens } from '../constants/Tokens'
import { punctuation } from '../constants/punctuation'
import { keyword, keywords } from '../constants/keywords'
import { operators, operatorImportance } from '../constants/operators'
import { Token } from './Token'

export class AstBuilder {
    public static falseNode: Ast<AstNodeType.boolean> = {
        type: AstNodeType.boolean,
        value: false
    }

    public constructor(public input: LunarTokenReader) {}

    public delimited<T>(
        start: punctuation,
        stop: punctuation,
        separator: punctuation,
        parser: () => T
    ) {
        const results: T[] = []
        let first = true

        // skip initial delimiter
        this.skipPunctuation(start)

        while (!this.input.eof()) {
            if (this.isPunctuation(stop)) {
                break
            }

            if (first) {
                first = false
            } else {
                // skip delimiter
                this.skipPunctuation(separator)
            }

            // the last separator can be missing
            if (this.isPunctuation(stop)) {
                break
            }

            results.push(parser())
        }

        // skip final delimiter
        this.skipPunctuation(stop)

        return results
    }

    public isPunctuation(character: punctuation) {
        const token = this.input.peek()
        return (
            token &&
            token.type === tokens.punctuation &&
            (!character || token.value === character)
        )
    }

    public isKeyword(keyword: keyword) {
        const token = this.input.peek()

        return (
            token &&
            token.type === tokens.keyword &&
            (!keyword || token.value === keyword)
        )
    }

    public isOperator(operator?: operators): operator is operators {
        const token = this.input.peek()

        return (
            token &&
            token.type === tokens.operator &&
            (!operator || token.value === operator)
        )
    }

    public skipPunctuation(character: punctuation) {
        if (this.isPunctuation(character)) {
            this.input.next()
        } else {
            this.input.croak(`Expecting punctuation: "${character}"`)
        }
    }

    public skipKeyword(keyword: keyword) {
        if (this.isKeyword(keyword)) {
            this.input.next()
        } else {
            this.input.croak(`Expecting keyword: "${keyword}"`)
        }
    }

    public unexpected() {
        this.input.croak(
            `Unexpected token: "${JSON.stringify(this.input.peek())}"`
        )
    }

    public skipOperator(operator: operators) {
        if (this.isOperator(operator)) {
            this.input.next()
        } else {
            this.input.croak(`Expecting operator: "${operator}"`)
        }
    }

    public maybeCall(expression: () => Ast) {
        const currentExpression = expression()

        return this.isPunctuation(punctuation.openParanthesis)
            ? this.parseCall(currentExpression)
            : currentExpression
    }

    public maybeBinary(left: Ast, importance: number): Ast {
        const token = this.isOperator()
            ? (this.input.peek() as Token<tokens.operator>)
            : null

        if (token) {
            const nextOperatorImportance = operatorImportance[token.value]

            // next is more important
            if (nextOperatorImportance > importance) {
                this.input.next()

                return this.maybeBinary(
                    {
                        type:
                            token.value === operators.assign
                                ? AstNodeType.assign
                                : AstNodeType.binaryOperator,
                        operator: token.value,
                        left,
                        right: this.maybeBinary(
                            this.parseAtom(),
                            nextOperatorImportance
                        )
                    },
                    importance
                )
            }
        }

        return left
    }

    public parseCall(target: Ast): Ast<AstNodeType.functionCall> {
        return {
            type: AstNodeType.functionCall,
            target,
            arguments: this.delimited<Ast>(
                punctuation.openParanthesis,
                punctuation.closeParanthesis,
                punctuation.comma,
                this.parseExpression.bind(this)
            )
        }
    }

    public parseVariableName() {
        const token = this.input.next()

        if (token.type != tokens.variable) {
            this.input.croak('Expecting variable name')
        }

        return token.value
    }

    public parseIf() {
        this.skipKeyword(keywords.if)

        const condition = this.parseExpression()

        if (!this.isPunctuation(punctuation.openBracket)) {
            this.skipKeyword(keywords.then)
        }
        const then = this.parseExpression()

        const returnValue: Ast<AstNodeType.conditional> = {
            type: AstNodeType.conditional,
            condition,
            then
        }

        if (this.isKeyword(keywords.else)) {
            this.input.next()
            returnValue.else = this.parseExpression()
        }
        return returnValue
    }

    public parseBoolean(): Ast<AstNodeType.boolean> {
        return {
            type: AstNodeType.boolean,
            value: this.input.next().value === keywords.true
        }
    }

    public parseFunction(): Ast<AstNodeType.anonymousFunction> {
        return {
            type: AstNodeType.anonymousFunction,
            arguments: this.delimited(
                punctuation.openParanthesis,
                punctuation.closeParanthesis,
                punctuation.comma,
                this.parseVariableName.bind(this)
            ),
            body: this.parseExpression()
        }
    }

    public parseProgram(): Ast {
        const program = this.delimited<Ast>(
            punctuation.openBracket,
            punctuation.closeBracket,
            punctuation.semicolon,
            this.parseExpression.bind(this)
        )

        if (program.length === 0) {
            return AstBuilder.falseNode
        } else if (program.length === 1) {
            return program[0]
        }

        return {
            type: AstNodeType.program,
            program
        }
    }

    public parseAtom() {
        return this.maybeCall(() => {
            if (this.isPunctuation(punctuation.openParanthesis)) {
                this.input.next()
                const expression = this.parseExpression()
                this.skipPunctuation(punctuation.closeParanthesis)

                return expression
            } else if (this.isPunctuation(punctuation.openBracket)) {
                return this.parseProgram()
            } else if (this.isKeyword(keywords.if)) {
                return this.parseIf()
            } else if (
                this.isKeyword(keywords.true) ||
                this.isKeyword(keywords.false)
            ) {
                return this.parseBoolean()
            } else if (this.isKeyword(keywords.fn)) {
                this.input.next()
                return this.parseFunction()
            }

            const token = this.input.next()

            if (
                token.type === tokens.variable ||
                token.type === tokens.number ||
                token.type === tokens.string
            ) {
                return token.toAstNode()
            }

            this.unexpected()
        })
    }

    public parseExpression(): Ast {
        return this.maybeCall(() => this.maybeBinary(this.parseAtom(), -1))
    }
}
