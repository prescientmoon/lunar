export enum operators {
    add = '+',
    substract = '-',
    multiply = '*',
    divide = '/',
    moduo = '%',
    assign = '=',
    and = '&',
    or = '|',
    smaller = '<',
    greater = '>',
    not = '!',
    dot = '.'
}

export const operatorValues = Object.values(operators).filter(
    operator => operator.length === 1
) as Array<operators & string>
