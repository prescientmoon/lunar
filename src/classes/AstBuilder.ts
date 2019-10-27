import { LunarTokenReader } from './TokenReader'
import { Ast, AstNodeType, DeclarationData } from '../types/Ast'
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
    private static falseNode: Ast<AstNodeType.boolean> = {
        type: AstNodeType.boolean,
        value: false
    }

    public constructor(private input: LunarTokenReader) {}

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
        parser: () => T,
        optional = false
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

            if (first) {
                first = false
            } // allow skipping separators
            else if ((optional && this.isPunctuation(separator)) || !optional) {
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

    private isPunctuation(character: punctuation) {
        const token = this.input.peek()
        return (
            token &&
            token.type === tokens.punctuation &&
            (!character || token.value === character)
        )
    }

    private isKeyword(keyword: keyword) {
        const token = this.input.peek()

        return (
            token &&
            token.type === tokens.keyword &&
            (!keyword || token.value === keyword)
        )
    }

    private isOperator(operator?: operatorIds): operator is operatorIds {
        const token = this.input.peek()

        return Boolean(
            token &&
                token.type === tokens.operator &&
                (!operator || token.value === operator)
        )
    }

    private isUnary(operator?: operatorIds): operator is unaryOperator {
        const token = this.input.peek()

        return (
            this.isOperator(operator) &&
            unary.includes(token.value as unaryOperator)
        )
    }

    private skipPunctuation(character: punctuation) {
        if (this.isPunctuation(character)) {
            this.input.next()
        } else {
            this.input.croak(`Expecting punctuation: "${character}"`)
        }
    }

    private skipKeyword(keyword: keyword) {
        if (this.isKeyword(keyword)) {
            this.input.next()
        } else {
            this.input.croak(`Expecting keyword: "${keyword}"`)
        }
    }

    private unexpected(token: Token) {
        this.input.croak(
            `Unexpected token of type ${token.typeName()}. Recived ${JSON.stringify(
                token.value
            )}`
        )
    }

    private skipOperator(operator: operatorIds) {
        if (this.isOperator(operator)) {
            this.input.next()
        } else {
            this.input.croak(`Expecting operator: "${operator}"`)
        }
    }

    private maybeCall(expression: () => Ast) {
        const currentExpression = expression()

        return this.isPunctuation(punctuation.openParanthesis)
            ? this.parseCall(currentExpression)
            : currentExpression
    }

    private maybeBinary(left: Ast, importance: number): Ast {
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

    private parseCall(target: Ast): Ast<AstNodeType.functionCall> {
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

    private parseVariableName() {
        const token = this.input.next()!

        if (!isTokenOfType(token, tokens.variable)) {
            this.input.croak('Expecting variable name')
            return ''
        }

        return token.value
    }

    private parseIf() {
        this.skipKeyword(keywords.if)

        const condition = this.parseExpression()

        this.skipKeyword(keywords.then)

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

    private parseBoolean(): Ast<AstNodeType.boolean> {
        return {
            type: AstNodeType.boolean,
            value: this.input.next()!.value === keywords.true
        }
    }

    private parseUnary(): Ast<AstNodeType.unaryOperator> {
        return {
            type: AstNodeType.unaryOperator,
            operator: this.input.next()!.value as unaryOperator,
            body: this.parseExpression()
        }
    }

    private parseFunction(): Ast<AstNodeType.anonymousFunction> {
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

    private parseDefinition() {
        const name = this.parseVariableName()

        // Check if this has a value
        if (this.isOperator(operatorIds.assign)) {
            this.skipOperator(operatorIds.assign)

            return { name, initialValue: this.parseExpression() }
        }

        return {
            name,
            initialValue: AstBuilder.falseNode
        }
    }

    private isConstant() {
        return this.isKeyword(keywords.const)
    }

    private parseDefinitions(): Ast<AstNodeType.define> {
        const constant = this.isConstant()

        // skip declare or const depenging on the variable type
        this.skipKeyword(constant ? keywords.const : keywords.declare)

        const pairs = [this.parseDefinition()]

        while (this.isPunctuation(punctuation.comma)) {
            this.skipPunctuation(punctuation.comma)

            pairs.push(this.parseDefinition())
        }

        return {
            type: AstNodeType.define,
            variables: pairs.map<DeclarationData>(pair => ({
                ...pair,
                constant
            }))
        }
    }

    public parseProgram(): Ast {
        const program = this.delimited<Ast>(
            punctuation.openBracket,
            punctuation.closeBracket,
            punctuation.semicolon,
            this.parseExpression.bind(this),
            true
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

    private parseAtom() {
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
                this.isKeyword(keywords.declare) ||
                this.isKeyword(keywords.const)
            ) {
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

            this.unexpected(token)

            throw ''
        })
    }

    private parseExpression(): Ast {
        return this.maybeCall(() => this.maybeBinary(this.parseAtom(), -1))
    }
}
