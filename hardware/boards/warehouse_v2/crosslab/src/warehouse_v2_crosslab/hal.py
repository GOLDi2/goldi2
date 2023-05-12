import asyncio
from spi_driver import SpiRegisters
from spi_driver.modules import Bit, Motor, StepperMotor, Numeric


class HAL:
    def __init__(self) -> None:
        registers = SpiRegisters()

        self.inductive = Bit(registers, 2, 6)
        self.z_top = Bit(registers, 2, 5)
        self.z_bottom = Bit(registers, 2, 4)
        self.y_inside = Bit(registers, 2, 3)
        self.y_outside = Bit(registers, 2, 2)
        self.x_right = Bit(registers, 2, 1)
        self.x_left = Bit(registers, 2, 0)
        self.x1 = Bit(registers, 3, 0)
        self.x2 = Bit(registers, 3, 1)
        self.x3 = Bit(registers, 3, 2)
        self.x4 = Bit(registers, 3, 3)
        self.x5 = Bit(registers, 3, 4)
        self.x6 = Bit(registers, 3, 5)
        self.x7 = Bit(registers, 3, 6)
        self.x8 = Bit(registers, 3, 7)
        self.x9 = Bit(registers, 4, 0)
        self.x10 = Bit(registers, 4, 1)
        self.z1 = Bit(registers, 4, 2)
        self.z2 = Bit(registers, 4, 3)
        self.z3 = Bit(registers, 4, 4)
        self.z4 = Bit(registers, 4, 5)
        self.z5 = Bit(registers, 4, 6)
        self.XEncoder = Numeric(registers, 9, 16, "little")
        self.ZEncoder = Numeric(registers, 11, 16, "little")
        self.XMotor = StepperMotor(registers, 13, 14)
        self.YMotor = Motor(registers, 15, 16)
        self.ZMotor = StepperMotor(registers, 17, 18)
        self.Magnet = Bit(registers, 19, 0)

        asyncio.create_task(registers.communicate_coroutine())
