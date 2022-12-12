import { TestCase, TestCaseData } from '../testcase'
import { spawnSync } from 'child_process'

const testCaseData: TestCaseData = {
    name: 'Ethernet Test',
    description: 'Tests the functionality of the ethernet connection.',
    test: async (testCase: TestCase) => {
        const process = spawnSync("ethtool eth0 | grep 'Speed: 1000Mb/s'", {
            timeout: 5000,
            shell: true,
        })
        if (process.status == 0) testCase.outcome = 'Success'
        else testCase.outcome = 'Fail'
    },
    requiresInteraction: false,
}

export const testCase: TestCase = new TestCase(testCaseData)
