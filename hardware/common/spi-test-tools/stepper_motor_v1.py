#!/usr/bin/env python3
import asyncio
import termios
import tty
#from fake_registers import SpiRegisters
from spi_driver import SpiRegisters
from spi_driver.modules import StepperMotor
import sys


registers: SpiRegisters
xMotor: StepperMotor
start_address: int
speed: int = 0
dir = "stop"

async def input_coroutine():
    global speed
    global dir

    stdin = sys.stdin.fileno()
    tty.setcbreak(stdin, termios.TCSANOW)

    loop = asyncio.get_event_loop()
    reader = asyncio.StreamReader()
    protocol = asyncio.StreamReaderProtocol(reader)
    await loop.connect_read_pipe(lambda: protocol, sys.stdin)
    while True:
        char = await reader.read(5)
        if char == b'e':
            speed += 1
        if char == b'E':
            speed += 10
        if char == b'q':
            speed -= 1
        if char == b'Q':
            speed -= 10

        if char == b's':
            dir = "stop"
        if char == b'a':
            dir = "left"
        if char == b'd':
            dir = "right"

        if speed < 0:
            speed = 0
        if speed > 255:
            speed = 255
        
        if dir == "stop":
            xMotor.set(0)
        if dir == "left":
            xMotor.set(-speed)
        if dir == "right":
            xMotor.set(speed)

async def output_coroutine():
    print('\x1b[2J')
    while True:
        await asyncio.sleep(0.1)
        print("\x1b[H", end="")
        print("Speed:", speed,"      ")
        print("Direction:", dir,"      ")
        print("Press e/E to increase speed; Press q/Q to decrease speed")
        print("Press s to stop; Press a to drive left; Press d to drive right")
        print()
        print("Register "+str(start_address)+" = 0b", end="")
        print("{0:b}".format(registers[start_address]).zfill(8))
        print("Register "+str(start_address+1)+" = 0b", end="")
        print("{0:b}".format(registers[start_address+1]).zfill(8))
        print("Register "+str(start_address+2)+" = 0b", end="")
        print("{0:b}".format(registers[start_address+2]).zfill(8))

async def main_async():
    global xMotor
    global start_address
    global registers

    try:
        start_address=int(sys.argv[1])
        if start_address < 0 or start_address > 255:
            raise ValueError("Invalid start address")
    except:
        print("Usage: stepper_motor_v1.py <start_address>")
        return
    
    registers = SpiRegisters()
    xMotor = StepperMotor(registers, start_address, start_address+1)
    for i in range(start_address, start_address+3):
        registers.add_register(i)
    asyncio.create_task(registers.communicate_coroutine())
    asyncio.create_task(output_coroutine())
    await asyncio.create_task(input_coroutine())


def main():
    asyncio.run(main_async())

if __name__ == "__main__":
    main()