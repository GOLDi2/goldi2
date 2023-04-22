#! /usr/bin/env python3

import argparse
import asyncio
from functools import partial
from json import JSONDecoder
from typing import Dict, Optional
from axis_portal_v1_crosslab.hal import HAL
from spi_driver import SpiRegisters
from spi_driver.modules import GPIO
import os

from crosslab.api_client.improved_client import APIClient
from crosslab.soa_client.device_handler import DeviceHandler
from crosslab.soa_services.webcam import WebcamService__Producer, GstTrack
from crosslab.soa_services.electrical import ElectricalConnectionService
from crosslab.soa_services.electrical.signal_interfaces.gpio import (
    GPIOInterface,
    ConstractableGPIOInterface,
)

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
]

hal_names = actuators_names + ["reserved"] * 2 + sensor_names + ["reserved"]

interfaces: Dict[str, GPIOInterface] = dict()
hal: HAL


def signal_changed(name: str, value: bool):
    interface = interfaces.get(name, None)
    if interface is not None and interface.configuration.get("direction", "in") in [
        "inout",
        "out",
    ]:
        interface.changeDriver("strongH" if value else "strongL")


def newActuatorInterface(interface):
    if isinstance(interface, GPIOInterface):
        name: str = interface.configuration["signals"]["gpio"]
        isInput = interface.configuration.get("direction", "in") in ["inout", "in"]
        isOutput = interface.configuration.get("direction", "in") in ["inout", "out"]

        assert isInput and not isOutput

        interfaces[name] = interface

        hal.setSignal(name, "highZ")

        interface.on("signalChange", lambda event: hal.setSignal(name, event.state))


def newSensorInterface(interface):
    if isinstance(interface, GPIOInterface):
        name: str = interface.configuration["signals"]["gpio"]
        isInput = interface.configuration.get("direction", "in") in ["inout", "in"]
        isOutput = interface.configuration.get("direction", "in") in ["inout", "out"]

        assert not isInput and isOutput

        interfaces[name] = interface

        hal.setSignal(name, "highZ")

        interface.changeDriver("strongH" if hal.getSignal(name) else "strongL")


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
    #parser.add_argument(
    #    "--virtual", help="Dont make any hardware outputs", action="store_true"
    #)
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

    hal = HAL(hal_names)
    hal.addSignalChangedHandler(signal_changed)

    deviceHandler = DeviceHandler()

    sensor_service = ElectricalConnectionService("sensors")
    sensor_interface = ConstractableGPIOInterface(sensor_names)
    sensor_service.addInterface(sensor_interface)
    sensor_service.on("newInterface", newSensorInterface)
    deviceHandler.add_service(sensor_service)

    actuators_service = ElectricalConnectionService("actuators")
    actuators_interface = ConstractableGPIOInterface(actuators_names)
    actuators_service.addInterface(actuators_interface)
    actuators_service.on("newInterface", newActuatorInterface)
    deviceHandler.add_service(actuators_service)

    webcamService=WebcamService__Producer(GstTrack("v4l2src device=/dev/video0 ! 'image/jpeg,width=640,height=480,framerate=30/1' ! v4l2jpegdec ! v4l2h264enc ! 'video/x-h264,level=(string)4'"), "webcam");
    deviceHandler.add_service(webcamService);

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
