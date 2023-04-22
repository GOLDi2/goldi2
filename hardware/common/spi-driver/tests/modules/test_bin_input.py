from spi_driver.modules.bin_input import BinInput

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


def test_bin_input():
    registers = MockRegisters()
    input = BinInput(registers, 0x10, signalNames)

    assert registers.change_callbacks[0x10] != None
    assert registers.change_callbacks[0x11] != None

    registers[0x10] = 0b00000001
    registers[0x11] = 0b00000010

    assert input["A0"] == True
    assert input["A1"] == False
    assert input["A2"] == False
    assert input["A3"] == False
    assert input["A4"] == False
    assert input["A5"] == False
    assert input["A6"] == False
    assert input["A7"] == False
    assert input["B0"] == False
    assert input["B1"] == True
    assert input["B2"] == False
    assert input["B3"] == False
    assert input["B4"] == False
    assert input["B5"] == False
    assert input["B6"] == False
    assert input["B7"] == False


def test_bin_input_events():
    registers = MockRegisters()
    input = BinInput(registers, 0x10, signalNames)

    events = []

    def on_change(index, value):
        events.append((index, value))

    input.on("change", on_change)

    registers.change_callbacks[0x10](registers)

    registers[0x10] = 0b00000001
    registers[0x11] = 0b00000010

    registers.change_callbacks[0x10](registers)

    assert events == [
        ("A0", False),
        ("A1", False),
        ("A2", False),
        ("A3", False),
        ("A4", False),
        ("A5", False),
        ("A6", False),
        ("A7", False),
        ("B0", False),
        ("B1", False),
        ("B2", False),
        ("B3", False),
        ("B4", False),
        ("B5", False),
        ("B6", False),
        ("B7", False),
        ("A0", True),
        ("B1", True),
    ]


def test_bin_input_switched():
    registers = MockRegisters()
    input = BinInput(registers, [0x11, 0x10], signalNames)

    assert registers.change_callbacks[0x10] != None
    assert registers.change_callbacks[0x11] != None

    registers[0x10] = 0b00000001
    registers[0x11] = 0b00000010

    assert input["A0"] == False
    assert input["A1"] == True
    assert input["A2"] == False
    assert input["A3"] == False
    assert input["A4"] == False
    assert input["A5"] == False
    assert input["A6"] == False
    assert input["A7"] == False
    assert input["B0"] == True
    assert input["B1"] == False
    assert input["B2"] == False
    assert input["B3"] == False
    assert input["B4"] == False
    assert input["B5"] == False
    assert input["B6"] == False
    assert input["B7"] == False


def test_bin_input_sparse():
    registers = MockRegisters()
    input = BinInput(
        registers,
        [0x11, 0x10],
        ["A0", "A1", *[None for _ in range(6)], "B0", "B1", *[None for _ in range(6)]],
    )

    assert registers.change_callbacks[0x10] != None
    assert registers.change_callbacks[0x11] != None

    registers[0x10] = 0b00000001
    registers[0x11] = 0b00000010

    assert input["A0"] == False
    assert input["A1"] == True
    assert input["B0"] == True
    assert input["B1"] == False
