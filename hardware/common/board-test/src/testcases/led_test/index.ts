import { TestCase, TestCaseData } from "../testcase"
import { spawnSync } from "child_process"
import { testCase as prog_fpga } from "../programming_test_fpga"

const testCaseData: TestCaseData = {
    name: "LED Test",
    description: "Tests if the LEDs are working properly.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            const proc = spawnSync("goldi-board-test-util led", 
                {
                    timeout: 120000, 
                    shell: true,
                    cwd: process.cwd(),
                    env: process.env,
                    stdio: [process.stdin, process.stdout, process.stderr],
                    encoding: 'utf-8'
                })
            if (proc.status == 0) 
                tc.outcome = "Success"
            else 
                tc.outcome = "Fail"
            resolve()
        })
    },
    dependencies: [prog_fpga],
    requiresInteraction: true
}

export const testCase: TestCase = new TestCase(testCaseData)