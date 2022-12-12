import * as readline from 'readline'
import * as fs from 'fs'
import { spawnSync } from 'child_process'

// TODO: fix implementation
export function pathCompleter(line: string) {
    const currentAddedDir =
        line.indexOf('/') != -1 ? line.substring(0, line.lastIndexOf('/') + 1) : ''
    const currentAddingDir = line.substring(line.lastIndexOf('/') + 1)
    const path = __dirname + '/' + currentAddedDir
    const completions = fs.readdirSync(path)
    const hits = completions.filter(
        (completion) => completion.indexOf(currentAddingDir) === 0
    )

    const strike = []
    if (hits.length === 1) strike.push(path + hits[0] + '/')

    return strike.length ? [strike, line] : [hits.length ? hits : completions, line]
}

export async function askQuestion(
    query: string,
    options: { completer?: (line: string) => (string | string[])[] } = {}
): Promise<string> {
    const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: options.completer,
    })

    return new Promise((resolve) =>
        readlineInterface.question(query, (answer: string) => {
            readlineInterface.close()
            resolve(answer)
        })
    )
}

export function programFPGA(
    programmingFile: string = `${__dirname}/files/programming_file.svf`
) {
    const process = spawnSync(`svf-player ${programmingFile}`, {
        timeout: 10000,
        shell: true,
    })
    if (process.status == 0) return true
    else return false
}

export function binToHex(string: string): string {
    let hexString = ''
    const remainder = string.length % 4
    const leadingZeroes = remainder == 0 ? (string.length == 0 ? 4 : 0) : 4 - remainder
    const preparedString = '0'.repeat(leadingZeroes) + string
    for (let i = 0; i < string.length; i += 4) {
        hexString =
            hexString +
            parseInt(preparedString.substring(i, i + 4), 2)
                .toString(16)
                .toUpperCase()
    }
    return hexString
}

export function hexToBin(string: string, length: number = string.length * 4): string {
    let binaryString = ''
    for (let i = 0; i < string.length; i++) {
        switch (string[i]) {
            case '0':
                binaryString += '0000'
                break
            case '1':
                binaryString += '0001'
                break
            case '2':
                binaryString += '0010'
                break
            case '3':
                binaryString += '0011'
                break
            case '4':
                binaryString += '0100'
                break
            case '5':
                binaryString += '0101'
                break
            case '6':
                binaryString += '0110'
                break
            case '7':
                binaryString += '0111'
                break
            case '8':
                binaryString += '1000'
                break
            case '9':
                binaryString += '1001'
                break
            case 'A':
                binaryString += '1010'
                break
            case 'B':
                binaryString += '1011'
                break
            case 'C':
                binaryString += '1100'
                break
            case 'D':
                binaryString += '1101'
                break
            case 'E':
                binaryString += '1110'
                break
            case 'F':
                binaryString += '1111'
                break
            default:
                console.error('not a valid hex character')
        }
    }
    return binaryString.substring(binaryString.length - length, binaryString.length)
}

export function replaceAt(string: string, index: number, replacementString: string) {
    return (
        string.substring(0, index) +
        replacementString +
        string.substring(index + replacementString.length)
    )
}

export function reverseString(string: string) {
    let reversedString = ''
    for (let i = string.length - 1; i >= 0; i--) {
        reversedString += string[i]
    }
    return reversedString
}

export function saveStringArray(stringArray: Array<string>, filename: string) {
    const output_string = stringArray.reduceRight((prev, curr) => {
        curr += '\n' + prev
        return curr
    })

    if (!fs.existsSync('dist/generated_tests')) fs.mkdirSync('dist/generated_tests')
    fs.writeFileSync(filename, output_string)
}
