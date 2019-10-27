import { LunarSourceReader } from './FileReader'
import { keywordNames, keyword } from '../constants/keywords'
import { numberRegex, idStart } from '../constants/regexes'
import { tokens } from '../constants/Tokens'
import { Token } from './Token'
import { specialCharacters } from '../constants/specialCharacters'
import {
    operatorValues,
    operatorIds,
    maxOperatorLength,
    operators
} from '../constants/operators'

export class LunarTokenReader {
    private current: Token | null = null

    public constructor(public input: LunarSourceReader) {}

    public reset() {
        this.current = null
    }

    public isKeyword(keyword: string) {
        return keywordNames.includes((keyword as unknown) as keyword)
    }

    public isIdentifierStart(character: string) {
        return idStart.test(character)
    }

    public isIdentifier(character: string) {
        return (
            this.isIdentifierStart(character) ||
            '?!-<>=0123456789'.includes(character)
        )
    }

    private getOperatorIdByChar(char: string) {
        const result = Object.entries(operators).find(
            ([, operator]) => operator.value === char
        )

        if (result === undefined) {
            this.input.endWith(`Cannot find operator ${char}`)

            // to make ts happy
            // cause it can't know endWith throws
            throw ''
        }

        return Number(result[0]) as operatorIds
    }

    public isOperator() {
        this.input.push()
        const result = this.readOperator() !== null
        this.input.pop()

        return result
    }

    private isWhitespace(next: string) {
        return ' \t\n'.includes(next)
    }

    private readOperator() {
        // Inspect the maximum length an operator can take
        const next = this.input.peek(maxOperatorLength)

        let currentMatch: null | string = null

        for (const { value } of operatorValues) {
            if (next.startsWith(value)) {
                // If the operator matches perfectly then return it
                if (value.length === next.length) {
                    this.input.next(value.length)
                    return this.getOperatorIdByChar(value)
                }
                // Find operator with maximum length
                else if (
                    value.length >
                    (currentMatch !== null ? currentMatch.length : 0)
                ) {
                    currentMatch = value
                }
            }
        }

        if (currentMatch !== null) {
            // Actually move the cursor
            this.input.next(currentMatch.length)
            return this.getOperatorIdByChar(currentMatch)
        }

        return currentMatch
    }

    public readNumber() {
        let hasDot = false

        const result = this.readWhile((next: string) => {
            if (next === '.') {
                if (hasDot) return false

                hasDot = true

                return true
            }

            return numberRegex.test(next)
        })

        return new Token(tokens.number, parseFloat(result))
    }

    public skipComment() {
        this.readWhile((next: string) => next !== '\n')
        this.input.next()
    }

    public readIdentifier() {
        const identifier = this.readWhile(this.isIdentifier.bind(this))

        return new Token(
            keywordNames.includes((identifier as unknown) as keyword)
                ? tokens.keyword
                : tokens.variable,
            identifier
        )
    }

    public readEscaped(end: string) {
        let escaped = false,
            result = ''
        this.input.next()

        while (!this.input.eof()) {
            const ch = this.input.next()

            if (escaped) {
                result += ch
                escaped = false
            } else if (ch == '\\') {
                escaped = true
            } else if (ch == end) {
                break
            } else {
                result += ch
            }
        }

        return result
    }

    public readString(start: string) {
        return new Token(tokens.string, this.readEscaped(start))
    }

    public readWhile(predicate: (next: string) => boolean) {
        let result = ''

        while (!this.input.eof() && predicate(this.input.peek())) {
            result += this.input.next()
        }

        return result
    }

    public readNext(): Token<tokens> | null {
        this.readWhile(this.isWhitespace)

        if (this.input.eof()) {
            return null
        }

        const next = this.input.peek()

        if (specialCharacters.comment.includes(next)) {
            this.skipComment()
            return this.readNext()
        }

        if (specialCharacters.quote.includes(next)) {
            return this.readString(next)
        } else if (numberRegex.test(next)) {
            return this.readNumber()
        } else if (idStart.test(next)) {
            return this.readIdentifier()
        } else if (',;(){}[]'.includes(next)) {
            return new Token(tokens.punctuation, this.input.next())
        } else if (this.isOperator()) {
            return new Token(tokens.operator, this.readOperator()!)
        }

        this.input.croak(`Can't handle character: ${next}`)

        // ts doesn't konw the croak method throws
        throw ''
    }

    public next() {
        const token = this.current
        this.current = null

        return token || this.readNext()
    }

    public eof() {
        return this.peek() === null
    }

    public croak(message: string) {
        this.input.croak(message)
    }

    public peek() {
        if (this.current === null) {
            this.current = this.readNext()
        }

        return this.current!
    }
}
