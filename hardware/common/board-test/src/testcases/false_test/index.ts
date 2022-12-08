import { TestCase, TestCaseData } from "../testcase"

export const testCaseData: TestCaseData = {
    name: "False Test",
    description: "This simple test always fails.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            tc.outcome = "Fail"
            resolve()
        })
    },
    dependencies: [],
    requiresInteraction: false
}

export const testCase: TestCase = new TestCase(testCaseData);