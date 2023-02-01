#! /usr/bin/env python3

import argparse
import asyncio
from functools import partial
from json import JSONDecoder
from typing import Dict, Optional
from io_board_crosslab.hal import HAL
from spi_driver import SpiRegisters
from spi_driver.modules import GPIO
import os

from crosslab.api_client import APIClient
from crosslab.soa_client.device_handler import DeviceHandler
from crosslab.soa_services.electrical import ElectricalConnectionService
from crosslab.soa_services.electrical.signal_interfaces.gpio import (
    GPIOInterface,
    ConstractableGPIOInterface,
)
from crosslab.soa_services.electrical.schema import State, Direction

signal_names = [
    *["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8"],
    *["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8"],
    *["C1", "C2", "C3", "C4", "C5", "C6", "C7", "C8"],
    *["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8"],
    *["E1", "E2", "E3", "E4", "E5", "E6", "E7", "E8"],
    *["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"],
    *["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8"],
    *["H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8"],
]

interfaces: Dict[str, GPIOInterface] = dict()
hal: HAL


def signal_changed(name: str, value: bool):
    interface = interfaces.get(name, None)
    if interface is not None and interface.configuration.direction in [
        Direction.INOUT,
        Direction.OUT,
    ]:
        interface.changeDriver(State.STRONG_H if value else State.STRONG_L)


def newInterface(interface):
    if isinstance(interface, GPIOInterface):
        name: str = interface.configuration.signals.gpio
        isInput = interface.configuration.direction in [Direction.INOUT, Direction.IN]
        isOutput = interface.configuration.direction in [Direction.INOUT, Direction.OUT]

        assert (isInput and isOutput) is False  # Don't support INOUT

        index = signal_names.index(name)
        interfaces[name] = interface

        hal.setSignal(name, State.HIGH_Z)

        if isOutput:
            interface.changeDriver(
                State.STRONG_H if hal.getSignal(name) else State.STRONG_H
            )
        if isInput:
            interface.on("signalChange", partial(hal.setSignal, name))


async def main():
    global hal

    parser = argparse.ArgumentParser(
        prog="Crosslab Client",
        description="The Crosslab Client Application for the io-board",
    )

    parser.add_argument('-c', '--config', help='Path to the config file', default="/data/crosslab")
    parser.add_argument('--auth-token', help='Authentification Token to login', default=os.environ.get('CROSSLAB_CLI_TOKEN'))
    parser.add_argument('--device-id', help='Device ID')
    parser.add_argument('--url', help='URL of the CrossLab instance', default=os.environ.get('CROSSLAB_CLI_URL'))
    parser.add_argument('--virtual', help='Dont make any hardware outputs', action='store_true')
    args = parser.parse_args()

    # chek if commandline option --virtual is set

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

    hal = HAL(signal_names, args.virtual)

    deviceHandler = DeviceHandler()

    signal_service = ElectricalConnectionService("pins")
    signal_interface = ConstractableGPIOInterface(signal_names)
    signal_service.addInterface(signal_interface)
    signal_service.on("newInterface", newInterface)
    deviceHandler.add_service(signal_service)

    async with APIClient(url) as client:
        client.set_auth_token(auth_token)
        os.system("set_led_connected")
        await deviceHandler.connect(device_id, client)


asyncio.run(main())
