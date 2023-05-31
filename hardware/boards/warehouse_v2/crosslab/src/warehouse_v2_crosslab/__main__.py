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
    "shelf_x_1",
    "shelf_x_2",
    "shelf_x_3",
    "shelf_x_4",
    "shelf_x_5",
    "shelf_x_6",
    "shelf_x_7",
    "shelf_x_8",
    "shelf_x_9",
    "shelf_x_10",
    "shelf_z_1_below",
    "shelf_z_1_above",
    "shelf_z_2_below",
    "shelf_z_2_above",
    "shelf_z_3_below",
    "shelf_z_3_above",
    "shelf_z_4_below",
    "shelf_z_4_above",
    "shelf_z_5_below",
    "shelf_z_5_above",
]

actuators_names = [
    "XMotorLeft",
    "XMotorRight",
    "YMotorBack",
    "YMotorFront",
    "ZMotorBottom",
    "ZMotorTop",
    "SlowDrive",
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

def virtualXSensor(value: int, position: int):
    if value > 607 - 300 and value < 607 + 300 and position==0:
        return True
    if value > 1807 - 300 and value < 1807 + 300 and position==1:
        return True
    if value > 3007 - 300 and value < 3007 + 300 and position==2:
        return True
    if value > 4207 - 300 and value < 4207 + 300 and position==3:
        return True
    if value > 5407 - 300 and value < 5407 + 300 and position==4:
        return True
    if value > 6607 - 300 and value < 6607 + 300 and position==5:
        return True
    if value > 7807 - 300 and value < 7807 + 300 and position==6:
        return True
    if value > 9007 - 300 and value < 9007 + 300 and position==7:
        return True
    if value > 10207 - 300 and value < 10207 + 300 and position==8:
        return True
    if value > 11407 - 300 and value < 11407 + 300 and position==9:
        return True
    return False

def virtualZSensor(value: int, position: int):
    if value > 894 - 5000 and value < 894 - 50 and position==0:
        return True
    if value > 894 + 50 and value < 894 + 5000 and position==1:
        return True
    if value > 11324 - 5000 and value < 11324 - 50 and position==2:
        return True
    if value > 11324 + 50 and value < 11324 + 5000 and position==3:
        return True
    if value > 21754 - 5000 and value < 21754 - 50 and position==4:
        return True
    if value > 21754 + 50 and value < 21754 + 5000 and position==5:
        return True
    if value > 32184 - 5000 and value < 32184 - 50 and position==6:
        return True
    if value > 32184 + 50 and value < 32184 + 5000 and position==7:
        return True
    if value > 42614 - 5000 and value < 42614 - 50  and position==8:
        return True
    if value > 42614 + 50 and value < 42614 + 5000  and position==9:
        return True
    return False


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
        elif name == "shelf_x_1":
            hal.XEncoder.on("change", lambda value: setBool(virtualXSensor(value, 0)))
            value = virtualXSensor(hal.XEncoder.value(), 0)
        elif name == "shelf_x_2":
            hal.XEncoder.on("change", lambda value: setBool(virtualXSensor(value, 1)))
            value = virtualXSensor(hal.XEncoder.value(), 1)
        elif name == "shelf_x_3":
            hal.XEncoder.on("change", lambda value: setBool(virtualXSensor(value, 2)))
            value = virtualXSensor(hal.XEncoder.value(), 2)
        elif name == "shelf_x_4":
            hal.XEncoder.on("change", lambda value: setBool(virtualXSensor(value, 3)))
            value = virtualXSensor(hal.XEncoder.value(), 3)
        elif name == "shelf_x_5":
            hal.XEncoder.on("change", lambda value: setBool(virtualXSensor(value, 4)))
            value = virtualXSensor(hal.XEncoder.value(), 4)
        elif name == "shelf_x_6":
            hal.XEncoder.on("change", lambda value: setBool(virtualXSensor(value, 5)))
            value = virtualXSensor(hal.XEncoder.value(), 5)
        elif name == "shelf_x_7":
            hal.XEncoder.on("change", lambda value: setBool(virtualXSensor(value, 6)))
            value = virtualXSensor(hal.XEncoder.value(), 6)
        elif name == "shelf_x_8":
            hal.XEncoder.on("change", lambda value: setBool(virtualXSensor(value, 7)))
            value = virtualXSensor(hal.XEncoder.value(), 7)
        elif name == "shelf_x_9":
            hal.XEncoder.on("change", lambda value: setBool(virtualXSensor(value, 8)))
            value = virtualXSensor(hal.XEncoder.value(), 8)
        elif name == "shelf_x_10":
            hal.XEncoder.on("change", lambda value: setBool(virtualXSensor(value, 9)))
            value = virtualXSensor(hal.XEncoder.value(), 9)
        elif name == "shelf_z_1_below":
            hal.ZEncoder.on("change", lambda value: setBool(virtualZSensor(value, 0)))
            value = virtualZSensor(hal.XEncoder.value(), 0)
        elif name == "shelf_z_1_above":
            hal.ZEncoder.on("change", lambda value: setBool(virtualZSensor(value, 1)))
            value = virtualZSensor(hal.XEncoder.value(), 1)
        elif name == "shelf_z_2_below":
            hal.ZEncoder.on("change", lambda value: setBool(virtualZSensor(value, 2)))
            value = virtualZSensor(hal.XEncoder.value(), 2)
        elif name == "shelf_z_2_above":
            hal.ZEncoder.on("change", lambda value: setBool(virtualZSensor(value, 3)))
            value = virtualZSensor(hal.XEncoder.value(), 3)
        elif name == "shelf_z_3_below":
            hal.ZEncoder.on("change", lambda value: setBool(virtualZSensor(value, 4)))
            value = virtualZSensor(hal.XEncoder.value(), 4)
        elif name == "shelf_z_3_above":
            hal.ZEncoder.on("change", lambda value: setBool(virtualZSensor(value, 5)))
            value = virtualZSensor(hal.XEncoder.value(), 5)
        elif name == "shelf_z_4_below":
            hal.ZEncoder.on("change", lambda value: setBool(virtualZSensor(value, 6)))
            value = virtualZSensor(hal.XEncoder.value(), 6)
        elif name == "shelf_z_4_above":
            hal.ZEncoder.on("change", lambda value: setBool(virtualZSensor(value, 7)))
            value = virtualZSensor(hal.XEncoder.value(), 7)
        elif name == "shelf_z_5_below":
            hal.ZEncoder.on("change", lambda value: setBool(virtualZSensor(value, 8)))
            value = virtualZSensor(hal.XEncoder.value(), 8)
        elif name == "shelf_z_5_above":
            hal.ZEncoder.on("change", lambda value: setBool(virtualZSensor(value, 9)))
            value = virtualZSensor(hal.XEncoder.value(), 9)

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

    await hal.init_sequence()


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
