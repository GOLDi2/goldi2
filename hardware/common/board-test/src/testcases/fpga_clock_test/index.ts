import { TestCase, TestCaseData } from "../testcase"
import { testCase as prog_fpga } from "../programming_test_fpga"
import { spawnSync } from "child_process"

export const testCaseData: TestCaseData = {
    name: "FPGA Clock Test",
    description: "Tests the frequency of the external FPGA Oscillator.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            const proc = spawnSync("goldi-board-test-util clk", {timeout: 10000, shell: true})
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