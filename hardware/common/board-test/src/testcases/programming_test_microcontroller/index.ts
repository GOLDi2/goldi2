import { TestCase, TestCaseData } from "../testcase"
import { testCase as prog_fpga } from "../programming_test_fpga"
import { spawnSync } from "child_process"

const testCaseData: TestCaseData = {
    name: "Programming Test Microcontroller",
    description: "Tests if the Microcontroller can be programmed.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            const proc = spawnSync(`avrdude -p m2560 -c rpi -e`, {timeout: 10000, shell: true})
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