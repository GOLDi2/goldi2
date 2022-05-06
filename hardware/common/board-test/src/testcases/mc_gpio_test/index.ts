import { TestCase, TestCaseData } from "../testcase"
import { spawnSync } from "child_process"

// TODO: toggle on Raspberry Pi side and read from FPGA?
const testCaseData: TestCaseData = {
    name: "Raspberry Pi GPIO Test",
    description: "Tests if the GPIOs of the Raspberry Pi are working properly.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            const proc_0 = spawnSync(`svf-player ${__dirname}/test_fpga_mc_0.svf > /tmp/log_test_0`, {timeout: 10000, shell: true})
            if (proc_0.status != 0) {
                tc.outcome = "Fail"
            }
            const proc_1 = spawnSync(`svf-player ${__dirname}/test_fpga_mc_1.svf > /tmp/log_test_1`, {timeout: 10000, shell: true})
            if (proc_1.status != 0) {
                tc.outcome = "Fail"
            }
            if (tc.outcome != "Fail") tc.outcome = "Success"
            resolve()
        })
    },
    dependencies: [],
    requiresInteraction: false
}

export const testCase: TestCase = new TestCase(testCaseData)