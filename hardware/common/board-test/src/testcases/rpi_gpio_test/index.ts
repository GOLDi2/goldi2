import { TestCase, TestCaseData } from "../testcase"
import { spawnSync } from "child_process"

// TODO: toggle on Raspberry Pi side and read from FPGA?
const testCaseData: TestCaseData = {
    name: "Raspberry Pi GPIO Test",
    description: "Tests if the GPIOs of the Raspberry Pi are working properly.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            const tests = [
                {pin: 12, value: 0},
                {pin: 12, value: 1},
                {pin: 16, value: 0},
                {pin: 16, value: 1},
                {pin: 27, value: 0},
                {pin: 27, value: 1}
            ]

            for (const test of tests) {
                const proc_svf = spawnSync(`svf-player ${__dirname}/test_rpi_gpio_write_${test.pin}_${test.value}.svf`, {timeout: 10000, shell: true})
                if (proc_svf.status != 0) {
                    tc.outcome = "Fail"
                    resolve()
                }
                const proc = spawnSync(`goldi-board-test-util gpio read ${test.pin} ${test.value}`, {timeout: 10000, shell: true})
                if (proc.status != 0) {
                    tc.outcome = "Fail"
                    resolve()
                }
            }

            const proc_svf = spawnSync(`svf-player ${__dirname}/test_reset_fpga.svf`, {timeout: 10000, shell: true})
            if (proc_svf.status != 0) {
                tc.outcome = "Fail"
                resolve()
            }

            for (const test of tests) {
                const proc = spawnSync(`goldi-board-test-util gpio write ${test.pin} ${test.value}`, {timeout: 10000, shell: true})
                if (proc.status != 0) {
                    tc.outcome = "Fail"
                    resolve()
                }
                const proc_svf = spawnSync(`svf-player ${__dirname}/test_rpi_gpio_read_${test.pin}_${test.value}.svf`, {timeout: 10000, shell: true})
                if (proc_svf.status != 0) {
                    tc.outcome = "Fail"
                    resolve()
                }
            }
            tc.outcome = "Success"
            resolve()
        })
    },
    dependencies: [],
    requiresInteraction: false
}

export const testCase: TestCase = new TestCase(testCaseData)