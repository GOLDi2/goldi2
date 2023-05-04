class MockRegisters:
    def __init__(self):
        self.change_callbacks = dict()
        self._read_buffer = bytearray(128)
        self._write_buffer = bytearray(128)

    def add_register(self, address, changed):
        self.change_callbacks[address] = changed

    def __getitem__(self, key: int):
        return self._read_buffer[key]

    def getBit(self, key: int, bit: int) -> bool:
        return self._read_buffer[key] & (1 << bit) != 0

    def __setitem__(self, key: int, value: int):
        self._write_buffer[key] = value

    def setBit(self, key: int, bit: int, value: bool):
        if value:
            self._write_buffer[key] |= 1 << bit
        else:
            self._write_buffer[key] &= ~(1 << bit)

    def setReadBuffer(self, address: int, value: int):
        self._read_buffer[address] = value

    def getWriteBuffer(self, address: int) -> int:
        return self._write_buffer[address]
