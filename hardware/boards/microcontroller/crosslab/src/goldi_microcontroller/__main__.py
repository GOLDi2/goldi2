#! /usr/bin/env python3

import argparse
import asyncio
import os
from json import JSONDecoder
from typing import Dict, Optional

from typing_extensions import Literal

from crosslab.api_client.improved_client import APIClient
from crosslab.soa_client.device_handler import DeviceHandler
from crosslab.soa_services.electrical import ElectricalConnectionService
from crosslab.soa_services.electrical.signal_interfaces.gpio import (
    ConstractableGPIOInterface, GPIOInterface)
from crosslab.soa_services.file import FileService__Consumer, FileServiceEvent
from crosslab.soa_services.programming import (ProgrammingService__Producer,
                                               ProgramRequestEvent)
from goldi_microcontroller.hal import HAL

interfaces: Dict[str, GPIOInterface] = dict()
hal: HAL
deviceHandler: DeviceHandler
programming_service: ProgrammingService__Producer

signal_names = [
    *["PE0", "PE1", "PE2", "PE3", "PE4", "PE5", "PE6", "PE7"],
    *["PH0", "PH1", "PH2", "PH3", "PH4", "PH5", "PH6", "PH7"],
    *["PB0", "PB1", "PB2", "PB3", "PB4", "PB5", "PB6", "PB7"],
    *["PL0", "PL1", "PL2", "PL3", "PL4", "PL5", "PL6", "PL7"],
    *["PD0", "PD1", "PD2", "PD3", "PD4", "PD5", "PD6", "PD7"],
    *["PG5", "PG4", "PG3", "PG2", "PG1", "PG0"],
    *["PF0", "PF1", "PF2", "PF3", "PF4", "PF5", "PF6", "PF7"],
    *["PK0", "PK1", "PK2", "PK3", "PK4", "PK5", "PK6", "PK7"],
    *["PA0", "PA1", "PA2", "PA3", "PA4", "PA5", "PA6", "PA7"],
    *["PJ0", "PJ1", "PJ2", "PJ3", "PJ4", "PJ5", "PJ6", "PJ7"],
    *["PC0", "PC1", "PC2", "PC3", "PC4", "PC5", "PC6", "PC7"],
    *["nRESET"],
]


def panic(message: str):
    print(f"PANIC: {message}")


def userError(message: str):
    print(f"USER ERROR: {message}")


def newElectricalInterface(interface):
    global hal  # noqa: F824

    print(f"New electrical interface: {interface}")

    if isinstance(interface, GPIOInterface):
        name: str = interface.configuration["signals"]["gpio"]
        isInput = interface.configuration.get(
            "direction", "in") in ["inout", "in"]
        isOutput = interface.configuration.get(
            "direction", "in") in ["inout", "out"]

        print("name", name)
        print("isInput", isInput)
        print("isOutput", isOutput)

        if name not in signal_names:
            panic("Signal interface must be named like a sensor")

        if isOutput and isInput:
            panic("Signal interface can not be input and output")

        interfaceIdx = signal_names.index(name)
        interfaces[name] = interface

        if isInput:
            hal.gpios[interfaceIdx].set(False)
            hal.gpios[interfaceIdx].setOutput(True)
            interface.on(
                "signalChange",
                lambda event: hal.gpios[interfaceIdx].set(
                    event.state in ["strongH", "weakH"]
                ),
            )

        if isOutput:
            hal.gpios[interfaceIdx].setOutput(False)
            hal.gpios[interfaceIdx].on(
                "change",
                lambda value: interface.changeDriver(
                    "strongH" if value else "strongL"),
            )
            interface.changeDriver(
                "strongH" if hal.gpios[interfaceIdx].value() else "strongL"
            )


def lightControl():
    if len(
        [
            c
            for c in deviceHandler._connections
            if deviceHandler._connections[c].state == "connected"
        ]
    ):
        os.system("set_led_experiment")
    else:
        os.system("set_led_no_experiment")


async def program(file_type: Literal["hex"] | Literal["elf"], content: bytes | bytearray | memoryview):
    # Command to program the ATmega2560 using avrdude
    os.system("set_led_uploading")
    hal.enable_isp.set(True)
    hal.registers.communicate()

    if file_type == 'hex':
        command = "avrdude -v -p atmega2560 -c rpi -V -U flash:w:-:i"
    elif file_type == 'elf':
        command = "avrdude -v -p atmega2560 -c rpi -U flash:w:-:e"
    else:
        raise Exception(f"Unsupported file type: {file_type}")

    process = await asyncio.create_subprocess_shell(
        command,
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    stdout, stderr = await process.communicate(input=content)

    if process.returncode != 0:
        raise Exception(
            f"avrdude write failed with return code {process.returncode}: {stderr.decode()}")
    else:
        print(f"avrdude output: {stdout.decode()}")

    if file_type == 'hex':
        command = "avrdude -v -p atmega2560 -c rpi -U flash:v:-:i"
    elif file_type == 'elf':
        command = "avrdude -v -p atmega2560 -c rpi -U flash:v:-:e"
    else:
        raise Exception(f"Unsupported file type: {file_type}")

    process = await asyncio.create_subprocess_shell(
        command,
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    stdout, stderr = await process.communicate(input=content)

    if process.returncode != 0:
        raise Exception(
            f"avrdude verify failed with return code {process.returncode}: {stderr.decode()}")
    else:
        print(f"avrdude output: {stdout.decode()}")

    hal.enable_isp.set(False)
    lightControl()


async def uploadHandler(event: FileServiceEvent):
    if event["file_type"] == 'hex':
        await program(event["file_type"], event["content"])
    elif event["file_type"] == 'elf':
        await program(event["file_type"], event["content"])
    else:
        raise Exception(f"Unsupported file type: {event['file_type']}")


async def onProgramRequest(event: ProgramRequestEvent):
    global programming_service  # noqa: F824

    if event["program"]["type"] == "file":
        if event["program"]["name"].endswith(".hex"):
            await program('hex', event["program"]["content"])
        elif event["program"]["name"].endswith(".elf"):
            await program('elf', event["program"]["content"])
        else:
            programming_service.sendResponse({
                "success": False,
                "requestId": event["requestId"],
                "message": f"Unsupported file type: {event['program']['name']}"
            })
            raise Exception(
                f"Unsupported file type: {event['program']['name']}")
        programming_service.sendResponse({
            "success": True,
            "requestId": event["requestId"],
            "message": "Microcontroller was programmed successfully!"
        })
    else:
        programming_service.sendResponse({
            "success": False,
            "requestId": event["requestId"],
            "message": "Expected a file, but got a directory!"
        })


async def main_async():
    global hal, deviceHandler

    parser = argparse.ArgumentParser(
        prog="Crosslab Client",
        description="The Crosslab Client Application for the 3-axes-portal",
    )

    parser.add_argument(
        "-c", "--config", help="Path to the config file", default="/data/crosslab"
    )
    parser.add_argument(
        "--auth-token",
        help="Authentification Token to login",
        default=os.environ.get("CROSSLAB_CLI_TOKEN"),
    )
    parser.add_argument("--device-id", help="Device ID")
    parser.add_argument(
        "--url",
        help="URL of the CrossLab instance",
        default=os.environ.get("CROSSLAB_CLI_URL"),
    )
    args = parser.parse_args()

    auth_token: Optional[str] = None
    device_id: Optional[str] = None
    url: Optional[str] = None

    try:
        with open(args.config) as f:
            data = JSONDecoder().decode(f.read())
        auth_token = data["authToken"]
        device_id = data["deviceId"]
        url = data["url"]
    except FileNotFoundError:
        print(f"Warning: No config file at {args.config} found.")

    if args.auth_token is not None:
        auth_token = args.auth_token
    if args.device_id is not None:
        device_id = args.device_id
    if args.url is not None:
        url = args.url

    if auth_token is None:
        print("Error: No auth token provided.")
        exit(1)
    if device_id is None:
        print("Error: No device id provided.")
        exit(1)
    if url is None:
        print("Error: No url provided.")
        exit(1)

    hal = HAL()

    deviceHandler = DeviceHandler()
    deviceHandler.supportedConnectionTypes = ["webrtc", "websocket"]

    signal_service = ElectricalConnectionService("signals")
    signal_interface = ConstractableGPIOInterface(signal_names, "inout")
    signal_service.on("newInterface", newElectricalInterface)
    signal_service.addInterface(signal_interface)
    deviceHandler.add_service(signal_service)

    file_service = FileService__Consumer("firmware-upload")
    file_service.add_listener("file", uploadHandler)
    deviceHandler.add_service(file_service)

    programming_service = ProgrammingService__Producer("programming")
    programming_service.on("program:request", onProgramRequest)
    deviceHandler.add_service(programming_service)

    deviceHandler.on("connectionsChanged", lightControl)

    async with APIClient(url) as client:
        client.set_auth_token(auth_token)
        os.system("set_led_connected")

        deviceHandlerTask = asyncio.create_task(
            deviceHandler.connect(device_id, client)
        )

        await deviceHandlerTask

    exit(1)


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
