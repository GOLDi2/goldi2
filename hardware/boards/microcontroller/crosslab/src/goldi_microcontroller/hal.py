import asyncio

from spi_driver import SpiRegisters
from spi_driver.modules import Bit, Gpio


class HAL:
    def __init__(self) -> None:
        self.registers = SpiRegisters()
        self.gpios = [Gpio(self.registers, 100+i) for i in range(87)]
        self.enable_isp = Bit(self.registers, 1, 0)
        asyncio.create_task(self.registers.communicate_coroutine())
