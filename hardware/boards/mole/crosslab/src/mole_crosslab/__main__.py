#! /usr/bin/env python3

import argparse
import asyncio
from json import JSONDecoder
from typing import Dict, Optional
from mole_crosslab.hal import HAL
import os

from crosslab.api_client.improved_client import APIClient
from crosslab.soa_client.device_handler import DeviceHandler
from crosslab.soa_services.electrical import ElectricalConnectionService
from crosslab.soa_services.electrical.signal_interfaces.gpio import (
    GPIOInterface,
    ConstractableGPIOInterface,
)

# import logging
# logging.basicConfig(level='DEBUG')

interfaces: Dict[str, GPIOInterface] = dict()
hal: HAL

signal_names = [
    *["D00", "D01", "D02", "D03", "D04", "D05", "D06", "D07"],
    *["D08", "D09", "D10", "D11", "D12", "D13", "D14", "D15"],
    *["D16", "D17", "D18", "D19", "D20", "D21", "D22", "D23"],
    *["D24", "D25", "D26", "D27", "D28", "D29", "D30", "D31"],
    *["D32", "D33", "D34", "D35", "D36", "D37", "D38", "D39"],
    *["D40", "D41", "D42", "D43", "D44", "D45", "D46", "D47"],
    *["D48", "D49", "D50", "D51", "D52", "D53", "D54", "D55"],
    *["D56", "D57", "D58", "D59", "D60", "D61", "D62", "D63"],
]


def panic(message: str):
    pass


def userError(message: str):
    pass


def newSensorInterface(interface):
    global hal

    if isinstance(interface, GPIOInterface):
        name: str = interface.configuration["signals"]["gpio"]
        isInput = interface.configuration.get("direction", "in") in ["inout", "in"]
        isOutput = interface.configuration.get("direction", "in") in ["inout", "out"]

        if name not in signal_names:
            panic("Signal interface must be named like a sensor")

        if isOutput and isInput:
            panic("Signal interface can not be input and output")

        interfaceIdx = signal_names.index(name)
        interfaces[name] = interface

        if isInput:
            hal.gpio[interfaceIdx].set(False)
            hal.gpio[interfaceIdx].setOutput(True)
            interface.on(
                "signalChange",
                lambda event: hal.gpio[interfaceIdx].set(
                    event.state in ["strongH", "weakH"]
                ),
            )

        if isOutput:
            hal.gpio[interfaceIdx].setOutput(False)
            hal.gpio[interfaceIdx].on(
                "change",
                lambda value: interface.changeDriver("strongH" if value else "strongL"),
            )
            interface.changeDriver(
                "strongH" if hal.gpio[interfaceIdx].value() else "strongL"
            )


async def main_async():
    global hal

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

    signal_service = ElectricalConnectionService("signals")
    signal_gpio_interface = ConstractableGPIOInterface(signal_names, "inout")
    signal_service.addInterface(signal_gpio_interface)
    signal_service.on("newInterface", newSensorInterface)
    deviceHandler.add_service(signal_service)

    async with APIClient(url) as client:
        client.set_auth_token(auth_token)
        os.system("set_led_connected")

        deviceHandlerTask = asyncio.create_task(
            deviceHandler.connect(device_id, client)
        )

        await deviceHandlerTask


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
