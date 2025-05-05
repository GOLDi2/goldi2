import asyncio
from spi_driver import SpiRegisters
from spi_driver.modules import Bit, Motor, Numeric, StepperMotor


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
        self.XEncoder = Numeric(registers, 7, 16, "little")
        self.YEncoder = Numeric(registers, 9, 16, "little")
        self.XMotor = StepperMotor(registers, 11, 12)
        self.YMotor = StepperMotor(registers, 17, 18)
        self.ZMotor = Motor(registers, 23, 24)
        self.Magnet = Bit(registers, 25, 0)

        asyncio.create_task(registers.communicate_coroutine())
