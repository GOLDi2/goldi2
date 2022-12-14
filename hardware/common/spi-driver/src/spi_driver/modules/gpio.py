from pyee.asyncio import AsyncIOEventEmitter

from spi_driver.spi_registers import SpiRegisters


class GPIO(AsyncIOEventEmitter):
    def __init__(self, registers: SpiRegisters, address: int, register_cnt: int = 1):
        super().__init__()
        self._registers = registers
        self._address = address
        self._register_cnt = register_cnt
        self._gpio_cnt = register_cnt * 4
        self._old_values = [False] * self._gpio_cnt

        for i in range(register_cnt):
            self._registers.add_register(address + i, self._on_change)

    def _on_change(self, registers: SpiRegisters):
        for i in range(self._register_cnt):
            address = self._address + i
            value = registers[address]
            for j in range(4):
                index = i * 4 + j
                if index >= self._gpio_cnt:
                    assert False
                if self._old_values[index] != bool(value & (1 << j)):
                    self._old_values[index] = bool(value & (1 << j))
                    self.emit("change", index, self._old_values[index])

    def __setitem__(self, key: int, value: bool | None):
        if key < 0 or key >= self._gpio_cnt:
            raise IndexError("GPIO index out of range")
        address = self._address + key // 4
        if value is None:
            self._registers[address] &= ~(1 << key % 4 + 4)
        elif value is True:
            self._registers[address] |= 1 << key % 4 + 4
            self._registers[address] |= 1 << key % 4
        elif value is False:
            self._registers[address] |= 1 << key % 4 + 4
            self._registers[address] &= ~(1 << key % 4)
        else:
            raise ValueError("Invalid value")

    def __getitem__(self, key: int) -> bool:
        if key < 0 or key >= self._gpio_cnt:
            raise IndexError("GPIO index out of range")
        address = self._address + key // 4
        return bool(self._registers[address] & (1 << key % 4))
