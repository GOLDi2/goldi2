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
    assert registers.getWriteBuffer(0x12) == 5

    motor.set(-84)
    assert registers.getWriteBuffer(0x10) == 0b00000010
    assert registers.getWriteBuffer(0x11) == 72
    assert registers.getWriteBuffer(0x12) == 3

    motor.set(0)
    assert registers.getWriteBuffer(0x10) == 0b10000000
    assert registers.getWriteBuffer(0x11) == 0
    assert registers.getWriteBuffer(0x12) == 0

    motor.set(255)
    assert registers.getWriteBuffer(0x10) == 0b00000001
    assert registers.getWriteBuffer(0x11) == 246
    assert registers.getWriteBuffer(0x12) == 9

    motor.set(-255)
    assert registers.getWriteBuffer(0x10) == 0b00000010
    assert registers.getWriteBuffer(0x11) == 246
    assert registers.getWriteBuffer(0x12) == 9

    with pytest.raises(ValueError):
        motor.set(256)

    with pytest.raises(ValueError):
        motor.set(257)

    with pytest.raises(ValueError):
        motor.set(-256)
