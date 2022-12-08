import { bsdlRaw, parseBsdl } from "./bsdl"
import * as bsdl_fpga_raw from "./bsdl/machxo2/bsdl-machxo2.json" 
import * as bsdl_mc_raw from "./bsdl/atmega2560/bsdl-atmega2560.json"

export const bsdl_fpga = parseBsdl(bsdl_fpga_raw as bsdlRaw)
export const bsdl_mc = parseBsdl(bsdl_mc_raw as bsdlRaw)