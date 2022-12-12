import { spawnSync } from 'child_process'
import { generatedTestsDir } from '../..'
import { TestCase, TestCaseData } from '../testcase'
import { askQuestion, pathCompleter } from '../../utils/utilityFunctions'
import * as fs from 'fs'
import { generateTestFromConfiguration } from './testGenerator'
import { generateFaultReport } from '../../utils/faultReport'
import { IOBoardConfiguration } from '../../utils/ioBoard'

const testCaseData: TestCaseData = {
    name: 'IO Board GPIO Test',
    description: 'Tests if the GPIOs of the IO Board are working properly.',
    test: async (testCase: TestCase) => {
        const configPath = await askQuestion(
            'Please enter the path to the configuration file: ',
            { completer: pathCompleter }
        )
        const configString = fs.readFileSync(configPath, { encoding: 'utf-8' })
        const config = JSON.parse(configString.toString()) as IOBoardConfiguration
        generateTestFromConfiguration(config)

        const process = spawnSync(
            `svf-player ${generatedTestsDir}/test_io_board.svf -ni`,
            { timeout: 120000, shell: true }
        )
        if (process.status != 0) {
            testCase.outcome = 'Fail'
            generateFaultReport(
                'io',
                'configuration',
                `fault_report_configuration_test.txt`,
                config
            )
        }

        if (testCase.outcome != 'Fail') testCase.outcome = 'Success'
    },
    requiresInteraction: true,
}

export const testCase: TestCase = new TestCase(testCaseData)
