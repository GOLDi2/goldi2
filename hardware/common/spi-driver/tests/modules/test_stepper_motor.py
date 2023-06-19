import pytest

from spi_driver.modules.stepper_motor import StepperMotor as StepperMotor

from .mock_registers import MockRegisters


def test_stepper_motor():
    registers = MockRegisters()
    motor = StepperMotor(registers, 0x10, 0x11)

    motor.set(0)
    assert registers.getWriteBuffer(0x10) == 0b10000000
    assert registers.getWriteBuffer(0x11) == 0
    assert registers.getWriteBuffer(0x12) == 0

    motor.set(128)
    assert registers.getWriteBuffer(0x10) == 0b00000001
    assert registers.getWriteBuffer(0x11) == 0
    assert registers.getWriteBuffer(0x12) == 75

    motor.set(-84)
    assert registers.getWriteBuffer(0x10) == 0b00000010
    assert registers.getWriteBuffer(0x11) == 56
    assert registers.getWriteBuffer(0x12) == 49

    motor.set(0)
    assert registers.getWriteBuffer(0x10) == 0b10000000
    assert registers.getWriteBuffer(0x11) == 0
    assert registers.getWriteBuffer(0x12) == 0

    motor.set(255)
    assert registers.getWriteBuffer(0x10) == 0b00000001
    assert registers.getWriteBuffer(0x11) == 106
    assert registers.getWriteBuffer(0x12) == 149

    motor.set(-255)
    assert registers.getWriteBuffer(0x10) == 0b00000010
    assert registers.getWriteBuffer(0x11) == 106
    assert registers.getWriteBuffer(0x12) == 149

    with pytest.raises(ValueError):
        motor.set(256)

    with pytest.raises(ValueError):
        motor.set(257)

    with pytest.raises(ValueError):
        motor.set(-256)
