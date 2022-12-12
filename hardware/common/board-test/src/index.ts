#!/usr/bin/env node

import * as fs from 'fs'
import { exit } from 'process'
import { testCasesMicrocontroller, testCasesIO } from './testcases'
import { TestCase, TestCaseResult } from './testcases/testcase'

interface TestResult {
    result: 'Success' | 'Fail'
    testCaseResults: Array<TestCaseResult>
}

export const generatedTestsDir = __dirname + '/generated_tests'

async function executeTestCases(
    testCases: Array<TestCase>,
    saveResults: boolean,
    cbs?: {
        startedCb?: (testCase: TestCase) => any
        finishedCb?: (testCase: TestCase) => any
    }
): Promise<TestResult> {
    console.log('Starting Board Test!\n')

    const testResult: TestResult = { result: 'Success', testCaseResults: [] }

    for (const testCase of testCases) {
        if (!testCase.enabled) {
            testCase.skip()
            testResult.testCaseResults.push(testCase.getResult())
            if (cbs && cbs.finishedCb) cbs.finishedCb(testCase)
        } else {
            if (cbs && cbs.startedCb) cbs.startedCb(testCase)
            await testCase.run()
            testResult.testCaseResults.push(testCase.getResult())
            if (cbs && cbs.finishedCb) cbs.finishedCb(testCase)
        }
    }

    testResult.result = testResult.testCaseResults.find((tcr) => tcr.outcome === 'Fail')
        ? 'Fail'
        : 'Success'
    if (saveResults)
        fs.writeFileSync('TestResult.json', JSON.stringify(testResult, null, 4))
    return testResult
}

if (require.main === module) {
    if (process.argv.length == 3 && process.argv[2] == '--not-interactive') {
        for (const testCase of testCasesMicrocontroller) {
            testCase.enabled = testCase.requiresInteraction ? false : true
        }
    } else if (process.argv.length > 2) {
        console.log(process.argv)
        console.log('Unrecognized command line options!')
        exit(1)
    }
    // executeTestCases(testCasesMicrocontroller, true)
    executeTestCases(testCasesIO, false)
}
