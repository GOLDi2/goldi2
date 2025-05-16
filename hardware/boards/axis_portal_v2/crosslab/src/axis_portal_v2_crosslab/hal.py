import asyncio

from spi_driver import SpiRegisters
from spi_driver.modules import Bit, Motor, StepperMotor


class HAL:
    def __init__(self) -> None:
        registers = SpiRegisters()

        self.Proximity = Bit(registers, 2, 6)
        self.LimitZTop = Bit(registers, 2, 5)
        self.LimitZBottom = Bit(registers, 2, 4)
        self.LimitYFront = Bit(registers, 2, 3)
        self.LimitYBack = Bit(registers, 2, 2)
        self.LimitXRight = Bit(registers, 2, 1)
        self.LimitXLeft = Bit(registers, 2, 0)
        self.XMotor = StepperMotor(registers, 7)
        self.YMotor = StepperMotor(registers, 16)
        self.ZMotor = Motor(registers, 25, 26)
        self.Magnet = Bit(registers, 27, 0)

        self.XMotor.acceleration=200000
        self.YMotor.acceleration=150000
        asyncio.create_task(registers.communicate_coroutine())
