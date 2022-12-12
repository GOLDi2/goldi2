import { TestCase, TestCaseData } from '../testcase'
import * as readline from 'readline'

const testCaseData: TestCaseData = {
    name: 'USB Slave Test',
    description: 'Tests if the USB Slave is working properly.',
    test: async (testCase: TestCase) => {
        const input = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })
        return new Promise<void>((resolve) => {
            input.question("Please write 'GOLDi' and press enter: ", (str) => {
                if (str == 'GOLDi') testCase.outcome = 'Success'
                else testCase.outcome = 'Fail'
                input.close()
                resolve()
            })
        })
    },
    requiresInteraction: true,
}

export const testCase: TestCase = new TestCase(testCaseData)
