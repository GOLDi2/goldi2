#! /usr/bin/env python3

import argparse
import asyncio
from json import JSONDecoder
from typing import Dict, Optional
from axis_portal_v2_crosslab.hal import HAL
from axis_portal_v2_crosslab.model_logic import evaluateActuators
import os

from crosslab.api_client.improved_client import APIClient
from crosslab.soa_client.device_handler import DeviceHandler
from crosslab.soa_services.webcam import WebcamService__Producer, GstTrack
from crosslab.soa_services.electrical import ElectricalConnectionService
from crosslab.soa_services.electrical.signal_interfaces.gpio import (
    GPIOInterface,
    ConstractableGPIOInterface,
)

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
    global hal
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
    global hal
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

    await asyncio.sleep(0.2)

    # Init Model:
    # hal.XMotor.set(-50)
    # hal.YMotor.set(-50)
    # hal.ZMotor.set(150)
    # while hal.LimitXLeft.value():
    #    await asyncio.sleep(0.1)
    # while hal.LimitYBack.value():
    #    await asyncio.sleep(0.1)
    # hal.XMotor.set(50)
    # hal.ZMotor.set(50)
    # while not hal.LimitXLeft.value():
    #    await asyncio.sleep(0.1)
    # while not hal.LimitYBack.value():
    #    await asyncio.sleep(0.1)
    hal.XMotor.set(0)
    hal.YMotor.set(0)
    hal.ZMotor.set(0)

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

    webcamService = WebcamService__Producer(
        GstTrack(
            (" ! ").join(
                [
                    "v4l2src device=/dev/video0",
                    "'image/jpeg,width=640,height=480,framerate=30/1'",
                    "v4l2jpegdec",
                    "v4l2h264enc",
                    "'video/x-h264,level=(string)4'",
                ]
            ),
        ),
        "webcam",
    )
    deviceHandler.add_service(webcamService)

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
