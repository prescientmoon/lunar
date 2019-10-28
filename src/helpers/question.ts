import { createInterface } from 'readline'

export const question = (question: string) => {
    const readline = createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise<string>(resolve => {
        readline.question(question, answer => {
            readline.close()
            resolve(answer)
        })
    })
}
