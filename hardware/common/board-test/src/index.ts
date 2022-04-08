#!/usr/bin/env node

import * as fs from "fs"
import { exit } from "process"
import { testCases } from "./testcases"
import { TestCase, TestCaseResult } from "./testcases/testcase"

interface TestResult {
    result: "Success" | "Fail" | "Unfulfillable"
    testCaseResults: Array<TestCaseResult>
}

const testResult: TestResult = {result: "Success", testCaseResults: []}
let done: Array<TestCase> = []
let interactive: boolean = true

if (process.argv.length == 3 && process.argv[2] == "--not-interactive") {
    interactive = false
} else if (process.argv.length > 2) {
    console.log(process.argv)
    console.log("Unrecognized command line options!")
    exit(1)
}

async function main() {
    console.log("Starting Board Test!\n")

    let i = 0;
    let c_length = testCases.length
    let n_length = testCases.length

    while (testCases.length > 0) {
        const testCase = testCases.shift();

        if (!testCase) {
            console.log("One of the test cases is undefined!")
            exit(1)
        } else if (testCase.requiresInteraction && !interactive) {
            testCase.skip()
            testResult.testCaseResults.push(testCase.getResult())
        } else if (!testCase.dependencies || testCase.dependencies.every(dep => done.includes(dep))) {
            await testCase.run()
            if (testCase.outcome != "Success") {
                testResult.result = "Fail"
            } else {
                done.push(testCase);
            }
            testResult.testCaseResults.push(testCase.getResult())
        } else {
            testCases.push(testCase)
        }

        n_length = testCases.length

        if (c_length == n_length) {
            i++;
            if (i == testCases.length) {
                testResult.result = "Unfulfillable"
                for (const tc of testCases) {
                    tc.outcome = "Unfulfillable"
                    tc.logHeader()
                    tc.logResult()
                    testResult.testCaseResults.push(tc.getResult())
                }
                break
            }
        } else {
            i = 0;
            c_length = n_length;
        }
    }

    fs.writeFileSync("TestResult.json", JSON.stringify(testResult, null, 4))
}

main()