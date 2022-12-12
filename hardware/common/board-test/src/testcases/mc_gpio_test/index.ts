import { TestCase, TestCaseData } from '../testcase'
import { spawnSync } from 'child_process'
import { generatedTestsDir } from '../..'
import { generateFaultReport } from '../../utils/faultReport'

const testCaseData: TestCaseData = {
    name: 'Microcontroller GPIO Test',
    description: 'Tests if the GPIOs of the Microcontroller are working properly.',
    test: async (testCase: TestCase) => {
        const testTypes: ('running-0' | 'running-1')[] = ['running-0', 'running-1']

        for (const testType of testTypes) {
            const process = spawnSync(
                `svf-player ${generatedTestsDir}/test_fpga_mc_${testType}.svf -ni`,
                { timeout: 120000, shell: true }
            )

            if (process.status != 0) {
                testCase.outcome = 'Fail'
                generateFaultReport(
                    'mc',
                    testType,
                    `fault_report_${testType.replace('-', '_')}_test.txt`
                )
            }
        }

        if (testCase.outcome != 'Fail') testCase.outcome = 'Success'
    },
    requiresInteraction: false,
}

export const testCase: TestCase = new TestCase(testCaseData)
