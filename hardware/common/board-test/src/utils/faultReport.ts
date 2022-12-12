import { mapFpgaIo, mapFpgaMc, mapIoFpga, mapMcFpga } from '../svf-generator/pinMappings'
import fs from 'fs'
import assert from 'assert'
import { BsdlData, bsdlFpga } from '../svf-generator/bsdl'
import { hexToBin } from './utilityFunctions'
import { FaultyTest, MCBoardTestLabel } from './types'
import { IOBoardConfiguration } from './ioBoard'

/**
 * Interface for a svf fault.
 */
interface SVF_Fault {
    label: string
    tdi: string
    tdo: string
    mask: string
    data: string
}

/**
 * Interface describing a stuck-at fault.
 */
interface StuckAtFault {
    type: 'stuck-at'
    fpgaPin: string
    value: string
}

/**
 * Interface describing a short circuit fault.
 */
interface ShortCircuitFault {
    type: 'short-circuit'
    pins: string[]
}

/**
 * Interface describing an unexplained fault.
 */
interface UnexplainedFault {
    type: 'unexplained'
    testedFpgaPin: string
    fpgaPin: string
    expected: string
    received: string
}

/**
 * Interface describing the status of an fpga pin.
 */
interface PinStatus {
    fpgaPin: string
    value: string
}

/**
 * Typing for the status of a test.
 */
type TestStatus = PinStatus[]

/**
 * Interface for a test status parser function
 */
interface TestStatusParser {
    (
        boardType: 'mc',
        testType: 'running-0' | 'running-1',
        faultyTests: FaultyTest[]
    ): TestStatus[]
    (boardType: 'io', testType: 'cable', faultyTests: FaultyTest[]): TestStatus[]
    (
        boardType: 'io',
        testType: 'configuration',
        faultyTests: FaultyTest[],
        configuration: IOBoardConfiguration
    ): TestStatus[]
}

/**
 * Interface for a fault report generation function.
 */
interface FaultReportGenerator {
    (boardType: 'mc', testType: 'running-0' | 'running-1', filename: string): void
    (boardType: 'io', testType: 'cable', filename: string): void
    (
        boardType: 'io',
        testType: 'configuration',
        filename: string,
        configuration: IOBoardConfiguration
    ): void
}

/**
 * This function parses svf faults to their corresponding faulty tests.
 * @param boardType The type of the board that was used for the tests.
 * @param svfFaults The svf faults that occurred.
 * @param bsdlFpga The bsdl data of the fpga.
 * @returns The parsed faulty tests.
 */
export function parseFaultyTests(
    boardType: 'mc' | 'io',
    svfFaults: SVF_Fault[],
    bsdlFpga: BsdlData
): FaultyTest[] {
    const output: FaultyTest[] = []
    const mapping = boardType == 'io' ? mapIoFpga : mapMcFpga

    for (const fault of svfFaults) {
        const label: MCBoardTestLabel = JSON.parse(fault.label)
        output.push({
            fpgaPin: label.fpgaPin,
            expected: label.expected,
            faults: [],
        })
        const tdo = hexToBin(fault.tdo, bsdlFpga.boundaryCellsLength)
        const mask = hexToBin(fault.mask, bsdlFpga.boundaryCellsLength)
        const data = hexToBin(fault.data, bsdlFpga.boundaryCellsLength)
        for (const pin in mapping) {
            const boundaryCell = bsdlFpga.boundaryCells.find(
                (boundaryCell) => boundaryCell.pin == mapping[pin]
            )
            if (
                boundaryCell &&
                mask[mask.length - boundaryCell.cellNumber - 1] == '1' &&
                tdo[tdo.length - boundaryCell.cellNumber - 1] !=
                    data[data.length - boundaryCell.cellNumber - 1]
            ) {
                output[output.length - 1].faults.push({
                    fpgaPin: mapping[pin],
                    expected: tdo[tdo.length - boundaryCell.cellNumber - 1],
                    received: data[data.length - boundaryCell.cellNumber - 1],
                })
            }
        }
    }
    return output
}

/**
 * This function parses the pin statuses for each test from the provided faults.
 * @param boardType The type of the board that was used for the tests.
 * @param testType The type of test that was executed.
 * @param faultyTests A list of the faulty tests.
 * @param configuration The configuration of the io board that was used.
 * @returns The status of each test.
 */
export const parseTestStatuses: TestStatusParser = (
    boardType: 'io' | 'mc',
    testType: 'running-0' | 'running-1' | 'cable' | 'configuration',
    faultyTests: FaultyTest[],
    configuration?: IOBoardConfiguration
) => {
    const testStatuses: TestStatus[] = []
    const mapping = boardType == 'io' ? mapFpgaIo : mapFpgaMc

    for (const currentFpgaPin in mapping) {
        const testStatus: TestStatus = []
        const faultyTest = faultyTests.find(
            (faultyTest) => faultyTest.fpgaPin == currentFpgaPin
        )
        const value = testType == 'running-0' ? '0' : '1'

        // preset values
        for (const fpgaPin in mapping) {
            testStatus.push({
                fpgaPin: fpgaPin,
                value:
                    fpgaPin == currentFpgaPin
                        ? value == '0'
                            ? '0'
                            : '1'
                        : value == '0'
                        ? '1'
                        : '0',
            })
        }

        // apply configuration
        if (boardType == 'io' && testType == 'configuration') {
            assert(configuration)
            const currentIoPin = mapping[currentFpgaPin] as number
            assert(mapIoFpga[currentIoPin])

            // invert values of pins connected to 5V modules
            for (const pinStatus of testStatus) {
                const ioPin = mapping[pinStatus.fpgaPin] as number
                const cable = Object.keys(configuration.cablePinsMapping).find(
                    (cable) => {
                        if (configuration.cablePinsMapping[cable].includes(ioPin))
                            return cable
                    }
                )
                assert(cable)
                const socket = configuration.cableSocketMapping[cable]
                assert(socket)
                const module = socket != 'none' ? configuration.sockets[socket] : 'none'
                assert(module)
                if (module == '5V') {
                    pinStatus.value = pinStatus.value == '0' ? '1' : '0'
                }
            }

            // apply value of current io pin to its connected pins
            for (const connection of configuration.connections) {
                if (!connection.includes(currentIoPin)) continue

                const connectedIoPin =
                    connection[0] == currentIoPin ? connection[1] : connection[0]

                const currentPinStatus = testStatus.find(
                    (pinStatus) => pinStatus.fpgaPin == mapIoFpga[currentIoPin]
                )
                assert(currentPinStatus)

                for (const pinStatus of testStatus) {
                    if (pinStatus.fpgaPin == mapIoFpga[connectedIoPin])
                        pinStatus.value = currentPinStatus.value
                }
            }
        }

        // apply faults
        if (faultyTest) {
            for (const fault of faultyTest.faults) {
                const faultyPinIndex = testStatus.findIndex(
                    (pinStatus) => pinStatus.fpgaPin == fault.fpgaPin
                )!
                testStatus[faultyPinIndex].value = fault.received
            }
        }

        testStatuses.push(testStatus)
    }

    return testStatuses
}

/**
 * This function gets all stuck-at faults that occurred during testing.
 * @param testStatuses A list of the status of each test.
 * @returns All stuck-at fault that occurred during testing.
 */
export function getStuckAtFaults(testStatuses: TestStatus[]): StuckAtFault[] {
    const stuckAtFaults: StuckAtFault[] = []

    for (const fpgaPin in mapFpgaMc) {
        let isStuck: boolean = true
        let currentValue: string = 'none'

        for (const testStatus of testStatuses) {
            const pinStatus = testStatus.find(
                (pinStatus) => pinStatus.fpgaPin == fpgaPin
            )!
            const newValue = pinStatus.value

            if (currentValue == 'none') currentValue = newValue
            else if (currentValue != newValue) {
                isStuck = false
                break
            }
        }

        if (isStuck)
            stuckAtFaults.push({
                type: 'stuck-at',
                fpgaPin: fpgaPin,
                value: currentValue,
            })
    }

    return stuckAtFaults
}

/**
 * This function gets all shorts that occurred during testing.
 * @param testStatuses A list of the status of each test.
 * @param stuckAtFaults A list of all stuck-at faults that occurred.
 * @returns All shorts that occurred during testing.
 */
export function getShortFaults(
    testStatuses: TestStatus[],
    stuckAtFaults: StuckAtFault[]
): ShortCircuitFault[] {
    const shortFaults: ShortCircuitFault[] = []

    for (const currentFpgaPin in mapFpgaMc) {
        /**
         * This object maps the name of a pin to a boolean value,
         * which is true if the pin has the same value as the currently
         * viewed pin in all tests. Otherwise it maps to false.
         */
        const sameValues: { [k: string]: boolean } = {}
        let i = 0

        for (const testStatus of testStatuses) {
            const currentPinStatus = testStatus.find(
                (pinStatus) => pinStatus.fpgaPin == currentFpgaPin
            )!
            const stuckAtFault = stuckAtFaults.find(
                (stuckAtFault) => stuckAtFault.fpgaPin == currentFpgaPin
            )

            if (stuckAtFault) continue

            for (const fpgaPin in mapFpgaMc) {
                if (fpgaPin == currentFpgaPin) continue
                if (sameValues[fpgaPin] == undefined) sameValues[fpgaPin] = true
            }

            for (const pinStatus of testStatus) {
                if (pinStatus.fpgaPin == currentFpgaPin) continue
                if (!sameValues[pinStatus.fpgaPin]) continue
                sameValues[pinStatus.fpgaPin] = pinStatus.value == currentPinStatus.value
                if (!sameValues[pinStatus.fpgaPin]) i++
            }
        }

        for (const pin of Object.keys(sameValues)) {
            if (!sameValues[pin]) delete sameValues[pin]
        }

        if (Object.keys(sameValues).length > 0) {
            const shortFault: ShortCircuitFault = {
                type: 'short-circuit',
                pins: [currentFpgaPin],
            }

            for (const pin in sameValues) {
                if (sameValues[pin]) {
                    shortFault.pins.push(pin)
                }
            }

            shortFault.pins.sort((pin1, pin2) => pin1.localeCompare(pin2))
            shortFaults.push(shortFault)
        }
    }

    for (let i = 0; i < shortFaults.length; i++) {
        const current = shortFaults[i]
        shortFaults.reverse()
        const index = shortFaults.findIndex(
            (shortFault) =>
                JSON.stringify(shortFault.pins) === JSON.stringify(current.pins)
        )
        const lastIndex = shortFaults.length - 1 - index
        shortFaults.reverse()
        if (i != lastIndex) {
            shortFaults.splice(lastIndex, 1)
            i--
        }
    }

    return shortFaults
}

/**
 * This function gets all unexplained faults that occurred during testing.
 * @param faultyTests A list of the faulty tests.
 * @param stuckAtFaults A list of all stuck-at faults that occurred.
 * @param shortFaults A list of all shorts that occurred.
 * @returns All unexplained faults that occurred during testing.
 */
export function getUnexplainedFaults(
    faultyTests: FaultyTest[],
    stuckAtFaults: StuckAtFault[],
    shortFaults: ShortCircuitFault[]
): UnexplainedFault[] {
    const unexplainedFaults: UnexplainedFault[] = []

    for (const faultyTest of faultyTests) {
        const filteredShortFaults = shortFaults.filter((shortFault) => {
            let found = 0

            if (!shortFault.pins.includes(faultyTest.fpgaPin)) return false

            found++

            for (const f of faultyTest.faults) {
                if (shortFault.pins.includes(f.fpgaPin)) found++
            }

            return found == shortFault.pins.length
        })
        const shortedPins = filteredShortFaults.flatMap((shortFault) => shortFault.pins)
        for (const fault of faultyTest.faults) {
            const stuckAtFault = stuckAtFaults.find((saf) => saf.fpgaPin == fault.fpgaPin)
            const shortFault = shortedPins.includes(fault.fpgaPin)

            if (!stuckAtFault && !shortFault)
                unexplainedFaults.push({
                    ...fault,
                    type: 'unexplained',
                    testedFpgaPin: faultyTest.fpgaPin,
                })
        }
    }

    return unexplainedFaults
}

/**
 * This function generates a fault report for a failed svf-test.
 * @param boardType The type of the board that was used for the test.
 * @param testType The type of test that was executed.
 * @param filename The name of the file the fault report should be saved to.
 * @param configuration The configuration of the io board that was used.
 */
export const generateFaultReport: FaultReportGenerator = (
    boardType: 'io' | 'mc',
    testType: 'running-0' | 'running-1' | 'cable' | 'configuration',
    filename: string,
    configuration?: IOBoardConfiguration
) => {
    // load and parse faults
    const svfFaultsString = fs.readFileSync('/tmp/svf_output.json', {
        encoding: 'utf-8',
    })
    const svfFaults = JSON.parse(svfFaultsString)['faults']
    const faultyTests = parseFaultyTests(boardType, svfFaults, bsdlFpga)
    let testStatuses
    if (boardType == 'io') {
        assert(testType == 'cable' || testType == 'configuration')
        if (testType == 'cable') {
            testStatuses = parseTestStatuses(boardType, testType, faultyTests)
        } else {
            assert(configuration != undefined)
            testStatuses = parseTestStatuses(
                boardType,
                testType,
                faultyTests,
                configuration
            )
        }
    } else {
        assert(testType == 'running-0' || testType == 'running-1')
        testStatuses = parseTestStatuses(boardType, testType, faultyTests)
    }
    const stuckAtFaults = getStuckAtFaults(testStatuses)
    const shortFaults = getShortFaults(testStatuses, stuckAtFaults)
    const unexplainedFaults = getUnexplainedFaults(
        faultyTests,
        stuckAtFaults,
        shortFaults
    )

    // start building fault report
    const output: string[] = []
    output.push(
        `${testType.charAt(0).toUpperCase() + testType.slice(1)}-Test Fault Report:`
    )

    // build section for stuck-at faults
    output.push('\nStuck At Faults:')
    for (const stuckAtFault of stuckAtFaults) {
        const fpga_pin = stuckAtFault.fpgaPin
        const mc_pin = mapFpgaMc[stuckAtFault.fpgaPin]
        const value = stuckAtFault.value

        output.push(`- Pin ${fpga_pin}/${mc_pin} seems to be stuck at value "${value}"`)
    }

    // build section for short circuit faults
    output.push('\nShort Circuit Faults:')
    for (const shortFault of shortFaults) {
        const pins = shortFault.pins
        const lastPin = pins[pins.length - 1]
        const mappedPins = pins.map((pin) => `${pin}/${mapFpgaMc[pin]}`).slice(0, -1)

        output.push(
            `- Pins ${mappedPins.join(', ')} and ${lastPin}/${
                mapFpgaMc[lastPin]
            } seem to be shorted`
        )
    }

    // build section for unexplained faults
    output.push('\nUnexplained Faults:')
    const unexplainedFaultsOutput: { [k: string]: string[] } = {}
    for (const unexplainedFault of unexplainedFaults) {
        const tested_pin = `${unexplainedFault.testedFpgaPin}/${
            mapFpgaMc[unexplainedFault.testedFpgaPin]
        }`
        const fault_pin = `${unexplainedFault.fpgaPin}/${
            mapFpgaMc[unexplainedFault.fpgaPin]
        }`
        const expected = unexplainedFault.expected
        const received = unexplainedFault.received

        if (!unexplainedFaultsOutput[tested_pin]) unexplainedFaultsOutput[tested_pin] = []

        unexplainedFaultsOutput[tested_pin].push(
            `- Pin ${fault_pin} was expected to have value "${expected}" but had value "${received}"`
        )
    }
    for (const key in unexplainedFaultsOutput) {
        output.push(
            `- While testing pin ${key}:\n\t${unexplainedFaultsOutput[key].join('\n\t')}`
        )
    }

    // save fault report
    fs.writeFileSync(filename, output.join('\n'))
}
