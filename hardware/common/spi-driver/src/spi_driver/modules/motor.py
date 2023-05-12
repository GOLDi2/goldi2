from pyee.asyncio import AsyncIOEventEmitter

from spi_driver.spi_registers import SpiRegisters


class Motor(AsyncIOEventEmitter):
    def __init__(
        self, registers: SpiRegisters, direction_address: int, speed_address: int
    ):
        super().__init__()
        self._registers = registers
        self._direction_address = direction_address
        self._speed_address = speed_address

    def set(self, value: int):
        if value < -255 or value > 255:
            raise ValueError("value must be between -256 and 256")
        if value > 0:
            self._registers[self._direction_address] = 0b01
        elif value < 0:
            self._registers[self._direction_address] = 0b10
        else:
            self._registers[self._direction_address] = 0b00
        self._registers[self._speed_address] = abs(value)
