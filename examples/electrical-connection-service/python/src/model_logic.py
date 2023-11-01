from typing import Dict
from hal import HAL
from os import system, name
from crosslab.soa_services.electrical.signal_interfaces.gpio import GPIOInterface
from crosslab.soa_services.electrical.messages import State


def clear():
    if name == "nt":
        _ = system("cls")
    else:
        _ = system("clear")


def isHigh(value: State):
    return value in ["strongH", "weakH"]


def evaluateActuators(
    interfaces: Dict[str, GPIOInterface],
    hal: HAL,
):
    print("evaluating actuators")
    xMotorLeftInterface = interfaces.get("XMotorLeft", None)
    xMotorRightInterface = interfaces.get("XMotorRight", None)
    yMotorTopInterface = interfaces.get("YMotorTop", None)
    yMotorBottomInterface = interfaces.get("YMotorBottom", None)

    xMotorLeft = (
        xMotorLeftInterface.signalState
        if xMotorLeftInterface is not None
        else "strongL"
    )
    xMotorRight = (
        xMotorRightInterface.signalState
        if xMotorRightInterface is not None
        else "strongL"
    )
    yMotorTop = (
        yMotorTopInterface.signalState if yMotorTopInterface is not None else "strongL"
    )
    yMotorBottom = (
        yMotorBottomInterface.signalState
        if yMotorBottomInterface is not None
        else "strongL"
    )

    hal.XMotorLeft = isHigh(xMotorLeft)
    hal.XMotorRight = isHigh(xMotorRight)
    hal.YMotorBottom = isHigh(yMotorBottom)
    hal.YMotorTop = isHigh(yMotorTop)

    clear()
    if hal.XMotorLeft:
        hal.LimitXLeft.change(True)
        hal.LimitXRight.change(False)
        print("Current Direction: Left")
    elif hal.XMotorRight:
        hal.LimitXLeft.change(False)
        hal.LimitXRight.change(True)
        print("Current Direction: Right")
    elif hal.YMotorBottom:
        hal.LimitYBottom.change(True)
        hal.LimitYTop.change(False)
        print("Current Direction: Bottom")
    elif hal.YMotorTop:
        hal.LimitYBottom.change(False)
        hal.LimitYTop.change(True)
        print("Current Direction: Top")
    else:
        print("Current Direction: None")
