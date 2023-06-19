import asyncio
from typing import Callable, List, Optional, Set

import spidev


class SpiRegisters:
    _read_buffer: bytearray
    _write_buffer: bytearray
    _register_read_addresses: Set[int]
    _register_write_addresses: Set[int]
    _register_on_change_callbacks: List[List[Callable[["SpiRegisters"], None]]]

    def __init__(self):
        self.spi = spidev.SpiDev()
        self.spi.open(0, 0)
        self.spi.max_speed_hz = 5000000

        self._register_on_change_callbacks = [[] for _ in range(32768)]
        self._read_buffer = bytearray(32768)
        self._write_buffer = bytearray(32768)
        self._register_read_addresses = set()
        self._register_write_addresses = set()

    def add_register(
        self,
        register_address: int,
        on_change: Optional[Callable[["SpiRegisters"], None]] = None,
    ):
        if on_change is not None:
            self._register_on_change_callbacks[register_address].append(on_change)
        self._register_read_addresses.add(register_address)

    def __getitem__(self, key: int):
        return self._read_buffer[key]

    def getBit(self, key: int, bit: int) -> bool:
        return self._read_buffer[key] & (1 << bit) != 0

    def __setitem__(self, key: int, value: int):
        self._register_write_addresses.add(key)
        self._write_buffer[key] = value

    def setBit(self, key: int, bit: int, value: bool):
        if value:
            self._write_buffer[key] |= 1 << bit
        else:
            self._write_buffer[key] &= ~(1 << bit)
        self._register_write_addresses.add(key)

    async def communicate_coroutine(self):
        while True:
            self.communicate()
            await asyncio.sleep(0.05)

    def communicate(self):
        for address in self._register_write_addresses:
            higherAddress = (address >> 8) & 0xFF
            lowerAddress = address & 0xFF
            self.spi.xfer2(
                [128 + higherAddress, lowerAddress, self._write_buffer[address]]
            )
        self._register_write_addresses.clear()

        new_registers = bytearray(self._read_buffer)
        for address in self._register_read_addresses:
            higherAddress = (address >> 8) & 0xFF
            lowerAddress = address & 0xFF
            new_registers[address] = self.spi.xfer2([higherAddress, lowerAddress, 0])[2]

        # check for changes between new_registers and self._registers_buffer
        changes = [a != b for a, b in zip(new_registers, self._read_buffer)]

        self._read_buffer = new_registers

        change_listeners = set()
        for address, changed in enumerate(changes):
            if changed:
                change_listeners.update(self._register_on_change_callbacks[address])

        for listener in change_listeners:
            listener(self)
