import { TestCase, TestCaseData } from "../testcase"
import { spawnSync } from "child_process"

const testCaseData: TestCaseData = {
    name: "Programming Test FPGA",
    description: "Tests if the FPGA can be programmed.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            const proc = spawnSync(`svf-player ${__dirname}/programming_file.svf`, {timeout: 10000, shell: true})
            if (proc.status == 0) 
                tc.outcome = "Success"
            else 
                tc.outcome = "Fail"
            resolve()
        })
    },
    dependencies: [],
    requiresInteraction: false
}

export const testCase: TestCase = new TestCase(testCaseData)