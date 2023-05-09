import asyncio
from spi_driver import SpiRegisters
from spi_driver.modules import Bit, Motor, Numeric


class HAL:
    def __init__(self) -> None:
        registers = SpiRegisters()

        self.Proximity = Bit(registers, 2, 0)
        self.LimitZTop = Bit(registers, 3, 7)
        self.LimitZBottom = Bit(registers, 3, 6)
        self.InYRef = Bit(registers, 3, 5)
        self.LimitYFront = Bit(registers, 3, 4)
        self.LimitYBack = Bit(registers, 3, 3)
        self.InXRef = Bit(registers, 3, 2)
        self.LimitXRight = Bit(registers, 3, 1)
        self.LimitXLeft = Bit(registers, 3, 0)
        self.XEncoder = Numeric(registers, 9, 16, "little")
        self.YEncoder = Numeric(registers, 11, 16, "little")
        self.XMotor = Motor(registers, 13, 14)
        self.YMotor = Motor(registers, 15, 16)
        self.ZMotor = Motor(registers, 17, 18)
        self.Magnet = Bit(registers, 19, 0)

        # asyncio.create_task(registers.communicate_coroutine())
