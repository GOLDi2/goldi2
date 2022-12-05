import spidev

from spi_driver.spi_registers import SpiRegisters


class MockSpiDev:
    transactions = []

    def __init__(self):
        self._is_opened = False

    def open(self, bus, device):
        if self._is_opened:
            raise RuntimeError("SPI device is already opened")
        self._is_opened = True

    def xfer2(self, data):
        self.transactions.append(data)
        address = data[0]
        return bytes([0, *range(address, address + len(data) - 1)])


def test_spi_registers(monkeypatch):
    monkeypatch.setattr(spidev, "SpiDev", MockSpiDev)

    changes = 0

    def changed(registers):
        nonlocal changes
        changes += 1

    registers = SpiRegisters()
    registers.add_register(0x00)
    registers.add_register(0x01, changed)
    assert registers[0x00] == 0
    assert registers[0x01] == 0
    registers.communicate()
    assert len(MockSpiDev.transactions) == 1

    assert changes == 1
    assert registers[0x00] == 0
    assert registers[0x01] == 1

    registers.add_register(0x03, changed)
    registers.add_register(0x04, changed)
    registers.add_register(0x05, changed)

    assert registers[0x00] == 0
    assert registers[0x01] == 1
    assert registers[0x02] == 0
    assert registers[0x03] == 0
    assert registers[0x04] == 0
    assert registers[0x05] == 0
    assert registers[0x06] == 0
    assert changes == 1

    registers.communicate()
    assert len(MockSpiDev.transactions) == 3

    assert registers[0x00] == 0
    assert registers[0x01] == 1
    assert registers[0x02] == 0
    assert registers[0x03] == 3
    assert registers[0x04] == 4
    assert registers[0x05] == 5
    assert registers[0x06] == 0
    assert changes == 2

    registers[0x10] = 0x20

    registers.communicate()

    assert len(MockSpiDev.transactions) == 6
    assert MockSpiDev.transactions[-1] == [0x10, 0x20]
