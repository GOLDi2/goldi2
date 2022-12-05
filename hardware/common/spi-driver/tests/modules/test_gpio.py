import pytest

from spi_driver.modules.gpio import GPIO


class MockRegisters:
    def __init__(self):
        self.change_callbacks = dict()
        self._registers_buffer = bytearray(256)

    def add_register(self, address, changed):
        self.change_callbacks[address] = changed

    def __getitem__(self, key: int):
        return self._registers_buffer[key]

    def __setitem__(self, key: int, value: int):
        self._registers_buffer[key] = value


def test_gpio():
    registers = MockRegisters()
    gpio = GPIO(registers, 0x10, 2)

    assert registers.change_callbacks[0x10] != None
    assert registers.change_callbacks[0x11] != None

    registers[0x10] = 0b00000001
    registers[0x11] = 0b00000010

    assert gpio[0] == True
    assert gpio[1] == False
    assert gpio[2] == False
    assert gpio[3] == False
    assert gpio[4] == False
    assert gpio[5] == True
    assert gpio[6] == False
    assert gpio[7] == False


def test_gpio_events():
    registers = MockRegisters()
    gpio = GPIO(registers, 0x10, 2)

    events = []

    def on_change(index, value):
        events.append((index, value))

    gpio.on("change", on_change)

    registers[0x10] = 0b00000001
    registers[0x11] = 0b00000010

    registers.change_callbacks[0x10](registers)

    assert events == [(0, True), (5, True)]


def test_gpio_write():
    registers = MockRegisters()
    gpio = GPIO(registers, 0x10, 2)

    gpio[0] = True
    gpio[1] = False
    gpio[2] = None
    gpio[3] = True
    gpio[4] = False
    gpio[5] = None
    gpio[6] = True
    gpio[7] = False

    assert registers[0x10] == 0b10111001
    assert registers[0x11] == 0b11010100


def test_gpio_out_of_bounds():
    registers = MockRegisters()
    gpio = GPIO(registers, 0x10, 2)

    pytest.raises(IndexError, gpio.__getitem__, 8)
    pytest.raises(IndexError, gpio.__getitem__, -1)
    pytest.raises(IndexError, gpio.__setitem__, 8, True)
    pytest.raises(IndexError, gpio.__setitem__, -1, True)


def test_gpio_invalid_value():
    registers = MockRegisters()
    gpio = GPIO(registers, 0x10, 2)

    pytest.raises(ValueError, gpio.__setitem__, 0, 0)


def test_gpio_unreachable():
    registers = MockRegisters()
    gpio = GPIO(registers, 0x10, 2)
    gpio._gpio_cnt = 0

    pytest.raises(AssertionError, gpio._on_change, registers)
