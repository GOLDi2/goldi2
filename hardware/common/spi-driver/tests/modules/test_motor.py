import pytest

from spi_driver.modules.motor import Motor

from .mock_registers import MockRegisters


def test_motor():
    registers = MockRegisters()
    motor = Motor(registers, 0x10, 0x11)

    motor.set(0)
    assert registers[0x80 + 0x10] == 0b00000000
    assert registers[0x80 + 0x11] == 0

    motor.set(128)
    assert registers[0x80 + 0x10] == 0b00000001
    assert registers[0x80 + 0x11] == 128

    motor.set(-84)
    assert registers[0x80 + 0x10] == 0b00000010
    assert registers[0x80 + 0x11] == 84

    motor.set(0)
    assert registers[0x80 + 0x10] == 0b00000000
    assert registers[0x80 + 0x11] == 0

    motor.set(255)
    assert registers[0x80 + 0x10] == 0b00000001
    assert registers[0x80 + 0x11] == 255

    motor.set(-255)
    assert registers[0x80 + 0x10] == 0b00000010
    assert registers[0x80 + 0x11] == 255

    with pytest.raises(ValueError):
        motor.set(256)

    with pytest.raises(ValueError):
        motor.set(257)

    with pytest.raises(ValueError):
        motor.set(-256)
