import asyncio
from typing import Callable, List, Optional
from spi_driver import SpiRegisters
from spi_driver.modules import GPIO

from crosslab.soa_services.electrical.messages import State


class HAL:
    def __init__(self, signal_names: List[str], virtual: bool = False) -> None:
        self.signal_names = signal_names
        self.virtual = virtual
        self._signal_changed_handlers: List[Callable[[str, bool], None]] = []
        if virtual:
            self.gpios = [False] * len(signal_names)
            pass
        else:
            registers = SpiRegisters()
            self.gpios = GPIO(registers, 0, 4)
            self.gpios.on("change", self._signal_changed)

            asyncio.create_task(registers.communicate_coroutine())

    def _signal_changed(self, index: int, value: bool):
        name = self.signal_names[index]
        for handler in self._signal_changed_handlers:
            handler(name, value)

    def addSignalChangedHandler(self, handler: Callable[[str, bool], None]):
        self._signal_changed_handlers.append(handler)

    def deleteSignalChangedHandler(self, handler: Callable[[str, bool], None]):
        self._signal_changed_handlers.remove(handler)

    def setVirtualSignal(self, name: str, value: bool):
        index = self.signal_names.index(name)
        self.gpios[index] = value
        self._signal_changed(index, value)

    def toggleVirtualSignal(self, name: str):
        index = self.signal_names.index(name)
        value = not self.gpios[index]
        self.gpios[index] = value
        self._signal_changed(index, value)

    def setSignal(self, name: str, value: State):
        index = self.signal_names.index(name)
        output: Optional[bool] = None
        if value in ["strongH", "weakH"]:
            output = True
        elif value in ["strongL", "weakL"]:
            output = False
        self.gpios[index] = output
        if self.virtual:
            print(f"setSignal {name} {value} {output}")

    def getSignal(self, name: str) -> State:
        try:
            index = self.signal_names.index(name)
            return "strongH" if self.gpios[index] else "strongL"
        except ValueError:
            return "highZ"
