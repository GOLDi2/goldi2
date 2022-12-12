import { TestCase, TestCaseData } from '../testcase'
import { askQuestion } from '../../utils/utilityFunctions'
import { spawnSync } from 'child_process'
import { generatedTestsDir } from '../..'
import { generateFaultReport } from '../../utils/faultReport'

export const testCaseData: TestCaseData = {
    name: 'IO Board GPIO Test',
    description: 'Tests if the GPIOs of the IO Board are working properly.',
    test: async (testCase: TestCase) => {
        for (const color of [
            'green',
            'grey',
            'blue',
            'white',
            'pink',
            'black',
            'red',
            'yellow',
        ]) {
            await askQuestion(
                `Please plug the ${color} cable in a 3.3V or 24V output module and press enter `
            )
            const process = spawnSync(
                `svf-player ${generatedTestsDir}/test_io_board_cable_${color}.svf -ni`,
                { timeout: 120000, shell: true }
            )
            if (process.status != 0) {
                testCase.outcome = 'Fail'
                generateFaultReport('io', 'cable', `fault_report_${color}_test.txt`)
            }
        }
        if (testCase.outcome != 'Fail') testCase.outcome = 'Success'
    },
    requiresInteraction: true,
}

export const testCase: TestCase = new TestCase(testCaseData)
