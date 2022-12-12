import { TestCase, TestCaseData } from '../testcase'
import { programFPGA } from '../../utils/utilityFunctions'

const testCaseData: TestCaseData = {
    name: 'Programming Test FPGA',
    description: 'Tests if the FPGA can be programmed.',
    test: async (testCase: TestCase) => {
        testCase.outcome = programFPGA() ? 'Success' : 'Fail'
    },
    requiresInteraction: false,
}

export const testCase: TestCase = new TestCase(testCaseData)
