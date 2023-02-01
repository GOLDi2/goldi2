import asyncio
from typing import Callable, List, Optional, Set

import spidev


class SpiRegisters:
    _registers_buffer: bytearray
    _register_on_change_callbacks: List[List[Callable[["SpiRegisters"], None]]]
    _register_read_addresses: Set[int]
    _register_write_addresses: Set[int]

    def __init__(self):
        self.spi = spidev.SpiDev()
        self.spi.open(0, 0)
        self.spi.max_speed_hz = 5000000

        self._register_on_change_callbacks = [[] for _ in range(256)]
        self._registers_buffer = bytearray(256)
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
        return self._registers_buffer[key]

    def __setitem__(self, key: int, value: int):
        self._registers_buffer[key] = value
        self._register_write_addresses.add(key)

    async def communicate_coroutine(self):
        while True:
            self.communicate()
            await asyncio.sleep(0.05)

    def communicate(self):
        addresses = list(
            set.union(self._register_read_addresses, self._register_write_addresses)
        )
        addresses.sort(reverse=True)

        new_registers = bytearray(self._registers_buffer)

        while len(addresses) > 0:
            lower_address = addresses.pop()
            # Look ahead for contiguous addresses
            higher_address = lower_address + 1
            while len(addresses) > 0 and addresses[-1] == higher_address:
                addresses.pop()
                higher_address += 1

            new_registers[lower_address:higher_address] = self.spi.xfer2(
                [lower_address, *self._registers_buffer[lower_address:higher_address]]
            )[1:]

        # check for changes between new_registers and self._registers_buffer
        changes = [a != b for a, b in zip(new_registers, self._registers_buffer)]

        self._registers_buffer = new_registers

        change_listeners = set()
        for address, changed in enumerate(changes):
            if changed:
                change_listeners.update(self._register_on_change_callbacks[address])

        for listener in change_listeners:
            listener(self)
