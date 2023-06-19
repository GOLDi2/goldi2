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
        value = registers.getBit(self._address, self._bit)
        if self._value != value:
            self._value = value
            self.emit("change", self._value)

    def set(self, value: bool):
        self._registers.setBit(self._address, self._bit, value)
        if self._value != value:
            self._value = value
            self.emit("change", self._value)

    def value(self) -> bool:
        return self._registers.getBit(self._address, self._bit)
