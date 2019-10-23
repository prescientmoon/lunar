export enum operators {
    add = '+',
    substract = '-',
    multiply = '*',
    divide = '/',
    modulo = '%',
    assign = '=',
    and = '&',
    or = '|',
    smaller = '<',
    smallerOrEqual = '<=',
    greater = '>',
    greaterOrEqual = '<=',
    equal = '==',
    notEqual = '!=',
    not = '!'
}

export const operatorValues = Object.values(operators).filter(
    operator => operator.length === 1
) as Array<operators & string>

export const operatorImportance: Record<operators, number> = {
    [operators.assign]: 1,
    [operators.or]: 2,
    [operators.and]: 3,
    [operators.smaller]: 7,
    [operators.greater]: 7,
    [operators.smallerOrEqual]: 7,
    [operators.greaterOrEqual]: 7,
    [operators.equal]: 7,
    [operators.notEqual]: 7,
    [operators.add]: 10,
    [operators.substract]: 10,
    [operators.multiply]: 20,
    [operators.divide]: 20,
    [operators.modulo]: 20,
    [operators.not]: 21
}
