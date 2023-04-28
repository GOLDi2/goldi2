from typing import List, Union

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

    def __setitem__(self, key: str, value: bool):
        bitOffset = self._signalIndex[key]
        registerIndex = bitOffset // 8
        bitIndex = bitOffset % 8
        self._registers.setBit(self._address[registerIndex], bitIndex, value)

    def __getitem__(self, key: str) -> bool:
        bitOffset = self._signalIndex[key]
        registerIndex = bitOffset // 8
        bitIndex = bitOffset % 8
        return self._registers.getBit(self._address[registerIndex], bitIndex)
