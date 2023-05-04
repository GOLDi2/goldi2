from typing import Literal, Optional

from pyee.asyncio import AsyncIOEventEmitter

from spi_driver.spi_registers import SpiRegisters


class Numeric(AsyncIOEventEmitter):
    def __init__(
        self,
        registers: SpiRegisters,
        address: int,
        size: int = 16,
        endianess: Literal["big", "little"] = "little",
    ):
        super().__init__()
        self._registers = registers
        if endianess == "little":
            self._address = [address + i for i in range(size // 8)]
        else:
            self._address = [address + size // 8 - i for i in range(size // 8)]
        self._value: Optional[int] = None

        for address in self._address:
            self._registers.add_register(address, self._on_change)

    def _on_change(self, registers: SpiRegisters):
        value = 0
        for i, address in enumerate(self._address):
            value |= registers[address] << (i * 8)
        if self._value != value:
            self._value = value
            self.emit("change", self._value)

    def set(self, value: int):
        for i, address in enumerate(self._address):
            self._registers[address] = (value >> (i * 8)) & 0xFF
        if self._value != value:
            self._value = value
            self.emit("change", self._value)

    def value(self) -> int:
        value = 0
        for i, address in enumerate(self._address):
            value |= self._registers[address] << (i * 8)
        return value
