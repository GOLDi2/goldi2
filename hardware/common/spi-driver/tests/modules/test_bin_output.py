from spi_driver.modules.bin_output import BinOutput

from .mock_registers import MockRegisters

signalNames = [
    "A0",
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "A6",
    "A7",
    "B0",
    "B1",
    "B2",
    "B3",
    "B4",
    "B5",
    "B6",
    "B7",
]


def test_bin_output():
    registers = MockRegisters()
    output = BinOutput(registers, 0x10, signalNames)

    output["A0"] = True
    output["A1"] = False
    output["A2"] = False
    output["A3"] = False
    output["A4"] = False
    output["A5"] = False
    output["A6"] = False
    output["A7"] = False
    output["B0"] = False
    output["B1"] = True
    output["B2"] = False
    output["B3"] = False
    output["B4"] = False
    output["B5"] = False
    output["B6"] = False
    output["B7"] = False

    assert registers[0x80 + 0x10] == 0b00000001
    assert registers[0x80 + 0x11] == 0b00000010


def test_bin_output_switched():
    registers = MockRegisters()
    output = BinOutput(registers, [0x11, 0x10], signalNames)

    output["A0"] = False
    output["A1"] = True
    output["A2"] = False
    output["A3"] = False
    output["A4"] = False
    output["A5"] = False
    output["A6"] = False
    output["A7"] = False
    output["B0"] = True
    output["B1"] = False
    output["B2"] = False
    output["B3"] = False
    output["B4"] = False
    output["B5"] = False
    output["B6"] = False
    output["B7"] = False

    assert registers[0x80 + 0x10] == 0b00000001
    assert registers[0x80 + 0x11] == 0b00000010


def test_bin_output_sparse():
    registers = MockRegisters()
    output = BinOutput(
        registers,
        [0x11, 0x10],
        ["A0", "A1", *[None for _ in range(6)], "B0", "B1", *[None for _ in range(6)]],
    )

    output["A0"] = False
    output["A1"] = True
    output["B0"] = True
    output["B1"] = False

    assert registers[0x80 + 0x10] == 0b00000001
    assert registers[0x80 + 0x11] == 0b00000010
