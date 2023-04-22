import asyncio
from typing import Callable, List, Optional
from spi_driver import SpiRegisters
from spi_driver.modules import BinInput

from crosslab.soa_services.electrical.messages import State

sensor_names = [
    "InZTop",
    "InZBottom",
    "InYRef",
    "InYFront",
    "InYBack",
    "InXRef",
    "InXRight",
    "InXLeft",
    "InProximity",
]

error_names = [
    "error_0",
    "error_1",
    "error_2",
    "error_3",
    "error_4",
    "error_5",
    "error_6",
    "error_7",
    "error_8",
    "error_9",
    "error_10",
    "error_11",
    "error_12",
    "error_13",
    "error_14",
    "error_15",
    "error_16",
    "error_17",
    "error_18",
    "error_19",
    "error_20",
    "error_21",
    "error_22",
]


class HAL:
    def __init__(self, signal_names: List[str]) -> None:
        self.signal_names = signal_names
        self._signal_changed_handlers: List[Callable[[str, bool], None]] = []

        registers = SpiRegisters()
        self._sensors = BinInput(registers, [3, 2], sensor_names)
        self._errors = BinInput(registers, [4, 5, 6], error_names)

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
