from typing import List, Optional, Union

from spi_driver.spi_registers import SpiRegisters


class BinOutput:
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

    def __setitem__(self, key: str, value: Optional[bool]):
        bitOffset = self._signalIndex[key]
        registerIndex = bitOffset // 8
        bitIndex = bitOffset % 8
        if value:
            self._registers[128 + self._address[registerIndex]] |= 1 << bitIndex
        else:
            self._registers[128 + self._address[registerIndex]] &= ~(1 << bitIndex)

    def __getitem__(self, key: str) -> bool:
        bitOffset = self._signalIndex[key]
        registerIndex = bitOffset // 8
        bitIndex = bitOffset % 8
        return (
            self._registers[128 + self._address[registerIndex]] & (1 << bitIndex) != 0
        )
