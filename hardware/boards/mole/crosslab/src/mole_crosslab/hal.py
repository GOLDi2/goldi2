import asyncio
from spi_driver import SpiRegisters
from spi_driver.modules import Gpio


class HAL:
    def __init__(self) -> None:
        registers = SpiRegisters()

        self.gpio = [Gpio(registers, 2 + i) for i in range(64)]

        # Init Crossbar
        for i in range(8):
            registers.spi.xfer2([0x80, 1, i + 1])
            registers.spi.xfer2([0x80, 9, 7, 6, 5, 4, 3, 2, 1, 0])
        registers.spi.xfer2([0x80, 1, 0])

        asyncio.create_task(registers.communicate_coroutine())
