#! /usr/bin/env python3

import argparse
import asyncio
import os
from json import JSONDecoder
from typing import Dict, Optional

from axis_portal_v1_crosslab.hal import HAL
from axis_portal_v1_crosslab.model_logic import evaluateActuators
from crosslab.api_client.improved_client import APIClient
from crosslab.soa_client.device_handler import DeviceHandler
from crosslab.soa_services.electrical import ElectricalConnectionService
from crosslab.soa_services.electrical.signal_interfaces.gpio import (
    ConstractableGPIOInterface, GPIOInterface)
from crosslab.soa_services.webcam import WebcamService__Producer, WebcamTrack

interfaces: Dict[str, GPIOInterface] = dict()
hal: HAL

sensor_names = [
    "LimitXLeft",
    "LimitXRight",
    "LimitYBack",
    "LimitYFront",
    "LimitZBottom",
    "LimitZTop",
    "Proximity",
]

actuators_names = [
    "XMotorLeft",
    "XMotorRight",
    "YMotorBack",
    "YMotorFront",
    "ZMotorBottom",
    "ZMotorTop",
    "Magnet",
]


def panic(message: str):
    pass


def userError(message: str):
    pass


def newActuatorInterface(interface):
    global hal  # noqa: F824
    if isinstance(interface, GPIOInterface):
        name: str = interface.configuration["signals"]["gpio"]
        isInput = interface.configuration.get("direction", "in") in ["inout", "in"]
        isOutput = interface.configuration.get("direction", "in") in ["inout", "out"]

        if name not in actuators_names:
            panic("Actuator interface must be named like a actuator")

        if not isInput or isOutput:
            panic("Actuator interface must be input only")

        interfaces[name] = interface

        interface.on(
            "signalChange",
            lambda event: evaluateActuators(interfaces, hal, panic, userError),
        )


def newSensorInterface(interface):
    global hal  # noqa: F824
    if isinstance(interface, GPIOInterface):
        name: str = interface.configuration["signals"]["gpio"]
        isInput = interface.configuration.get("direction", "in") in ["inout", "in"]
        isOutput = interface.configuration.get("direction", "in") in ["inout", "out"]

        if name not in sensor_names:
            panic("Sensor interface must be named like a sensor")

        if not isOutput or isInput:
            panic("Sensor interface must be output only")

        interfaces[name] = interface

        def setBool(value: bool):
            interface.changeDriver("strongH" if value else "strongL")

        value = False
        if name == "LimitXLeft":
            hal.LimitXLeft.on("change", setBool)
            value = hal.LimitXLeft.value()
        elif name == "LimitXRight":
            hal.LimitXRight.on("change", setBool)
            value = hal.LimitXRight.value()
        elif name == "LimitYBack":
            hal.LimitYBack.on("change", setBool)
            value = hal.LimitYBack.value()
        elif name == "LimitYFront":
            hal.LimitYFront.on("change", setBool)
            value = hal.LimitYFront.value()
        elif name == "LimitZBottom":
            hal.LimitZBottom.on("change", setBool)
            value = hal.LimitZBottom.value()
        elif name == "LimitZTop":
            hal.LimitZTop.on("change", setBool)
            value = hal.LimitZTop.value()
        elif name == "Proximity":
            hal.Proximity.on("change", setBool)
            value = hal.Proximity.value()

        interface.changeDriver("strongH" if value else "strongL")


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

    sensor_service = ElectricalConnectionService("sensors")
    sensor_interface = ConstractableGPIOInterface(sensor_names, "out")
    sensor_service.addInterface(sensor_interface)
    sensor_service.on("newInterface", newSensorInterface)
    deviceHandler.add_service(sensor_service)

    actuators_service = ElectricalConnectionService("actuators")
    actuators_interface = ConstractableGPIOInterface(actuators_names, "in")
    actuators_service.addInterface(actuators_interface)
    actuators_service.on("newInterface", newActuatorInterface)
    deviceHandler.add_service(actuators_service)

    webcamService = WebcamService__Producer(WebcamTrack(), "webcam")
    deviceHandler.add_service(webcamService)

    def lightControl():
        if len(
            [
                c
                for c in deviceHandler._connections
                if deviceHandler._connections[c].state == "connected"
            ]
        ):
            hal.Light.set(True)
        else:
            hal.Light.set(False)

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
