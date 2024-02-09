from typing import Callable


class Sensor:
    def __init__(self, value: bool) -> None:
        self.value = value
        self.onChange: Callable[[bool], None] = None

    def change(self, value):
        self.value = value
        if self.onChange != None:
            self.onChange(self.value)


class HAL:
    def __init__(self) -> None:
        self.LimitXLeft = Sensor(False)
        self.LimitXRight = Sensor(False)
        self.LimitYBottom = Sensor(False)
        self.LimitYTop = Sensor(False)
        self.XMotorLeft = False
        self.XMotorRight = False
        self.YMotorBottom = False
        self.YMotorTop = False


hal: HAL = None
