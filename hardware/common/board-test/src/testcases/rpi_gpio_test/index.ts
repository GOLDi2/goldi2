import { TestCase, TestCaseData } from '../testcase'
import { spawnSync } from 'child_process'
import { generatedTestsDir } from '../..'

const testCaseData: TestCaseData = {
    name: 'Raspberry Pi GPIO Test',
    description: 'Tests if the GPIOs of the Raspberry Pi are working properly.',
    test: async (testCase: TestCase) => {
        const tests = [
            { pin: 12, value: 0 },
            { pin: 12, value: 1 },
            { pin: 16, value: 0 },
            { pin: 16, value: 1 },
            { pin: 27, value: 0 },
            { pin: 27, value: 1 },
        ]

        for (const test of tests) {
            const process_svf = spawnSync(
                `svf-player ${generatedTestsDir}/test_rpi_gpio_write_${test.pin}_${test.value}.svf`,
                { timeout: 10000, shell: true }
            )
            if (process_svf.status != 0) {
                testCase.outcome = 'Fail'
                return
            }
            const process = spawnSync(
                `goldi-board-test-util gpio read ${test.pin} ${test.value}`,
                { timeout: 10000, shell: true }
            )
            if (process.status != 0) {
                testCase.outcome = 'Fail'
                return
            }
        }

        const process_svf = spawnSync(
            `svf-player ${generatedTestsDir}/test_reset_fpga.svf`,
            { timeout: 10000, shell: true }
        )
        if (process_svf.status != 0) {
            testCase.outcome = 'Fail'
            return
        }

        for (const test of tests) {
            const process = spawnSync(
                `goldi-board-test-util gpio write ${test.pin} ${test.value}`,
                { timeout: 10000, shell: true }
            )
            if (process.status != 0) {
                testCase.outcome = 'Fail'
                return
            }
            const proc_svf = spawnSync(
                `svf-player ${generatedTestsDir}/test_rpi_gpio_read_${test.pin}_${test.value}.svf`,
                { timeout: 10000, shell: true }
            )
            if (proc_svf.status != 0) {
                testCase.outcome = 'Fail'
                return
            }
        }
        testCase.outcome = 'Success'
    },
    requiresInteraction: false,
}

export const testCase: TestCase = new TestCase(testCaseData)
