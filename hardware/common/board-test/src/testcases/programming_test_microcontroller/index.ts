import { TestCase, TestCaseData } from '../testcase'
import { spawnSync } from 'child_process'
import { programFPGA } from '../../utils/utilityFunctions'

const testCaseData: TestCaseData = {
    name: 'Programming Test Microcontroller',
    description: 'Tests if the Microcontroller can be programmed.',
    test: async (testCase: TestCase) => {
        if (!programFPGA()) {
            testCase.outcome = 'Fail'
            return
        }
        const process = spawnSync(`avrdude -p m2560 -c rpi -e`, {
            timeout: 10000,
            shell: true,
        })
        if (process.status == 0) testCase.outcome = 'Success'
        else testCase.outcome = 'Fail'
    },
    requiresInteraction: false,
}

export const testCase: TestCase = new TestCase(testCaseData)
