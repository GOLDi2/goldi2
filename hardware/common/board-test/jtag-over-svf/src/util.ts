import * as fs from "fs"

export function binToHex(str: string): string {
    let hex = ""
    let m = str.length % 4
    if (m != 0) str = "0".repeat(m) + str
    for (let i = 0; i < str.length; i+=4) {
        hex = hex + parseInt(str.substring(i,i+4),2).toString(16).toUpperCase();
    }
    return hex;
}

export function hexToBin(str: string): string {
    let bin = ""
    for (let i = 0; i < str.length; i++) {
        switch (str[i]) {
            case "0": bin += "0000"; break
            case "1": bin += "0001"; break
            case "2": bin += "0010"; break
            case "3": bin += "0011"; break
            case "4": bin += "0100"; break
            case "5": bin += "0101"; break
            case "6": bin += "0110"; break
            case "7": bin += "0111"; break
            case "8": bin += "1000"; break
            case "9": bin += "1001"; break
            case "A": bin += "1010"; break
            case "B": bin += "1011"; break
            case "C": bin += "1100"; break
            case "D": bin += "1101"; break
            case "E": bin += "1110"; break
            case "F": bin += "1111"; break
            default: console.error("not a valid hex char")
        }
    }
    return bin
}

export function replaceAt(str: string, i: number, rstr: string) {
    return str.substring(0,i) + rstr + str.substring(i+rstr.length)
}

export function reverseString(str: string) {
    let nstr = ""
    for (let i = str.length - 1; i >= 0; i--) {
        nstr += str[i]
    }
    return nstr
}

export function saveStringArray(strarr: Array<string>, fname: string) {
    const output_string = strarr.reduceRight((prev, curr) => {
        curr += "\n" + prev
        return curr
    })
    
    if (!fs.existsSync("generated_tests")) fs.mkdirSync("generated_tests")
    fs.writeFileSync(fname, output_string)
}