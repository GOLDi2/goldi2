#!/usr/bin/env node

import * as fs from "fs"
import { exit } from "process"
import { testCases } from "./testcases"
import { TestCase, TestCaseResult } from "./testcases/testcase"

interface TestResult {
    result: "Success" | "Fail"
    testCaseResults: Array<TestCaseResult>
}

export const generatedTestsDir = __dirname + "/generated_tests";

async function executeTestCases(testCases: Array<TestCase>, saveResults: boolean, cbs?: {startedCb?: (testCase: TestCase) => any, finishedCb?: (testCase: TestCase) => any}): Promise<TestResult> {
    console.log("Starting Board Test!\n")

    const testResult: TestResult = {result: "Success", testCaseResults: []}
    let done: Array<TestCase> = []
    let i = 0;
    let c_length = testCases.length
    let n_length = testCases.length

    while (testCases.length > 0) {
        const testCase = testCases.shift();

        if (!testCase) {
            console.log("One of the test cases is undefined!")
            exit(1)
        } else if (!testCase.enabled) {
            testCase.skip()
            testResult.testCaseResults.push(testCase.getResult())
            if (cbs && cbs.finishedCb) cbs.finishedCb(testCase);
        } else if (!testCase.dependencies || testCase.dependencies.every(dep => done.includes(dep))) {
            if (cbs && cbs.startedCb) cbs.startedCb(testCase);
            await testCase.run()
            if (testCase.outcome != "Success") {
                testResult.result = "Fail"
            } else {
                done.push(testCase);
            }
            testResult.testCaseResults.push(testCase.getResult())
            if (cbs && cbs.finishedCb) cbs.finishedCb(testCase);
        } else {
            testCases.push(testCase)
        }

        n_length = testCases.length

        if (c_length == n_length) {
            i++;
            if (i == testCases.length) {
                testResult.result = "Fail"
                for (const tc of testCases) {
                    tc.outcome = "Unfulfillable"
                    tc.logHeader()
                    tc.logResult()
                    testResult.testCaseResults.push(tc.getResult())
                    if (cbs && cbs.finishedCb) cbs.finishedCb(tc);
                }
                break
            }
        } else {
            i = 0
            c_length = n_length
        }
    }

    if (saveResults) fs.writeFileSync("TestResult.json", JSON.stringify(testResult, null, 4))
    return testResult;
}

if (require.main === module) {
    if (process.argv.length == 3 && process.argv[2] == "--not-interactive") {
        for (const testCase of testCases) {
            testCase.enabled = testCase.requiresInteraction ? false : true
        }
    } else if (process.argv.length > 2) {
        console.log(process.argv)
        console.log("Unrecognized command line options!")
        exit(1)
    }
    executeTestCases(testCases, true)
}