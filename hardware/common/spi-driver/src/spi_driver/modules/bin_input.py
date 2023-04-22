from typing import List, Optional, Union

from pyee.asyncio import AsyncIOEventEmitter

from spi_driver.spi_registers import SpiRegisters


class BinInput(AsyncIOEventEmitter):
    def __init__(
        self,
        registers: SpiRegisters,
        address: Union[int, List[int]],
        signalNames: Union[List[Union[str, None]], List[str]],
    ):
        super().__init__()
        self._registers = registers
        self._signalNames = signalNames
        self._signalIndex = {name: i for i, name in enumerate(signalNames)}
        self._values: List[Optional[bool]] = [None] * len(signalNames)
        self._register_cnt = len(signalNames) // 8
        if isinstance(address, int):
            self._address = [
                address + i
                for i in range(self._register_cnt)
                if signalNames[i * 8] is not None
            ]
        else:
            self._address = address
        assert len(self._address) == self._register_cnt

        for i in range(self._register_cnt):
            self._registers.add_register(self._address[i], self._on_change)

    def _on_change(self, registers: SpiRegisters):
        for i in range(self._register_cnt):
            address = self._address[i]
            value = registers[address]
            for j in range(8):
                index = i * 8 + j
                if index >= len(self._signalNames) or self._signalNames[index] is None:
                    break
                if self._values[index] != bool(value & (1 << j)):
                    self._values[index] = bool(value & (1 << j))
                    self.emit("change", self._signalNames[index], self._values[index])

    def __setitem__(self, key: str, value: Optional[bool]):
        raise NotImplementedError("BinInput is read-only")

    def __getitem__(self, key: str) -> bool:
        bitOffset = self._signalIndex[key]
        registerIndex = bitOffset // 8
        bitIndex = bitOffset % 8
        return self._registers[self._address[registerIndex]] & (1 << bitIndex) != 0
