import assert from 'assert'
import { mapIoFpga } from '../svf-generator/pinMappings'

/**
 * Typing for the different variants of the io board modules.
 */
export type IOBoardModuleVariant = 'none' | '3.3V' | '5V' | '24V in' | '24V out'

/**
 * Typing for a valid io board pin position.
 */
export type IOBoardModulePin = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

/**
 * Typing for the different socket names of the io board.
 */
export type IOBoardSocketName = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H'

/**
 * Typing for the different cables of the io board.
 */
export type IOBoardCable =
    | 'green'
    | 'grey'
    | 'blue'
    | 'white'
    | 'pink'
    | 'black'
    | 'red'
    | 'yellow'
    | 'none'

export function isIOBoardModulePin(n: number): n is IOBoardModulePin {
    return n >= 0 && n < 8 && Number.isInteger(n)
}

export function isIOBoardModuleVariant(s: string): s is IOBoardModuleVariant {
    return ['none', '3.3V', '5V', '24V in', '24V out'].includes(s)
}

export function isIOBoardSocketName(s: string): s is IOBoardSocketName {
    return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].includes(s)
}

export function isIOBoardCable(s: string): s is IOBoardCable {
    return [
        'none',
        'green',
        'grey',
        'blue',
        'white',
        'pink',
        'black',
        'red',
        'yellow',
    ].includes(s)
}

export function ioBoardPinToSocket(
    n: number,
    configuration: IOBoardConfiguration
): IOBoardSocketName | 'none' {
    for (const cable of [
        'green',
        'grey',
        'blue',
        'white',
        'pink',
        'black',
        'red',
        'yellow',
    ]) {
        if ((configuration.cablePinsMapping as any)[cable].includes(n)) {
            return (configuration.cableSocketMapping as any)[cable] as IOBoardSocketName
        }
    }
    return 'none'
}

export function ioBoardPinToCable(
    n: number,
    configuration: IOBoardConfiguration
): IOBoardCable {
    for (const cable of [
        'green',
        'grey',
        'blue',
        'white',
        'pink',
        'black',
        'red',
        'yellow',
    ]) {
        if ((configuration.cablePinsMapping as any)[cable].includes(n)) {
            return cable as IOBoardCable
        }
    }
    return 'none'
}

export function ioBoardSocketToPinOffset(s: IOBoardSocketName): number {
    switch (s) {
        case 'A':
            return 0
        case 'B':
            return 8
        case 'C':
            return 16
        case 'D':
            return 24
        case 'E':
            return 32
        case 'F':
            return 40
        case 'G':
            return 48
        case 'H':
            return 56
    }
}

export function ioBoardBoardPinToSocket(board_pin: number): IOBoardSocketName | 'none' {
    if (board_pin >= 0 && board_pin < 8) return 'A'
    if (board_pin >= 8 && board_pin < 16) return 'B'
    if (board_pin >= 16 && board_pin < 24) return 'C'
    if (board_pin >= 24 && board_pin < 32) return 'D'
    if (board_pin >= 32 && board_pin < 40) return 'E'
    if (board_pin >= 40 && board_pin < 48) return 'F'
    if (board_pin >= 48 && board_pin < 56) return 'G'
    if (board_pin >= 56 && board_pin < 64) return 'H'
    return 'none'
}

export function ioBoardSocketToCable(
    socket: IOBoardSocketName,
    configuration: IOBoardConfiguration
): IOBoardCable {
    for (const cable of [
        'green',
        'grey',
        'blue',
        'white',
        'pink',
        'black',
        'red',
        'yellow',
    ]) {
        if ((configuration.cableSocketMapping as any)[cable] === socket) {
            return cable as IOBoardCable
        }
    }
    return 'none'
}

export type IOBoardConfiguration = {
    sockets: {
        A: IOBoardModuleVariant
        B: IOBoardModuleVariant
        C: IOBoardModuleVariant
        D: IOBoardModuleVariant
        E: IOBoardModuleVariant
        F: IOBoardModuleVariant
        G: IOBoardModuleVariant
        H: IOBoardModuleVariant
        [k: string]: IOBoardModuleVariant
    }
    cablePinsMapping: {
        green: number[]
        grey: number[]
        blue: number[]
        white: number[]
        pink: number[]
        black: number[]
        red: number[]
        yellow: number[]
        [k: string]: number[]
    }
    cableSocketMapping: {
        green: IOBoardSocketName | 'none'
        grey: IOBoardSocketName | 'none'
        blue: IOBoardSocketName | 'none'
        white: IOBoardSocketName | 'none'
        pink: IOBoardSocketName | 'none'
        black: IOBoardSocketName | 'none'
        red: IOBoardSocketName | 'none'
        yellow: IOBoardSocketName | 'none'
        [k: string]: IOBoardSocketName | 'none'
    }
    modulePinMapping: {
        0: IOBoardModulePin
        1: IOBoardModulePin
        2: IOBoardModulePin
        3: IOBoardModulePin
        4: IOBoardModulePin
        5: IOBoardModulePin
        6: IOBoardModulePin
        7: IOBoardModulePin
        [k: number]: IOBoardModulePin
    }
    connections: [number, number][]
}

export function isValidIOBoardConfiguration(
    configuration: any
): configuration is IOBoardConfiguration {
    const cables = ['green', 'grey', 'blue', 'white', 'pink', 'black', 'red', 'yellow']

    // check configuration is an object
    if (typeof configuration !== 'object') return false

    // check that sockets exist and are valid
    if (!configuration.sockets) return false
    for (const socket of ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']) {
        if (
            !configuration.sockets[socket] ||
            !isIOBoardModuleVariant(configuration.sockets[socket])
        )
            return false
    }

    // check that cable pins mappings exist and are valid
    if (!configuration.cablePinsMapping) return false
    for (const cable of cables) {
        if (!configuration.cablePinsMapping[cable]) return false
        if (!Array.isArray(configuration.cablePinsMapping[cable])) return false
        if (configuration.cablePinsMapping[cable].length !== 8) return false
        for (const pin of configuration.cablePinsMapping[cable]) {
            if (typeof pin !== 'number') return false
            if (!mapIoFpga[pin]) return false
        }
    }

    // check that each pin belongs to one and only one cable
    for (const pin in mapIoFpga) {
        let found = false
        let foundCable = undefined
        for (const cable of cables) {
            if (configuration.cablePinsMapping[cable].includes(pin)) {
                found = true
                foundCable = cable
                break
            }
        }
        assert(found && foundCable)

        found = false
        for (const cable of cables) {
            if (cable == foundCable) continue
            if (configuration.cablePinsMapping[cable].includes(pin)) {
                found = true
                foundCable = cable
                break
            }
        }
        assert(!found)
    }

    // check that cable socket mappings exist and are valid
    if (!configuration.cableSocketMapping) return false
    for (const cable of cables) {
        if (
            !configuration.cableSocketMapping[cable] ||
            (!isIOBoardSocketName(configuration.cableSocketMapping[cable]) &&
                configuration.cableSocketMapping[cable] !== 'none')
        )
            return false
        if (configuration.cableSocketMapping[cable] !== 'none') {
            if (configuration.sockets[configuration.cableSocketMapping[cable]] === 'none')
                return false
        }
    }

    // check that module pin mappings exist and are valid
    if (!configuration.modulePinMapping) return false
    if (typeof configuration.modulePinMapping !== 'object') return false
    for (let i = 0; i < 8; i++) {
        if (
            configuration.modulePinMapping[i] === undefined ||
            !isIOBoardModulePin(configuration.modulePinMapping[i])
        )
            return false
    }

    // check that connections are valid
    if (configuration.connections) {
        if (!Array.isArray(configuration.connections)) return false
        for (const connection of configuration.connections) {
            if (!Array.isArray(connection)) return false
            if (connection.length !== 2) return false
            if (typeof connection[0] !== 'number' || typeof connection[1] !== 'number')
                return false
            if (!mapIoFpga[connection[0]] || !mapIoFpga[connection[1]]) return false

            let module1
            let module2
            for (const cable of cables) {
                if (!configuration.cablePinsMapping[cable].includes(connection[0])) {
                    module1 =
                        configuration.sockets[configuration.cableSocketMapping[cable]]
                }
                if (!configuration.cablePinsMapping[cable].includes(connection[1])) {
                    module2 =
                        configuration.sockets[configuration.cableSocketMapping[cable]]
                }
            }
            if (
                module1 !== module2 &&
                !(module1 === '24V in' && module2 === '24V out') &&
                !(module1 === '24V out' && module2 === '24V in')
            )
                return false
        }
    }

    return true
}
