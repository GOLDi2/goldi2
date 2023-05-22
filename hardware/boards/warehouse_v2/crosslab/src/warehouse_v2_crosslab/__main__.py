#! /usr/bin/env python3

import argparse
import asyncio
from json import JSONDecoder
from typing import Dict, Optional
from warehouse_v2_crosslab.hal import HAL
from warehouse_v2_crosslab.model_logic import evaluateActuators
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
    "inductive",
    "z_top",
    "z_bottom",
    "y_inside",
    "y_outside",
    "x_right",
    "x_left",
    "x1",
    "x2",
    "x3",
    "x4",
    "x5",
    "x6",
    "x7",
    "x8",
    "x9",
    "x10",
    "z1",
    "z2",
    "z3",
    "z4",
    "z5",
]

actuators_names = [
    "XMotorLeft",
    "XMotorRight",
    "YMotorBack",
    "YMotorFront",
    "ZMotorBottom",
    "ZMotorTop",
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
        if name == "inductive":
            hal.inductive.on("change", setBool)
            value = hal.inductive.value()
        elif name == "z_top":
            hal.z_top.on("change", setBool)
            value = hal.z_top.value()
        elif name == "z_bottom":
            hal.z_bottom.on("change", setBool)
            value = hal.z_bottom.value()
        elif name == "y_inside":
            hal.y_inside.on("change", setBool)
            value = hal.y_inside.value()
        elif name == "y_outside":
            hal.y_outside.on("change", setBool)
            value = hal.y_outside.value()
        elif name == "x_right":
            hal.x_right.on("change", setBool)
            value = hal.x_right.value()
        elif name == "x_left":
            hal.x_left.on("change", setBool)
            value = hal.x_left.value()
        elif name == "x1":
            hal.x1.on("change", setBool)
            value = hal.x1.value()
        elif name == "x2":
            hal.x2.on("change", setBool)
            value = hal.x2.value()
        elif name == "x3":
            hal.x3.on("change", setBool)
            value = hal.x3.value()
        elif name == "x4":
            hal.x4.on("change", setBool)
            value = hal.x4.value()
        elif name == "x5":
            hal.x5.on("change", setBool)
            value = hal.x5.value()
        elif name == "x6":
            hal.x6.on("change", setBool)
            value = hal.x6.value()
        elif name == "x7":
            hal.x7.on("change", setBool)
            value = hal.x7.value()
        elif name == "x8":
            hal.x8.on("change", setBool)
            value = hal.x8.value()
        elif name == "x9":
            hal.x9.on("change", setBool)
            value = hal.x9.value()
        elif name == "x10":
            hal.x10.on("change", setBool)
            value = hal.x10.value()
        elif name == "z1":
            hal.z1.on("change", setBool)
            value = hal.z1.value()
        elif name == "z2":
            hal.z2.on("change", setBool)
            value = hal.z2.value()
        elif name == "z3":
            hal.z3.on("change", setBool)
            value = hal.z3.value()
        elif name == "z4":
            hal.z4.on("change", setBool)
            value = hal.z4.value()
        elif name == "z5":
            hal.z5.on("change", setBool)
            value = hal.z5.value()

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
    sensor_interface = ConstractableGPIOInterface(sensor_names)
    sensor_service.addInterface(sensor_interface)
    sensor_service.on("newInterface", newSensorInterface)
    deviceHandler.add_service(sensor_service)

    actuators_service = ElectricalConnectionService("actuators")
    actuators_interface = ConstractableGPIOInterface(actuators_names)
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
