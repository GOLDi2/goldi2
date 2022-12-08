import { TestCase, TestCaseData } from "../testcase"

const testCaseData: TestCaseData = {
    name: "True Test",
    description: "This simple test always succeeds.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            tc.outcome = "Success"
            resolve()
        })
    },
    dependencies: [],
    requiresInteraction: false
}

export const testCase: TestCase = new TestCase(testCaseData)