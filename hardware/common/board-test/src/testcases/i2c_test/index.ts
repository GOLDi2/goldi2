import { TestCase, TestCaseData } from '../testcase'
import { spawnSync } from 'child_process'

const testCaseData: TestCaseData = {
    name: 'I2C Test',
    description: 'Tests the functionality of the i2c rtc and eeprom modules.',
    test: async (testCase: TestCase) => {
        const process = spawnSync('goldi-board-test-util i2c', {
            timeout: 5000,
            shell: true,
        })
        if (process.status == 0) testCase.outcome = 'Success'
        else testCase.outcome = 'Fail'
    },
    requiresInteraction: false,
}

export const testCase: TestCase = new TestCase(testCaseData)
