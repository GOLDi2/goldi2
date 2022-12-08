import { TestCase, TestCaseData } from "../testcase"
import { spawnSync } from "child_process"

const testCaseData: TestCaseData = {
    name: "I2C Test",
    description: "Tests the functionality of the i2c rtc and eeprom modules.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            const proc = spawnSync("goldi-board-test-util i2c", {timeout: 5000, shell: true})
            if (proc.status == 0) 
                tc.outcome = "Success"
            else 
                tc.outcome = "Fail"
            resolve()
        })
    },
    dependencies: [],
    requiresInteraction: false
}

export const testCase: TestCase = new TestCase(testCaseData)