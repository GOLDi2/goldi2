from spi_driver.modules.bit import Bit

from .mock_registers import MockRegisters


def test_bit_as_input():
    registers = MockRegisters()
    bit = Bit(registers, 0x10, 5)

    assert registers.change_callbacks[0x10] != None

    registers.setReadBuffer(0x10, 0b00100000)

    assert bit.value() == True


def test_bit_as_output():
    registers = MockRegisters()
    bit = Bit(registers, 0x10, 5)

    assert registers.change_callbacks[0x10] != None

    bit.set(True)

    assert registers.getWriteBuffer(0x10) == 0b00100000


def test_bit_event():
    registers = MockRegisters()
    bit = Bit(registers, 0x10, 5)

    events = []

    def on_change(value):
        events.append(value)

    bit.on("change", on_change)

    registers.change_callbacks[0x10](registers)

    registers.setReadBuffer(0x10, 0b00100000)

    registers.change_callbacks[0x10](registers)

    assert events == [False, True]
