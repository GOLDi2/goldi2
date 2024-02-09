#! /usr/bin/env python3

import asyncio
from json import JSONDecoder
from typing import Dict, Optional
from hal import HAL, hal
from model_logic import evaluateActuators

from crosslab.api_client.improved_client import APIClient
from crosslab.soa_client.device_handler import DeviceHandler
from crosslab.soa_services.electrical import ElectricalConnectionService
from crosslab.soa_services.electrical.signal_interfaces.gpio import (
    GPIOInterface,
    ConstractableGPIOInterface,
)

interfaces: Dict[str, GPIOInterface] = dict()

sensor_names = [
    "LimitXLeft",
    "LimitXRight",
    "LimitYBottom",
    "LimitYTop",
]

actuators_names = [
    "XMotorLeft",
    "XMotorRight",
    "YMotorBottom",
    "YMotorTop",
]


def newActuatorInterface(interface):
    global hal
    if isinstance(interface, GPIOInterface):
        name: str = interface.configuration["signals"]["gpio"]

        interfaces[name] = interface

        interface.on(
            "signalChange",
            lambda event: evaluateActuators(interfaces, hal),
        )


def newSensorInterface(interface):
    global hal
    if isinstance(interface, GPIOInterface):
        name: str = interface.configuration["signals"]["gpio"]

        interfaces[name] = interface

        def setBool(value: bool):
            interface.changeDriver("strongH" if value else "strongL")

        value = False
        if name == "LimitXLeft":
            hal.LimitXLeft.onChange = setBool
            value = hal.LimitXLeft.value
        elif name == "LimitXRight":
            hal.LimitXRight.onChange = setBool
            value = hal.LimitXRight.value
        elif name == "LimitYBottom":
            hal.LimitYBottom.onChange = setBool
            value = hal.LimitYBottom.value
        elif name == "LimitYTop":
            hal.LimitYTop.onChange = setBool
            value = hal.LimitYTop.value

        interface.changeDriver("strongH" if value else "strongL")


async def main_async():
    global hal

    auth_token: Optional[str] = None
    device_id: Optional[str] = None
    url: Optional[str] = None

    try:
        with open("config.test") as f:
            data = JSONDecoder().decode(f.read())
        auth_token = data["authToken"]
        device_id = data["deviceId"]
        url = data["url"]
    except FileNotFoundError:
        print(f"Warning: No config file at 'config.test' found.")

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

    async with APIClient(url) as client:
        client.set_auth_token(auth_token)

        deviceHandlerTask = asyncio.create_task(
            deviceHandler.connect(device_id, client)
        )

        await deviceHandlerTask


def main():
    asyncio.run(main_async())


if __name__ == "__main__":
    main()
