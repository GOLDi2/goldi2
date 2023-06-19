import asyncio
from typing import List, Literal
from spi_driver import SpiRegisters
from spi_driver.modules import Bit, Motor, StepperMotor, Numeric

xPositions = [
    607,
    1807,
    3007,
    4207,
    5407,
    6607,
    7807,
    9007,
    10207,
    11407,
]

zPositions = [
    894,
    11324,
    21754,
    32184,
    42614,
]


class CorrectedMotor:
    state: Literal[
        "stopped", "forward", "backward", "correctingForward", "correctingBackward"
    ]

    def __init__(
        self,
        motor: Motor,
        encoder: Numeric,
        holdBit: Bit,
        validPostions: List[int],
        allowedDeviation: int = 100,
        correctingSpeed: int = 100,
    ) -> None:
        self.motor = motor
        self.encoder = encoder
        self.holdBit = holdBit
        self.validPostions = validPostions
        self.allowedDeviation = allowedDeviation
        self.correctingSpeed = correctingSpeed

        self.encoder.on("change", self.encoderChange)
        self.state = "stopped"
        self.encoderChanged = False

    async def correctingTask(self):
        self.holdBit.set(True)
        await asyncio.sleep(0.05)
        if self.state == "correctingBackward":
            self.motor.set(self.correctingSpeed)
        elif self.state == "correctingForward":
            self.motor.set(-self.correctingSpeed)

        while self.encoderChanged:
            self.encoderChanged = False
            await asyncio.sleep(0.05)
        self.motor.set(0)
        self.holdBit.set(False)

    def nearestValidPosition(
        self, dir: Literal["forward", "backward", "both"] = "both"
    ):
        currentPos = self.encoder.value()
        if dir == "forward":
            _validPostions = [
                validPosition
                for validPosition in self.validPostions
                if validPosition >= currentPos
            ]
        elif dir == "backward":
            _validPostions = [
                validPosition
                for validPosition in self.validPostions
                if validPosition <= currentPos
            ]
        else:
            _validPostions = self.validPostions.copy()

        _validPostions.sort(key=lambda validPosition: abs(validPosition - currentPos))
        try:
            return _validPostions[0], abs(_validPostions[0] - currentPos)
        except IndexError:
            return currentPos, 0xFFFFFFFF

    def encoderChange(self, value: int):
        self.encoderChanged = True

    def set(self, value: int):
        if value < -255 or value > 255:
            raise ValueError("value must be between -256 and 256")
        if value > 0:
            self.holdBit.set(False)
            self.state = "forward"
            self.motor.set(value)
        elif value < 0:
            self.holdBit.set(False)
            self.state = "backward"
            self.motor.set(value)
        else:
            forwardPosition, forwardDeviation = self.nearestValidPosition("forward")
            backwardPostion, backwardDeviation = self.nearestValidPosition("backward")
            if (
                forwardDeviation <= self.allowedDeviation
                or backwardDeviation <= self.allowedDeviation
            ):
                if forwardDeviation <= backwardDeviation:
                    self.state = "correctingForward"
                    asyncio.create_task(self.correctingTask())
                else:
                    self.state = "correctingBackward"
                    asyncio.create_task(self.correctingTask())
            else:
                self.state = "stopped"
            self.motor.set(0)


class HAL:
    def __init__(self) -> None:
        registers = SpiRegisters()
        self.overrideY = Bit(registers, 1, 4)
        self.hold_z = Bit(registers, 1, 3)
        self.hold_x = Bit(registers, 1, 2)
        self.reset_z_enc = Bit(registers, 1, 1)
        self.reset_x_enc = Bit(registers, 1, 0)
        self.inductive = Bit(registers, 2, 6)
        self.z_top = Bit(registers, 2, 5)
        self.z_bottom = Bit(registers, 2, 4)
        self.y_inside = Bit(registers, 2, 3)
        self.y_outside = Bit(registers, 2, 2)
        self.x_right = Bit(registers, 2, 1)
        self.x_left = Bit(registers, 2, 0)
        self.x1 = Bit(registers, 3, 0)
        self.x2 = Bit(registers, 3, 1)
        self.x3 = Bit(registers, 3, 2)
        self.x4 = Bit(registers, 3, 3)
        self.x5 = Bit(registers, 3, 4)
        self.x6 = Bit(registers, 3, 5)
        self.x7 = Bit(registers, 3, 6)
        self.x8 = Bit(registers, 3, 7)
        self.x9 = Bit(registers, 4, 0)
        self.x10 = Bit(registers, 4, 1)
        self.z1 = Bit(registers, 4, 2)
        self.z2 = Bit(registers, 4, 3)
        self.z3 = Bit(registers, 4, 4)
        self.z4 = Bit(registers, 4, 5)
        self.z5 = Bit(registers, 4, 6)
        self.XEncoder = Numeric(registers, 9, 16, "little")
        self.ZEncoder = Numeric(registers, 11, 16, "little")
        self.uncorrectedXMotor = StepperMotor(registers, 13, 14)
        self.XMotor = CorrectedMotor(
            self.uncorrectedXMotor, self.XEncoder, self.hold_x, xPositions, 300, 50
        )
        self.YMotor = Motor(registers, 19, 20)
        self.uncorrectedZMotor = StepperMotor(registers, 21, 22)
        self.ZMotor = CorrectedMotor(
            self.uncorrectedZMotor, self.ZEncoder, self.hold_z, zPositions, 5000, 20
        )

        registers.spi.xfer2([0x80, 18, 0x09, 0x45, 0x57])  # Init XMotor
        registers.spi.xfer2([0x80, 18, 0x0A, 0x00, 0x00])
        registers.spi.xfer2([0x80, 18, 0x0D, 0x0A, 0x0F])
        registers.spi.xfer2([0x80, 18, 0x0E, 0x00, 0x60])
        registers.spi.xfer2([0x80, 18, 0x00, 0x00, 0x04])

        registers.spi.xfer2([0x80, 26, 0x09, 0x45, 0x57])  # Init ZMotor
        registers.spi.xfer2([0x80, 26, 0x0A, 0x00, 0x00])
        registers.spi.xfer2([0x80, 26, 0x0D, 0x0A, 0x0F])
        registers.spi.xfer2([0x80, 26, 0x0E, 0x00, 0x60])
        registers.spi.xfer2([0x80, 26, 0x00, 0x00, 0x04])

        asyncio.create_task(registers.communicate_coroutine())

    async def init_sequence(self):
        self.uncorrectedXMotor.set(0)
        self.uncorrectedZMotor.set(0)

        self.overrideY.set(True)
        self.YMotor.set(255)
        while not self.y_outside.value():
            await asyncio.sleep(0.1)
        self.YMotor.set(0)
        self.overrideY.set(False)

        await asyncio.sleep(0.5)
        print("Y Outside")

        # Init Model:
        self.uncorrectedXMotor.set(255)
        self.uncorrectedZMotor.set(100)
        while not self.x_left.value():
            await asyncio.sleep(0.1)
        while not self.z_bottom.value():
            await asyncio.sleep(0.1)

        self.uncorrectedXMotor.set(-50)
        while self.x_left.value():
            await asyncio.sleep(0.1)
        self.uncorrectedXMotor.set(5)
        while not self.x_left.value():
            await asyncio.sleep(0.1)

        self.uncorrectedZMotor.set(-10)
        while self.z_bottom.value():
            await asyncio.sleep(0.1)
        self.uncorrectedZMotor.set(1)
        while not self.z_bottom.value():
            await asyncio.sleep(0.1)

        self.uncorrectedXMotor.set(0)
        self.uncorrectedZMotor.set(0)
        self.reset_x_enc.set(True)
        self.reset_z_enc.set(True)
        await asyncio.sleep(0.2)
        self.reset_x_enc.set(False)
        self.reset_z_enc.set(False)
        await asyncio.sleep(0.1)
