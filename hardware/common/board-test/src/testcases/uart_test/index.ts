import { TestCase, TestCaseData } from "../testcase"
import { testCase as prog_fpga } from "../programming_test_fpga"
import { spawnSync } from "child_process"

const testCaseData: TestCaseData = {
    name: "UART Test",
    description: "Tests the functionality of the Raspberry Pi UART interface.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            const proc = spawnSync("goldi-board-test-util uart", {timeout: 120000, shell: true})
            if (proc.status == 0) 
                tc.outcome = "Success"
            else 
                tc.outcome = "Fail"
            resolve()
        })
    },
    dependencies: [prog_fpga],
    requiresInteraction: false
}

export const testCase: TestCase = new TestCase(testCaseData)