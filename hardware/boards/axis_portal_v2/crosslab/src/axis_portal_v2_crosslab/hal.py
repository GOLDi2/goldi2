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

        registers.spi.xfer2([0x80, 16, 0x09, 0x45, 0x57]) # Init XMotor
        registers.spi.xfer2([0x80, 16, 0x0A, 0x00, 0x00])
        registers.spi.xfer2([0x80, 16, 0x0D, 0x0A, 0x0F])
        registers.spi.xfer2([0x80, 16, 0x0E, 0x00, 0x60])
        registers.spi.xfer2([0x80, 16, 0x00, 0x00, 0x04])
        
        registers.spi.xfer2([0x80, 22, 0x09, 0x45, 0x57]) # Init ZMotor
        registers.spi.xfer2([0x80, 22, 0x0A, 0x00, 0x00])
        registers.spi.xfer2([0x80, 22, 0x0D, 0x0A, 0x0F])
        registers.spi.xfer2([0x80, 22, 0x0E, 0x00, 0x60])
        registers.spi.xfer2([0x80, 22, 0x00, 0x00, 0x04])

        asyncio.create_task(registers.communicate_coroutine())
