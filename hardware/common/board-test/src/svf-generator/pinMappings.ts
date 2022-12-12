const mappingRpiFpgaRaw = [
    {
        rpi: '12',
        fpga: 'PT25A',
    },
    {
        rpi: '16',
        fpga: 'PT22D',
    },
    {
        rpi: '27',
        fpga: 'PT22C',
    },
]

const mappingFpgaMcRaw = [
    {
        fpga: 'PL19A',
        mc: 'PE(0)',
    },
    {
        fpga: 'PL22A',
        mc: 'PE(1)',
    },
    {
        fpga: 'PL22B',
        mc: 'PE(2)',
    },
    {
        fpga: 'PL15A',
        mc: 'PE(3)',
    },
    {
        fpga: 'PL15B',
        mc: 'PE(4)',
    },
    {
        fpga: 'PL17A',
        mc: 'PE(5)',
    },
    {
        fpga: 'PL17B',
        mc: 'PE(6)',
    },
    {
        fpga: 'PL11B',
        mc: 'PE(7)',
    },
    {
        fpga: 'PL11A',
        mc: 'PH(0)',
    },
    {
        fpga: 'PL12A',
        mc: 'PH(1)',
    },
    {
        fpga: 'PL12B',
        mc: 'PH(2)',
    },
    {
        fpga: 'PL9A',
        mc: 'PH(3)',
    },
    {
        fpga: 'PL9B',
        mc: 'PH(4)',
    },
    {
        fpga: 'PL10A',
        mc: 'PH(5)',
    },
    {
        fpga: 'PL10B',
        mc: 'PH(6)',
    },
    {
        fpga: 'PR7A',
        mc: 'PH(7)',
    },
    {
        fpga: 'PL6B',
        mc: 'PB(0)',
    },
    {
        fpga: 'PL6A',
        mc: 'PB(1)',
    },
    {
        fpga: 'PL8A',
        mc: 'PB(2)',
    },
    {
        fpga: 'PL8B',
        mc: 'PB(3)',
    },
    {
        fpga: 'PL3A',
        mc: 'PB(4)',
    },
    {
        fpga: 'PL3B',
        mc: 'PB(5)',
    },
    {
        fpga: 'PL4A',
        mc: 'PB(6)',
    },
    {
        fpga: 'PL4B',
        mc: 'PB(7)',
    },
    {
        fpga: 'PR3B',
        mc: 'PL(0)',
    },
    {
        fpga: 'PR3A',
        mc: 'PL(1)',
    },
    {
        fpga: 'PR2B',
        mc: 'PL(2)',
    },
    {
        fpga: 'PR2A',
        mc: 'PL(3)',
    },
    {
        fpga: 'PR15A',
        mc: 'PL(4)',
    },
    {
        fpga: 'PR12B',
        mc: 'PL(5)',
    },
    {
        fpga: 'PR12A',
        mc: 'PL(6)',
    },
    {
        fpga: 'PR11B',
        mc: 'PL(7)',
    },
    {
        fpga: 'PR11A',
        mc: 'PD(0)',
    },
    {
        fpga: 'PR9B',
        mc: 'PD(1)',
    },
    {
        fpga: 'PR9A',
        mc: 'PD(2)',
    },
    {
        fpga: 'PR7B',
        mc: 'PD(3)',
    },
    {
        fpga: 'PR16B',
        mc: 'PD(4)',
    },
    {
        fpga: 'PR17A',
        mc: 'PD(5)',
    },
    {
        fpga: 'PR16A',
        mc: 'PD(6)',
    },
    {
        fpga: 'PR15B',
        mc: 'PD(7)',
    },
    {
        fpga: 'PL19B',
        mc: 'PG(5)',
    },
    {
        fpga: 'PR5A',
        mc: 'PG(4)',
    },
    {
        fpga: 'PR5B',
        mc: 'PG(3)',
    },
    {
        fpga: 'PB29B',
        mc: 'PG(2)',
    },
    {
        fpga: 'PR18B',
        mc: 'PG(1)',
    },
    {
        fpga: 'PR21A',
        mc: 'PG(0)',
    },
    {
        fpga: 'PB4B',
        mc: 'PF(0)',
    },
    {
        fpga: 'PB4A',
        mc: 'PF(1)',
    },
    {
        fpga: 'PL25B',
        mc: 'PF(2)',
    },
    {
        fpga: 'PL25A',
        mc: 'PF(3)',
    },
    {
        fpga: 'PL24B',
        mc: 'PF(4)',
    },
    {
        fpga: 'PL24A',
        mc: 'PF(5)',
    },
    {
        fpga: 'PL23D',
        mc: 'PF(6)',
    },
    {
        fpga: 'PB13B',
        mc: 'PF(7)',
    },
    {
        fpga: 'PB13A',
        mc: 'PK(0)',
    },
    {
        fpga: 'PB12B',
        mc: 'PK(1)',
    },
    {
        fpga: 'PB12A',
        mc: 'PK(2)',
    },
    {
        fpga: 'PB9B',
        mc: 'PK(3)',
    },
    {
        fpga: 'PB9A',
        mc: 'PK(4)',
    },
    {
        fpga: 'PB6B',
        mc: 'PK(5)',
    },
    {
        fpga: 'PB6A',
        mc: 'PK(6)',
    },
    {
        fpga: 'PB26B',
        mc: 'PK(7)',
    },
    {
        fpga: 'PB23B',
        mc: 'PA(0)',
    },
    {
        fpga: 'PB23A',
        mc: 'PA(1)',
    },
    {
        fpga: 'PB18B',
        mc: 'PA(2)',
    },
    {
        fpga: 'PB18A',
        mc: 'PA(3)',
    },
    {
        fpga: 'PB16B',
        mc: 'PA(4)',
    },
    {
        fpga: 'PB16A',
        mc: 'PA(5)',
    },
    {
        fpga: 'PB31B',
        mc: 'PA(6)',
    },
    {
        fpga: 'PB31A',
        mc: 'PA(7)',
    },
    {
        fpga: 'PB26A',
        mc: 'PJ(7)',
    },
    {
        fpga: 'PB29A',
        mc: 'PJ(6)',
    },
    {
        fpga: 'PB37A',
        mc: 'PJ(5)',
    },
    {
        fpga: 'PB35B',
        mc: 'PJ(4)',
    },
    {
        fpga: 'PB31D',
        mc: 'PJ(3)',
    },
    {
        fpga: 'PB35A',
        mc: 'PJ(2)',
    },
    {
        fpga: 'PR24B',
        mc: 'PJ(1)',
    },
    {
        fpga: 'PB38B',
        mc: 'PJ(0)',
    },
    {
        fpga: 'PB38A',
        mc: 'PC(7)',
    },
    {
        fpga: 'PB37B',
        mc: 'PC(6)',
    },
    {
        fpga: 'PR21B',
        mc: 'PC(5)',
    },
    {
        fpga: 'PR23A',
        mc: 'PC(4)',
    },
    {
        fpga: 'PR24A',
        mc: 'PC(3)',
    },
    {
        fpga: 'PR23B',
        mc: 'PC(2)',
    },
    {
        fpga: 'PR17B',
        mc: 'PC(1)',
    },
    {
        fpga: 'PR18A',
        mc: 'PC(0)',
    },
    {
        fpga: 'PR4C',
        mc: 'RESET',
    },
]

const mappingFpgaIoRaw: { fpga: string; io: number }[] = [
    {
        fpga: 'PL10B',
        io: 0,
    },
    {
        fpga: 'PL10A',
        io: 1,
    },
    {
        fpga: 'PL12B',
        io: 2,
    },
    {
        fpga: 'PL12A',
        io: 3,
    },
    {
        fpga: 'PL24A',
        io: 4,
    },
    {
        fpga: 'PL23D',
        io: 5,
    },
    {
        fpga: 'PL19B',
        io: 6,
    },
    {
        fpga: 'PL19A',
        io: 7,
    },
    {
        fpga: 'PL11B',
        io: 8,
    },
    {
        fpga: 'PL11A',
        io: 9,
    },
    {
        fpga: 'PL15B',
        io: 10,
    },
    {
        fpga: 'PL15A',
        io: 11,
    },
    {
        fpga: 'PL22B',
        io: 12,
    },
    {
        fpga: 'PL22A',
        io: 13,
    },
    {
        fpga: 'PL17B',
        io: 14,
    },
    {
        fpga: 'PL17A',
        io: 15,
    },
    {
        fpga: 'PL25A',
        io: 16,
    },
    {
        fpga: 'PL24B',
        io: 17,
    },
    {
        fpga: 'PB6A',
        io: 18,
    },
    {
        fpga: 'PB4B',
        io: 19,
    },
    {
        fpga: 'PB31A',
        io: 20,
    },
    {
        fpga: 'PB29B',
        io: 21,
    },
    {
        fpga: 'PB12A',
        io: 22,
    },
    {
        fpga: 'PB12B',
        io: 23,
    },
    {
        fpga: 'PB4A',
        io: 24,
    },
    {
        fpga: 'PL25B',
        io: 25,
    },
    {
        fpga: 'PB9A',
        io: 26,
    },
    {
        fpga: 'PB6B',
        io: 27,
    },
    {
        fpga: 'PB29A',
        io: 28,
    },
    {
        fpga: 'PB26B',
        io: 29,
    },
    {
        fpga: 'PB13A',
        io: 30,
    },
    {
        fpga: 'PB13B',
        io: 31,
    },
    {
        fpga: 'PB37B',
        io: 32,
    },
    {
        fpga: 'PB37A',
        io: 33,
    },
    {
        fpga: 'PB31D',
        io: 34,
    },
    {
        fpga: 'PB31B',
        io: 35,
    },
    {
        fpga: 'PR17B',
        io: 36,
    },
    {
        fpga: 'PR18A',
        io: 37,
    },
    {
        fpga: 'PR11B',
        io: 38,
    },
    {
        fpga: 'PR12A',
        io: 39,
    },
    {
        fpga: 'PB38B',
        io: 40,
    },
    {
        fpga: 'PB38A',
        io: 41,
    },
    {
        fpga: 'PB35B',
        io: 42,
    },
    {
        fpga: 'PB35A',
        io: 43,
    },
    {
        fpga: 'PR18B',
        io: 44,
    },
    {
        fpga: 'PR21A',
        io: 45,
    },
    {
        fpga: 'PR12B',
        io: 46,
    },
    {
        fpga: 'PR15A',
        io: 47,
    },
    {
        fpga: 'PR9B',
        io: 48,
    },
    {
        fpga: 'PR11A',
        io: 49,
    },
    {
        fpga: 'PR16B',
        io: 50,
    },
    {
        fpga: 'PR17A',
        io: 51,
    },
    {
        fpga: 'PR4C',
        io: 52,
    },
    {
        fpga: 'PR5A',
        io: 53,
    },
    {
        fpga: 'PR2A',
        io: 54,
    },
    {
        fpga: 'PR2B',
        io: 55,
    },
    {
        fpga: 'PR7B',
        io: 56,
    },
    {
        fpga: 'PR9A',
        io: 57,
    },
    {
        fpga: 'PR15B',
        io: 58,
    },
    {
        fpga: 'PR16A',
        io: 59,
    },
    {
        fpga: 'PR5B',
        io: 60,
    },
    {
        fpga: 'PR7A',
        io: 61,
    },
    {
        fpga: 'PR3A',
        io: 62,
    },
    {
        fpga: 'PR3B',
        io: 63,
    },
]

const mapRpiFpga: { [k: string]: string } = {}
for (const mapping of mappingRpiFpgaRaw) {
    mapRpiFpga[mapping.rpi] = mapping.fpga
}

const mapFpgaRpi: { [k: string]: string } = {}
for (const mapping of mappingRpiFpgaRaw) {
    mapFpgaRpi[mapping.fpga] = mapping.rpi
}

const mapFpgaMc: { [k: string]: string } = {}
for (const mapping of mappingFpgaMcRaw) {
    mapFpgaMc[mapping.fpga] = mapping.mc
}

const mapMcFpga: { [k: string]: string } = {}
for (const mapping of mappingFpgaMcRaw) {
    mapMcFpga[mapping.mc] = mapping.fpga
}

const mapIoFpga: { [k: number]: string } = {}
for (const mapping of mappingFpgaIoRaw) {
    mapIoFpga[mapping.io] = mapping.fpga
}

const mapFpgaIo: { [k: string]: number } = {}
for (const mapping of mappingFpgaIoRaw) {
    mapFpgaIo[mapping.fpga] = mapping.io
}

export { mapFpgaRpi, mapRpiFpga, mapFpgaMc, mapMcFpga, mapFpgaIo, mapIoFpga }
