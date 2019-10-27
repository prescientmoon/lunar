import { LunarTokenReader } from './TokenReader'
import { Ast, AstNodeType } from '../types/Ast'
import { tokens } from '../constants/Tokens'
import { punctuation } from '../constants/punctuation'
import { keyword, keywords } from '../constants/keywords'
import {
    operatorIds,
    operatorImportance,
    unary,
    unaryOperator
} from '../constants/operators'
import { Token } from './Token'
import { isTokenOfType } from '../helpers/isTokenOfType'

export class AstBuilder {
    public static falseNode: Ast<AstNodeType.boolean> = {
        type: AstNodeType.boolean,
        value: false
    }

    public constructor(public input: LunarTokenReader) {}

    /**
     * Keeps track of optional stuff.
     */
    private optional: punctuation[] = []

    /**
     * Next occurance of a charcter becomes optional.
     *
     * @param character The punctuation to skip.
     */
    private makeOptional(character: punctuation) {
        this.optional.push(character)
    }

    /**
     * Parses a sequence of values.
     *
     * @param start The punctuation to start the sequence.
     * @param stop The puncuation to stop everything.
     * @param separator The thing which separates values.
     * @param parser Function to parse individual values.
     */
    private delimited<T>(
        start: punctuation,
        stop: punctuation,
        separator: punctuation,
        parser: () => T
    ) {
        const results: T[] = []

        // skip initial delimiter
        this.skipPunctuation(start)

        // we don't want stuff like (, 1, 2, 3) to happen
        let first = true

        while (!this.input.eof()) {
            if (this.isPunctuation(stop)) {
                break
            }

            const nextIsOptional = this.optional.includes(separator)

            if (first) {
                first = false
            } // allow skipping separators
            else if (
                (nextIsOptional && this.isPunctuation(separator)) ||
                !nextIsOptional
            ) {
                this.skipPunctuation(separator)

                // remove all separatros from array
                this.optional = this.optional.filter(
                    character => character !== separator
                )
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

    public isOperator(operator?: operatorIds): operator is operatorIds {
        const token = this.input.peek()

        return Boolean(
            token &&
                token.type === tokens.operator &&
                (!operator || token.value === operator)
        )
    }

    public isUnary(operator?: operatorIds): operator is unaryOperator {
        const token = this.input.peek()

        return (
            this.isOperator(operator) &&
            unary.includes(token.value as unaryOperator)
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
        const token = this.input.peek()

        this.input.croak(
            `Unexpected token of type ${token.typeName()}. Recived ${JSON.stringify(
                token.value
            )}`
        )
    }

    public skipOperator(operator: operatorIds) {
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
                            token.value === operatorIds.assign
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
        const token = this.input.next()!

        if (!isTokenOfType(token, tokens.variable)) {
            this.input.croak('Expecting variable name')
            return ''
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
            value: this.input.next()!.value === keywords.true
        }
    }

    public parseUnary(): Ast<AstNodeType.unaryOperator> {
        return {
            type: AstNodeType.unaryOperator,
            operator: this.input.next()!.value as unaryOperator,
            body: this.parseExpression()
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

    public parseDefinition() {
        const name = this.parseVariableName()

        // Check if this is the last definition
        if (
            this.isPunctuation(punctuation.comma) ||
            this.isPunctuation(punctuation.closeBracket)
        ) {
            return [name, AstBuilder.falseNode]
        }

        this.skipOperator(operatorIds.assign)

        return [name, this.parseExpression()]
    }

    public parseDefinitions(): Ast<AstNodeType.define> {
        const pairs = this.delimited(
            punctuation.openBracket,
            punctuation.closeBracket,
            punctuation.comma,
            this.parseDefinition.bind(this)
        )

        // optional ; after the }
        this.makeOptional(punctuation.semicolon)

        return {
            type: AstNodeType.define,
            pairs: Object.fromEntries(pairs)
        }
    }

    public parseProgram(): Ast {
        const program = this.delimited<Ast>(
            punctuation.openBracket,
            punctuation.closeBracket,
            punctuation.semicolon,
            this.parseExpression.bind(this)
        )

        // optional ; after the }
        this.makeOptional(punctuation.semicolon)

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
            } else if (this.isKeyword(keywords.declare)) {
                this.input.next()
                return this.parseDefinitions()
            } else if (
                this.isKeyword(keywords.true) ||
                this.isKeyword(keywords.false)
            ) {
                return this.parseBoolean()
            } else if (this.isKeyword(keywords.fn)) {
                this.input.next()
                return this.parseFunction()
            } else if (this.isUnary()) {
                return this.parseUnary()
            }

            const token = this.input.next()!

            if (
                token.type === tokens.variable ||
                token.type === tokens.number ||
                token.type === tokens.string
            ) {
                return token.toAstNode()
            }

            this.unexpected()

            throw ''
        })
    }

    public parseExpression(): Ast {
        return this.maybeCall(() => this.maybeBinary(this.parseAtom(), -1))
    }
}
