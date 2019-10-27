import { operatorIds, unaryOperator } from '../constants/operators'

export enum AstNodeType {
    number,
    string,
    boolean,
    variable,
    conditional,
    functionCall,
    anonymousFunction,
    unaryOperator,
    binaryOperator,
    program,
    define,
    assign
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
    [AstNodeType.define]: {
        pairs: Record<string, Ast>
    }
    [AstNodeType.conditional]: {
        condition: Ast
        then: Ast
        else?: Ast
    }
    [AstNodeType.unaryOperator]: {
        operator: unaryOperator
        body: Ast
    }
    [AstNodeType.binaryOperator]: {
        operator: operatorIds
        left: Ast
        right: Ast
    }
    [AstNodeType.assign]: {
        operator: operatorIds
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
