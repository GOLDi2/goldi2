import pytest

from spi_driver.modules.stepper_motor import StepperMotor as StepperMotor

from .mock_registers import MockRegisters


def test_stepper_motor():
    registers = MockRegisters()
    motor = StepperMotor(registers, 0x10)

    motor.setSpeed(0)
