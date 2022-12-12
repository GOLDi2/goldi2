import { TestCase, TestCaseData } from '../testcase'
import { spawnSync } from 'child_process'
import { programFPGA } from '../../utils/utilityFunctions'

const testCaseData: TestCaseData = {
    name: 'SPI Test',
    description: 'Tests the functionality of the Raspberry Pi SPI interfaces.',
    test: async (testCase: TestCase) => {
        if (!programFPGA()) {
            testCase.outcome = 'Fail'
            return
        }
        const process = spawnSync('goldi-board-test-util spi', {
            timeout: 10000,
            shell: true,
        })
        if (process.status == 0) testCase.outcome = 'Success'
        else testCase.outcome = 'Fail'
    },
    requiresInteraction: false,
}

export const testCase: TestCase = new TestCase(testCaseData)
