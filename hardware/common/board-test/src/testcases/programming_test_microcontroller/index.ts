import { TestCase, TestCaseData } from "../testcase"
import { testCase as prog_fpga } from "../programming_test_fpga"

const testCaseData: TestCaseData = {
    name: "Programming Test Microcontroller",
    description: "Tests if the Microcontroller can be programmed.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            tc.outcome = "Fail"
            resolve()
        })
    },
    dependencies: [prog_fpga],
    requiresInteraction: false
}

export const testCase: TestCase = new TestCase(testCaseData)