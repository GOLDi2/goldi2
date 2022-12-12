import { TestCase, TestCaseData } from '../testcase'
import { spawnSync } from 'child_process'
import { programFPGA } from '../../utils/utilityFunctions'
import * as _process from 'node:process'

const testCaseData: TestCaseData = {
    name: 'LED Test',
    description: 'Tests if the LEDs are working properly.',
    test: async (testCase: TestCase) => {
        if (!programFPGA()) {
            testCase.outcome = 'Fail'
            return
        }
        const process = spawnSync('goldi-board-test-util led', {
            timeout: 120000,
            shell: true,
            cwd: _process.cwd(),
            env: _process.env,
            stdio: [_process.stdin, _process.stdout, _process.stderr],
            encoding: 'utf-8',
        })
        if (process.status == 0) testCase.outcome = 'Success'
        else testCase.outcome = 'Fail'
    },
    requiresInteraction: true,
}

export const testCase: TestCase = new TestCase(testCaseData)
