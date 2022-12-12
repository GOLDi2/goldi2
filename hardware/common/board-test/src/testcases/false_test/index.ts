import { TestCase, TestCaseData } from '../testcase'

const testCaseData: TestCaseData = {
    name: 'False Test',
    description: 'This simple test always fails.',
    test: async (testCase: TestCase) => {
        testCase.outcome = 'Fail'
    },
    requiresInteraction: false,
}

export const testCase: TestCase = new TestCase(testCaseData)
