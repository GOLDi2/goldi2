import { TestCase, TestCaseData } from "../testcase"
import { spawnSync } from "child_process"

const testCaseData: TestCaseData = {
    name: "Ethernet Test",
    description: "Tests the functionality of the ethernet connection.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            const proc = spawnSync("ethtool eth0 | grep 'Speed: 1000Mb/s'", {timeout: 5000, shell: true})
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