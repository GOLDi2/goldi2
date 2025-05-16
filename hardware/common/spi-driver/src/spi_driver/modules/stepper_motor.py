from pyee.asyncio import AsyncIOEventEmitter

from spi_driver.spi_registers import SpiRegisters

clk_frequency = 48 * 10**6
velocity_scaling = 2**25
acceleration_scaling = 1


class StepperMotor(AsyncIOEventEmitter):
    def __init__(
        self,
        registers: SpiRegisters,
        address: int,
        max_speed: float = 50000,
        max_acceleration: float = 1000000,
        step_encoder_ratio: float = 8 / 1.25,
    ):
        super().__init__()
        self._registers = registers
        self._address = address
        self._max_speed = max_speed
        self._max_acceleration = max_acceleration
        self._target_position = 0
        self._control_mode = "speed"
        self.max_speed = 0
        self.slow_down_distance = 0
        self.step_encoder_ratio = step_encoder_ratio

        self._registers.add_register(self._address, self._calculatePostitionRegisters)
        self._registers.add_register(
            self._address + 1, self._calculatePostitionRegisters
        )
        self._registers.add_register(
            self._address + 2, self._calculatePostitionRegisters
        )

    # region: Registers
    @property
    def position_register(self):
        return self._registers[self._address + 1] + (
            self._registers[self._address + 2] << 8
        )

    @property
    def velocity_register(self):
        return self._registers[self._address + 3] + (
            self._registers[self._address + 4] << 8
        )

    @velocity_register.setter
    def velocity_register(self, value: int):
        self._registers[self._address + 3] = (value) & 0xFF
        self._registers[self._address + 4] = (value >> 8) & 0xFF

    @property
    def acceleration_register(self) -> int:
        return self._registers[self._address + 5] + (
            self._registers[self._address + 6] << 8
        )

    @acceleration_register.setter
    def acceleration_register(self, value: int):
        self._registers[self._address + 5] = (value - 1) & 0xFF
        self._registers[self._address + 6] = ((value - 1) >> 8) & 0xFF

    @property
    def position_slow_down_register(self) -> int:
        return self._registers[self._address + 7] + (
            self._registers[self._address + 8] << 8
        )

    @position_slow_down_register.setter
    def position_slow_down_register(self, value: int):
        self._registers[self._address + 7] = value & 0xFF
        self._registers[self._address + 8] = (value >> 8) & 0xFF

    # endregion

    @property
    def acceleration(self) -> float:
        """
        The acceleration of the motor in steps/s^2.
        """
        return (
            1
            / (self.acceleration_register + 1)
            * (clk_frequency**2)
            / (acceleration_scaling * velocity_scaling)
        )

    @acceleration.setter
    def acceleration(self, value: float):
        self.acceleration_register = (
            int(
                clk_frequency**2
                / (max(value, 1) * acceleration_scaling * velocity_scaling)
            )
            - 1
        )

    @property
    def velocity(self):
        """
        The velocity of the motor in steps/s.
        """
        return self.velocity_register * clk_frequency / velocity_scaling

    @velocity.setter
    def velocity(self, value: float):
        self.velocity_register = int(value * velocity_scaling / clk_frequency)

    def setSpeed(self, velocity: float):
        self._control_mode = "speed"
        self._set_control_register(velocity, False)
        self.velocity = abs(velocity)

    def setPostion(self, position: int, velocity: float = 1):
        self._control_mode = "position"
        self._target_position = position
        self.velocity = abs(velocity)
        self._calculatePostitionRegisters(True)

    def _calculatePostitionRegisters(self, registers, force=False):
        if self._control_mode == "speed":
            return
        if not force and self._registers[self._address] & 0b00010000:
            return  # we are currently moving

        position = (
            self.position_register * self.step_encoder_ratio
        )  # convert to motor steps
        stop_position = (
            self._target_position * self.step_encoder_ratio
        )  # convert to motor steps
        distance = stop_position - position

        self._set_control_register(distance, True)

        max_velocity = self.velocity_register
        acceleration = (self.acceleration_register + 1) * acceleration_scaling
        slow_down_distance = (
            (max_velocity - 1) * max_velocity * acceleration / 2 + max_velocity
        ) / velocity_scaling
        if slow_down_distance > abs(distance) / 2:
            slow_down_distance = abs(distance) / 2

        if distance < 0:
            slow_down_postion = stop_position + slow_down_distance
        else:
            slow_down_postion = stop_position - slow_down_distance

        self.position_slow_down_register = int(
            slow_down_postion / self.step_encoder_ratio
        )  # convert to encoder steps

    def _set_control_register(self, direction: float, position_control: bool):
        register = 0
        if direction > 0:
            # dir0 --------------,
            # dir1 -------------,|
            # pos_ctl ---------,||
            #                  |||
            register += 0b00000010
        elif direction < 0:
            register += 0b00000001
        else:
            register += 0b00000000
        if position_control:
            register += 0b00000100
        self._registers[self._address] = register
