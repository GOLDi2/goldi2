#!/usr/bin/env python3
import asyncio
import math
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
        self, registers: SpiRegisters, address: int, max_speed: float=50000, max_acceleration: float=1000000, step_encoder_ratio: float = 8/1.25
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
        self.step_encoder_ratio = step_encoder_ratio

        self._registers.add_register(self._address, self._calculatePostitionRegisters)
        self._registers.add_register(self._address+1, self._calculatePostitionRegisters)
        self._registers.add_register(self._address+2, self._calculatePostitionRegisters)
    
    # region: Registers
    @property
    def position_register(self):
        return (self._registers[self._address+1] + (self._registers[self._address + 2] << 8))
    
    @property
    def velocity_register(self):
        return (self._registers[self._address+3] + (self._registers[self._address + 4] << 8))
    @velocity_register.setter
    def velocity_register(self, value: int):
        self._registers[self._address + 3] = (value) & 0xFF
        self._registers[self._address + 4] = (value >> 8) & 0xFF

    @property
    def acceleration_register(self) -> int:
        return self._registers[self._address+5] + (self._registers[self._address + 6] << 8)
    @acceleration_register.setter
    def acceleration_register(self, value: int):
        self._registers[self._address + 5] = (value -1 ) & 0xFF
        self._registers[self._address + 6] = ((value - 1) >> 8) & 0xFF

    @property
    def position_slow_down_register(self) -> int:
        return self._registers[self._address+7] + (self._registers[self._address + 8] << 8)
    @position_slow_down_register.setter
    def position_slow_down_register(self, value: float):
        self._registers[self._address + 7] = value & 0xFF
        self._registers[self._address + 8] = (value >> 8) & 0xFF
    # endregion

    @property
    def acceleration(self) -> float:
        """
        The acceleration of the motor in steps/s^2.
        """
        return 1/(self.acceleration_register+1)*(clk_frequency**2) / (acceleration_scaling * velocity_scaling)
    @acceleration.setter
    def acceleration(self, value: float):
        self.acceleration_register = int(clk_frequency**2 / (max(value,1)*acceleration_scaling * velocity_scaling))-1

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

    def setPostion(self, position: int, velocity: float=1):
        self._control_mode = "position"
        self._target_position = position
        self.velocity = abs(velocity)
        self._calculatePostitionRegisters(True)

    def _calculatePostitionRegisters(self, registers, force=False):
        if self._control_mode == "speed":
            return
        if not force and self._registers[self._address] & 0b00010000:
            return # we are currently moving
        
        position = self.position_register*self.step_encoder_ratio # convert to motor steps
        stop_position = self._target_position*self.step_encoder_ratio # convert to motor steps
        distance = stop_position - position

        self._set_control_register(distance, True)

        max_velocity = self.velocity_register
        acceleration = (self.acceleration_register+1)*acceleration_scaling
        slow_down_distance = ((max_velocity-1)*max_velocity*acceleration / 2 + max_velocity)/velocity_scaling
        if slow_down_distance > abs(distance)/2:
            slow_down_distance = abs(distance)/2

        if distance < 0:
            slow_down_postion = stop_position + slow_down_distance
        else:
            slow_down_postion = stop_position - slow_down_distance

        self.position_slow_down_register=int(slow_down_postion/self.step_encoder_ratio)# convert to encoder steps

    def _set_control_register(self, direction: int, position_control: bool):
        register=0
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

        xMotor.acceleration=acceleration*1000000

        if char == b's':
            if mode == "position":
                xMotor.setPostion(target_pos, speed*50000)
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
                xMotor.setSpeed(-speed*50000)
            if dir == "right":
                xMotor.setSpeed(speed*50000)

async def output_coroutine():
    print('\x1b[2J')
    while True:
        await asyncio.sleep(0.1)
        print("\x1b[H", end="")
        print("Mode:", mode,"      ")
        print("Position:", xMotor.position_register,"      ")
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
             "POSITION[0]", "POSITION[1]",
             "SPEED[0]", "SPEED[1]",
             "ACCELERATION[0]", "ACCELERATION[1]",
             "POSITION_SD[0]", "POSITION_SD[1]",
             ]
        for r in range(start_address, start_address+9):
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