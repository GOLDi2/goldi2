from spi_driver.modules.gpio import Gpio

from .mock_registers import MockRegisters


def test_bit_as_input():
    registers = MockRegisters()
    bit = Gpio(registers, 0x10)

    assert registers.change_callbacks[0x10] != None

    registers.setReadBuffer(0x10, 0b00000001)

    assert bit.value() == True


def test_bit_as_output():
    registers = MockRegisters()
    bit = Gpio(registers, 0x10)

    assert registers.change_callbacks[0x10] != None

    bit.set(True)
    assert registers.getWriteBuffer(0x10) == 0b00000001

    bit.setOutput(True)
    assert registers.getWriteBuffer(0x10) == 0b00000011

    bit.set(False)
    assert registers.getWriteBuffer(0x10) == 0b00000010

    bit.setOutput(False)
    assert registers.getWriteBuffer(0x10) == 0b00000000


def test_bit_event():
    registers = MockRegisters()
    bit = Gpio(registers, 0x10)

    events = []

    def on_change(value):
        events.append(value)

    bit.on("change", on_change)

    registers.change_callbacks[0x10](registers)

    registers.setReadBuffer(0x10, 0b00000001)

    registers.change_callbacks[0x10](registers)

    assert events == [False, True]
