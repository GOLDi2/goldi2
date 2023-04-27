from spi_driver.modules.numeric import Numeric

from .mock_registers import MockRegisters


def test_numeric_as_input():
    registers = MockRegisters()
    numeric = Numeric(registers, 0x10)

    assert registers.change_callbacks[0x10] != None
    assert registers.change_callbacks[0x11] != None

    registers[0x10] = 0b00100000
    registers[0x11] = 0b00000001

    assert numeric.value() == 288


def test_numeric_as_output():
    registers = MockRegisters()
    numeric = Numeric(registers, 0x10)

    assert registers.change_callbacks[0x10] != None
    assert registers.change_callbacks[0x11] != None

    numeric.set(288)

    assert registers[0x80 + 0x10] == 0b00100000
    assert registers[0x80 + 0x11] == 0b00000001


def test_numeric_event():
    registers = MockRegisters()
    numeric = Numeric(registers, 0x10)

    events = []

    def on_change(value):
        events.append(value)

    numeric.on("change", on_change)

    registers.change_callbacks[0x10](registers)

    registers[0x10] = 0b00100000
    registers[0x11] = 0b00000001

    registers.change_callbacks[0x10](registers)

    assert events == [0, 288]
