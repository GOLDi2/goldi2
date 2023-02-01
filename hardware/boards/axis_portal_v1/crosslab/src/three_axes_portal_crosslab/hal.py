import asyncio
from typing import Callable, List, Optional
from spi_driver import SpiRegisters
from spi_driver.modules import GPIO

from crosslab.soa_services.electrical.schema import State, Direction

class HAL:
    def __init__(self, signal_names: List[str], virtual: bool=False) -> None:
        self.signal_names = signal_names
        self.virtual = virtual
        self._signal_changed_handlers: List[Callable[[str, bool], None]] = []
        if virtual:
            #self.gpios = [value] * len(signal_names)
            pass
        else:
            registers = SpiRegisters()
            self.gpios = GPIO(registers, 0, 8)
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
    
    def setSignal(self, name: str, value: State):
        index = self.signal_names.index(name)
        output: Optional[bool] = None
        if value in [State.STRONG_H, State.WEAK_H]:
            output = True
        elif value in [State.STRONG_L, State.WEAK_L]:
            output = False
        self.gpios[index] = output

    def getSignal(self, name: str) -> State:
        index = self.signal_names.index(name)
        return State.STRONG_H if self.gpios[index] else State.STRONG_L