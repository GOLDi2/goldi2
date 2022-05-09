import * as fs from "fs"
import { bsdlData } from "./bsdl";
import { map_MC_FPGA } from "./pinMappings";

export function binToHex(str: string): string {
    let hex = ""
    let r = str.length % 4
    let m = r == 0 ? str.length == 0 ? 4 : 0 : 4-r
    if (m != 0) str = "0".repeat(m) + str
    for (let i = 0; i < str.length; i+=4) {
        hex = hex + parseInt(str.substring(i,i+4),2).toString(16).toUpperCase()
    }
    return hex;
}

export function hexToBin(str: string, len: number): string {
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
    return bin.substring(bin.length - len, bin.length)
}

export function replaceAt(str: string, i: number, rstr: string) {
    if (!i && i!=0) console.log("replaceAt error: i undefined");
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
    
    if (!fs.existsSync("dist/generated_tests")) fs.mkdirSync("dist/generated_tests")
    fs.writeFileSync(fname, output_string)
}

export function check_values(faults: Array<{tdi: string, tdo: string, mask: string, data: string}>, bsdl_fpga: bsdlData, filename: string) {
    let fault_nr = 0;
    let output: Array<{fault_nr: number, port_mc: string, port_fpga: string, expected: string, received: string}> = [];
    for (const fault of faults) {
        const tdo = hexToBin(fault.tdo, bsdl_fpga.boundaryCellsLength)
        const mask = hexToBin(fault.mask, bsdl_fpga.boundaryCellsLength)
        const data = hexToBin(fault.data, bsdl_fpga.boundaryCellsLength)
        for (const port of map_MC_FPGA.keys()) {
            const bc = bsdl_fpga.boundaryCells.find(bc => bc.port == map_MC_FPGA.get(port));
            if (bc && mask[mask.length - bc.cellNumber - 1] == "1" &&
                tdo[tdo.length - bc.cellNumber - 1] != data[data.length - bc.cellNumber - 1]) {
                    output.push({fault_nr: fault_nr, port_mc: port, port_fpga: map_MC_FPGA.get(port)!, expected: tdo[tdo.length - bc.cellNumber - 1], received: data[data.length - bc.cellNumber - 1]})
            }
        }
        fault_nr++
    }
    if (output.length > 0) fs.writeFileSync(filename, JSON.stringify(output, null, 4))
}