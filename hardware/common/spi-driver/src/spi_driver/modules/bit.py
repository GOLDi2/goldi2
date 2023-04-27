from typing import Optional

from pyee.asyncio import AsyncIOEventEmitter

from spi_driver.spi_registers import SpiRegisters


class Bit(AsyncIOEventEmitter):
    def __init__(self, registers: SpiRegisters, address: int, bit: int):
        super().__init__()
        self._registers = registers
        self._address = address
        self._bit = bit
        self._value: Optional[bool] = None

        self._registers.add_register(self._address, self._on_change)

    def _on_change(self, registers: SpiRegisters):
        value = registers[self._address] & (1 << self._bit) != 0
        if self._value != value:
            self._value = value
            self.emit("change", self._value)

    def set(self, value: bool):
        if value:
            self._registers[128 + self._address] |= 1 << self._bit
        else:
            self._registers[128 + self._address] &= ~(1 << self._bit)
        if self._value != value:
            self._value = value
            self.emit("change", self._value)

    def value(self) -> bool:
        return self._registers[self._address] & (1 << self._bit) != 0
