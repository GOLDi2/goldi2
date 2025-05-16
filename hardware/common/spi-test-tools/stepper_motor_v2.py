#!/usr/bin/env python3
import asyncio
import struct
import sys
import termios
import time
import tty
from math import sqrt

from pyee.asyncio import AsyncIOEventEmitter
#from fake_registers import SpiRegisters
from spi_driver import SpiRegisters

clk_frequency=48*10**6
velocity_scaling = 2**25
acceleration_scaling = 1
class StepperMotor(AsyncIOEventEmitter):
    def __init__(
        self, registers: SpiRegisters, address: int, max_speed: float=50000, max_acceleration: float=1000000
    ):
        super().__init__()
        self._registers = registers
        self._address = address
        self._max_speed = max_speed
        self._max_acceleration= max_acceleration
        self._target_position = 0
        self._control_mode = "speed"
        self.max_speed = 0
        self.slow_down_distance = 0
        self.positions = []

        #self._registers.add_register(self._address, self._calculatePostitionRegisters)
        #for r in range(self._address, self._address+8+1):
        #    self._registers.add_register(r, self._calculatePostitionRegisters)

    def _get_encoder_division(self):
        return 1.25/8
    
    def getPosition(self):
        return (self._registers[self._address+3] + (self._registers[self._address + 4] << 8)) / self._get_encoder_division()
    
    @property
    def velocity(self):
        """
        The velocity of the motor in steps/s.
        """
        velocity_register =self._registers[self._address+5] + (self._registers[self._address + 6] << 8)
        return velocity_register * clk_frequency / velocity_scaling
    @velocity.setter
    def velocity(self, value: float):
        reg = int(value * velocity_scaling / clk_frequency)
        self._registers[self._address + 5] = reg & 0xFF
        self._registers[self._address + 6] = (reg >> 8) & 0xFF

    @property
    def acceleration_register(self) -> int:
        return self._registers[self._address+7] + (self._registers[self._address + 8] << 8) + 1
    @acceleration_register.setter
    def acceleration_register(self, value: int):
        self._registers[self._address + 7] = (value -1 ) & 0xFF
        self._registers[self._address + 8] = ((value - 1) >> 8) & 0xFF


    @property
    def acceleration(self) -> float:
        """
        The acceleration of the motor in steps/s^2.
        """
        return 1/self.acceleration_register*(clk_frequency**2) / (acceleration_scaling * velocity_scaling)
    @acceleration.setter
    def acceleration(self, value: float):
        self.acceleration_register = int(clk_frequency**2 / (max(value,1)*acceleration_scaling * velocity_scaling))

    @property
    def min_velocity(self):
        """
        The velocity of the motor in steps/s.
        """
        velocity_register = self._registers[self._address+9] + (self._registers[self._address + 10] << 8)
        return velocity_register * clk_frequency / velocity_scaling
    @min_velocity.setter
    def min_velocity(self, value: float):
        reg = int(value * velocity_scaling / clk_frequency)
        self._registers[self._address + 9] = reg & 0xFF
        self._registers[self._address + 10] = (reg >> 8) & 0xFF

    def _set_position_stop_register(self, position: int):
        position = int(self._get_encoder_division()*position)
        self._registers[self._address + 11] = position & 0xFF
        self._registers[self._address + 12] = (position >> 8) & 0xFF

    def _set_position_slow_down_register(self, position: int):
        position = int(self._get_encoder_division()*position)
        self._registers[self._address + 13] = position & 0xFF
        self._registers[self._address + 14] = (position >> 8) & 0xFF

    def setSpeed(self, value: float):
        value = value * self._max_speed
        self._control_mode = "speed"
        if value > 0:
            # dir0 -----------------------------------,
            # dir1 ----------------------------------,|
            # pos_ctl --------------------------,    ||
            # stop ----------------------------,|    ||
            #                                  ||    ||
            self._registers[self._address] = 0b00000001
        elif value < 0:
            # dir0 -----------------------------------,
            # dir1 ----------------------------------,|
            # pos_ctl --------------------------,    ||
            # stop ----------------------------,|    ||
            #                                  ||    ||
            self._registers[self._address] = 0b00000010
        else:
            # dir0 -----------------------------------,
            # dir1 ----------------------------------,|
            # pos_ctl --------------------------,    ||
            # stop ----------------------------,|    ||
            #                                  ||    ||
            self._registers[self._address] = 0b10000000

        self.target_velocity = abs(value)
        self.velocity = self.target_velocity

    def setAcceleration(self, value: float):
        value= value * self._max_acceleration
        self.acceleration = value

    def setPostion(self, value: int, speed: float=1):
        self._control_mode = "position"
        self._target_position = value
        self.target_velocity = abs(speed* self._max_speed)
        self.velocity = self.target_velocity
        self._calculatePostitionRegisters(self._registers, True)

    
    def getMode(self):
        return self._control_mode

    def _calculatePostitionRegisters(self, registers: SpiRegisters, force=False):
        position = self.getPosition()
        stop_position = self._target_position
        distance = stop_position - position
        self.positions=[*self.positions, distance][-20:]

        if self._control_mode == "speed":
            return

        if distance > 0:
            # dir0 -----------------------------------,
            # dir1 ----------------------------------,|
            # pos_ctl --------------------------,    ||
            # stop ----------------------------,|    ||
            #                                  ||    ||
            self._registers[self._address] = 0b01000010
        elif distance < 0:
            # dir0 -----------------------------------,
            # dir1 ----------------------------------,|
            # pos_ctl --------------------------,    ||
            # stop ----------------------------,|    ||
            #                                  ||    ||
            self._registers[self._address] = 0b01000001
        else:
            # dir0 -----------------------------------,
            # dir1 ----------------------------------,|
            # pos_ctl --------------------------,    ||
            # stop ----------------------------,|    ||
            #                                  ||    ||
            self._registers[self._address] = 0b11000000

        max_velocity = self.target_velocity * velocity_scaling / clk_frequency
        acceleration = self.acceleration_register
        #slow_down_distance = ((max_velocity-1)*max_velocity*acceleration*acceleration_scaling / 2+max_velocity)/velocity_scaling
        slow_down_distance = ((max_velocity-1)*max_velocity*acceleration*acceleration_scaling / 2 + max_velocity)/velocity_scaling
        if slow_down_distance > abs(distance)/2:
            slow_down_distance = abs(distance)/2
        self.slow_down_distance = slow_down_distance

        if distance < 0:
            slow_down_postion = stop_position + slow_down_distance
        else:
            slow_down_postion = stop_position - slow_down_distance

        self._set_position_stop_register(int(stop_position))
        self._set_position_slow_down_register(int(slow_down_postion))
        #self._set_position_slow_down_register(int(stop_position))





registers: SpiRegisters
xMotor: StepperMotor
start_address: int
speed: float = 0.8
acceleration: float = 0.9
dir = "stop"
mode = "speed"
target_pos = 0

async def input_coroutine():
    global speed
    global acceleration
    global dir
    global mode
    global target_pos

    stdin = sys.stdin.fileno()
    tty.setcbreak(stdin, termios.TCSANOW)

    loop = asyncio.get_event_loop()
    reader = asyncio.StreamReader()
    protocol = asyncio.StreamReaderProtocol(reader)
    await loop.connect_read_pipe(lambda: protocol, sys.stdin)
    while True:
        char = await reader.read(5)
        if char == b'e':
            speed += 0.01
        if char == b'E':
            speed += 0.1
        if char == b'q':
            speed -= 0.01
        if char == b'Q':
            speed -= 0.1

        if char == b'x':
            acceleration += 0.001
        if char == b'X':
            acceleration += 0.1
        if char == b'y':
            acceleration -= 0.001
        if char == b'Y':
            acceleration -= 0.1

        if acceleration < 0:
            acceleration = 0
        if acceleration > 1:
            acceleration = 1

        xMotor.setAcceleration(acceleration)

        if char == b's':
            if mode == "position":
                xMotor.setPostion(target_pos, speed)
            else:
                dir = "stop"
        if char == b'a':
            if mode == "position":
                target_pos -= 1*256
            else:
                dir = "left"
        if char == b'd':
            if mode == "position":
                target_pos += 1*256
            else:
                dir = "right"
        if char == b'A':
            if mode == "position":
                target_pos -= 10*256
            else:
                dir = "left"
        if char == b'D':
            if mode == "position":
                target_pos += 10*256
            else:
                dir = "right"

        if char == b'm':
            mode = "position" if mode == "speed" else "speed"
            xMotor.setSpeed(0)


        if speed < 0:
            speed = 0
        if speed > 1:
            speed = 1

        if target_pos < 0:
            target_pos = 0
        if target_pos > 65535:
            target_pos = 65535


        if mode == "speed":
            if dir == "stop":
                xMotor.setSpeed(0)
            if dir == "left":
                xMotor.setSpeed(-speed)
            if dir == "right":
                xMotor.setSpeed(speed)

async def output_coroutine():
    print('\x1b[2J')
    while True:
        await asyncio.sleep(0.1)
        print("\x1b[H", end="")
        print("Mode:", mode,"      ")
        print("Position:", xMotor.getPosition(),"      ")
        print("Speed:", int(speed*100),"%      ", int(speed*xMotor._max_speed * velocity_scaling / clk_frequency), "           ")
        print("Acceleration:", int(acceleration*100),"%      ",  int(clk_frequency**2 / (max(acceleration*xMotor._max_acceleration,1)*acceleration_scaling * velocity_scaling)),"           ")
        print("Max Speed:", int(xMotor.max_speed),"       ")
        print("Slow Down Distance:", int(xMotor.slow_down_distance),"       ")
        print("Distances:", xMotor.positions[-10:], "\x1b[K")
        if mode == "speed":
            print("Direction:", dir,"      ")
            print()
            print("Press e/E to increase speed; Press q/Q to decrease speed")
            print("Press y/Y to increase acceleration; Press x/X to decrease acceleration")
            print("Press m to switch to position control")
            print("Press s to stop; Press a to drive left; Press d to drive right", "                                                  ")
        else:
            print("Target Position:", target_pos,"      ")
            print()
            print("Press e/E to increase speed; Press q/Q to decrease speed")
            print("Press y/Y to increase acceleration; Press x/X to decrease acceleration")
            print("Press m to switch to speed control   ")
            print("Press s to drive to target position; Press a/A to decrease target position; Press d/D to increase target position")
        print()

        des=["CTRL",
             "ENC_DIVISION[0]", "ENC_DIVISION[1]",
             "POSITION[0]", "POSITION[1]",
             "SPEED[0]", "SPEED[1]",
             "ACCELERATION[0]", "ACCELERATION[1]",
             "MIN_SPEED[0]", "MIN_SPEED[1]",
             "POSITION_STOP[0]", "POSITION_STOP[1]",
             "POSITION_SD[0]", "POSITION_SD[1]",
             ]
        for r in range(start_address, start_address+15):
            print("Register " + str(r).rjust(3) + " = 0b", end="")
            print("{0:b} ".format(registers[r]).zfill(9), end="")
            print(des[r-start_address])

async def main_async():
    global xMotor
    global start_address
    global registers

    try:
        start_address=int(sys.argv[1])
        if start_address < 0 or start_address > 255:
            raise ValueError("Invalid start address")
    except:
        print("Usage: stepper_motor_v2.py <start_address>")
        return

    registers = SpiRegisters()

    #registers[start_address+7]=0x41
    #registers[start_address+9]=0x48
    #registers.communicate()

    xMotor = StepperMotor(registers, start_address, max_speed=50000, max_acceleration=1000000)
    for i in range(start_address, start_address+16):
        registers.add_register(i)
    asyncio.create_task(registers.communicate_coroutine())

    asyncio.create_task(output_coroutine())
    await asyncio.create_task(input_coroutine())


def main():
    asyncio.run(main_async())

if __name__ == "__main__":
    main()