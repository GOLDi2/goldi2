class MockRegisters:
    def __init__(self):
        self.change_callbacks = dict()
        self._registers_buffer = bytearray(256)

    def add_register(self, address, changed):
        self.change_callbacks[address] = changed

    def __getitem__(self, key: int):
        return self._registers_buffer[key]

    def __setitem__(self, key: int, value: int):
        self._registers_buffer[key] = value
