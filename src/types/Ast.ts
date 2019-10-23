import { operators } from '../constants/operators'

export enum AstNodeType {
    number,
    string,
    boolean,
    variable,
    conditional,
    assign,
    functionCall,
    anonymousFunction,
    binaryOperator,
    program
}

export type AstNodeBody = {
    [AstNodeType.number]: {
        value: number
    }
    [AstNodeType.string]: {
        value: string
    }
    [AstNodeType.boolean]: {
        value: boolean
    }
    [AstNodeType.variable]: {
        value: string
    }
    [AstNodeType.conditional]: {
        condition: Ast
        then: Ast
        else?: Ast
    }
    [AstNodeType.assign]: {
        operator: operators.assign
        left: Ast
        right: Ast
    }
    [AstNodeType.binaryOperator]: {
        operator: operators
        left: Ast
        right: Ast
    }
    [AstNodeType.program]: {
        program: Program
    }
    [AstNodeType.functionCall]: {
        target: Ast
        arguments: Program
    }
    [AstNodeType.anonymousFunction]: {
        arguments: string[]
        body: Ast
    }
}

export type Ast<T extends AstNodeType = AstNodeType> = {
    type: T
} & AstNodeBody[T]

export type Program = Ast[]
