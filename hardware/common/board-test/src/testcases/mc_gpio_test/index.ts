import { TestCase, TestCaseData } from "../testcase"
import { spawnSync } from "child_process"
import { generatedTestsDir } from "../.."
import { check_values } from "../../jtag-over-svf/util"
import * as fs from "fs"
import { bsdl_fpga } from "../../jtag-over-svf/globals"

const testCaseData: TestCaseData = {
    name: "Microcontroller GPIO Test",
    description: "Tests if the GPIOs of the Microcontroller are working properly.",
    test: (tc: TestCase) => {
        return new Promise<void>(resolve => {
            const proc_0 = spawnSync(`svf-player ${generatedTestsDir}/test_fpga_mc_0.svf -ni`, {timeout: 120000, shell: true})
            if (proc_0.status != 0) {
                tc.outcome = "Fail"
                const str = fs.readFileSync("/tmp/svf_output.json", {encoding: "utf-8"})
                const faults = JSON.parse(str)["faults"]
                check_values(faults, bsdl_fpga, "faults_mc_gpio_0")
            }
            const proc_1 = spawnSync(`svf-player ${generatedTestsDir}/test_fpga_mc_1.svf -ni`, {timeout: 120000, shell: true})
            if (proc_1.status != 0) {
                tc.outcome = "Fail"
                const str = fs.readFileSync("/tmp/svf_output.json", {encoding: "utf-8"})
                const faults = JSON.parse(str)["faults"]
                check_values(faults, bsdl_fpga, "faults_mc_gpio_1")
            }
            if (tc.outcome != "Fail") tc.outcome = "Success"
            resolve()
        })
    },
    dependencies: [],
    requiresInteraction: false
}

export const testCase: TestCase = new TestCase(testCaseData)