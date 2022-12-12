import { TestCase, TestCaseData } from '../testcase'

const testCaseData: TestCaseData = {
    name: 'True Test',
    description: 'This simple test always succeeds.',
    test: async (testCase: TestCase) => {
        testCase.outcome = 'Success'
    },
    requiresInteraction: false,
}

export const testCase: TestCase = new TestCase(testCaseData)
