import { LunarTokenReader } from './TokenReader'
import { Ast, AstNodeType, DeclarationData } from '../types/Ast'
import { tokens } from '../constants/Tokens'
import { punctuation } from '../constants/punctuation'
import { keyword, keywords } from '../constants/keywords'
import {
    operatorIds,
    operatorImportance,
    unary,
    unaryOperator,
    operators,
} from '../constants/operators'
import { Token } from './Token'
import { isTokenOfType } from '../helpers/isTokenOfType'
import {
    DelimitedParsingConfig,
    Skippable,
    skippableValue,
} from '../types/Skippable'
import {
    functionArgumentsRules,
    variableDeclarationRules,
    programRules,
} from '../constants/punctuationRules'

const { isArray } = Array
export class AstBuilder {
    private static falseNode: Ast<AstNodeType.boolean> = {
        type: AstNodeType.boolean,
        value: false,
    }

    public constructor(private input: LunarTokenReader) {}

    /**
     * Parses a sequence of values.
     *
     * @param start The punctuation to start the sequence.
     * @param stop The puncuation to stop everything.
     * @param separators The thing which separates values.
     * @param parser Function to parse individual values.
     */
    private delimited<T>(
        { start, stop, separator, stopEarly }: DelimitedParsingConfig,
        parser: () => T,
        until = () => this.input.eof()
    ) {
        const results: T[] = []

        // skip initial delimiter
        const skippedStart = this.trySkippingPunctuation(start)

        // we don't want stuff like (, 1, 2, 3) to happen
        let first = true

        while (!until()) {
            if (skippedStart && this.canBeSkipped(stop)) {
                break
            }

            if (first) {
                first = false
            } else {
                const canBeSkipped = this.canBeSkipped(separator)

                if (canBeSkipped) {
                    this.skipPunctuation(skippableValue(separator!))
                } else if (isArray(separator) && stopEarly) {
                    break
                }
            }

            if (skippedStart && this.canBeSkipped(stop)) {
                break
            }

            results.push(parser())
        }

        if (skippedStart) {
            this.trySkippingPunctuation(stop)
        }

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

    private isOperator(operator?): boolean {
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

    private canBeSkipped(skippable?: Skippable): skippable is Skippable {
        if (!skippable) {
            return false
        }

        if (this.isPunctuation(skippableValue(skippable))) {
            return true
        }

        return false
    }

    private trySkippingPunctuation(skippable?: Skippable) {
        const canBeSkiped = this.canBeSkipped(skippable)

        if (canBeSkiped || (skippable && isArray(skippable))) {
            this.skipPunctuation(skippableValue(skippable!))
        }

        return canBeSkiped
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

    private unexpected(token: Token | null) {
        if (token === null) {
            return this.input.croak(`Cnnot read past end of file`)
        }

        this.input.croak(
            `Unexpected token of type ${token.typeName()}. Recived ${token.name()}: ${
                token.value
            }`
        )
    }

    private skipOperator(operator: operatorIds) {
        if (this.isOperator(operator)) {
            this.input.next()
        } else {
            this.input.croak(
                `Expecting operator: "${operators[operator].value}"`
            )
        }
    }

    private maybeCall(expression: () => Ast) {
        const currentExpression = expression()

        return this.isPunctuation(punctuation.openParenthesis)
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
                        ),
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
                functionArgumentsRules,
                this.parseExpression.bind(this)
            ),
        }
    }

    private parseVariableName() {
        const token = this.input.next()

        if (!isTokenOfType(token!, tokens.variable)) {
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
            then,
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
            value: this.input.next()!.value === keywords.true,
        }
    }

    private parseUnary(): Ast<AstNodeType.unaryOperator> {
        return {
            type: AstNodeType.unaryOperator,
            operator: this.input.next()!.value as unaryOperator,
            body: this.parseExpression(),
        }
    }

    private parseFunction(): Ast<AstNodeType.anonymousFunction> {
        return {
            type: AstNodeType.anonymousFunction,
            arguments: this.delimited(
                functionArgumentsRules,
                this.parseVariableName.bind(this)
            ),
            body: this.parseExpression(),
        }
    }

    private parseConstant() {
        const name = this.parseVariableName()

        this.skipOperator(operatorIds.assign)

        return { name, initialValue: this.parseExpression() }
    }

    private parseDeclaration() {
        const name = this.parseVariableName()

        // Check if this has a value
        if (this.isOperator(operatorIds.assign)) {
            this.skipOperator(operatorIds.assign)

            return { name, initialValue: this.parseExpression() }
        }

        return {
            name,
            initialValue: AstBuilder.falseNode,
        }
    }

    private isConstant() {
        return this.isKeyword(keywords.const)
    }

    private parseDefinitions(): Ast<AstNodeType.define> {
        const constant = this.isConstant()

        // skip declare or const depenging on the variable type
        this.skipKeyword(constant ? keywords.const : keywords.declare)

        const parser = (constant
            ? this.parseConstant
            : this.parseDeclaration
        ).bind(this)

        const pairs = this.delimited(variableDeclarationRules, parser)

        while (this.isPunctuation(punctuation.comma)) {
            this.skipPunctuation(punctuation.comma)

            pairs.push(parser())
        }

        return {
            type: AstNodeType.define,
            variables: pairs.map<DeclarationData>((pair) => ({
                ...pair,
                constant,
            })),
        }
    }

    public parseProgram(): Ast {
        const program = this.delimited<Ast>(
            programRules,
            this.parseExpression.bind(this)
        )

        if (program.length === 0) {
            return AstBuilder.falseNode
        } else if (program.length === 1) {
            return program[0]
        }

        return {
            type: AstNodeType.program,
            program,
        }
    }

    public parseAtom() {
        return this.maybeCall(() => {
            if (this.isPunctuation(punctuation.openParenthesis)) {
                this.input.next()
                const expression = this.parseExpression()
                this.skipPunctuation(punctuation.closeParenthesis)

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

            const token = this.input.next()

            if (
                token !== null &&
                (token.type === tokens.variable ||
                    token.type === tokens.number ||
                    token.type === tokens.string)
            ) {
                return token.toAstNode()
            }

            this.unexpected(token)

            throw ''
        })
    }

    public parseExpression(): Ast {
        return this.maybeCall(() => this.maybeBinary(this.parseAtom(), -1))
    }
}
