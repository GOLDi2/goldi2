import { TestCase, TestCaseData } from "../testcase"

const testCaseData: TestCaseData = {
    name: "GPIO Test",
    description: "Tests if the GPIOs are working properly.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            tc.outcome = "Fail"
            resolve()
        })
    },
    dependencies: [],
    requiresInteraction: false
}

export const testCase: TestCase = new TestCase(testCaseData)