from typing import Callable, Dict

from axis_portal_v1_crosslab.hal import HAL
from crosslab.soa_services.electrical.messages import State
from crosslab.soa_services.electrical.signal_interfaces.gpio import \
    GPIOInterface


def isHigh(value: State):
    return value in ["strongH", "weakH"]


def evaluateActuators(
    interfaces: Dict[str, GPIOInterface],
    hal: HAL,
    panic: Callable[[str], None],
    userError: Callable[[str], None],
):
    xMotorLeftInterface = interfaces.get("XMotorLeft", None)
    xMotorRightInterface = interfaces.get("XMotorRight", None)
    yMotorBackInterface = interfaces.get("YMotorBack", None)
    yMotorFrontInterface = interfaces.get("YMotorFront", None)
    zMotorBottomInterface = interfaces.get("ZMotorBottom", None)
    zMotorTopInterface = interfaces.get("ZMotorTop", None)
    magnetInterface = interfaces.get("Magnet", None)

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
    yMotorBack = (
        yMotorBackInterface.signalState
        if yMotorBackInterface is not None
        else "strongL"
    )
    yMotorFront = (
        yMotorFrontInterface.signalState
        if yMotorFrontInterface is not None
        else "strongL"
    )
    zMotorBottom = (
        zMotorBottomInterface.signalState
        if zMotorBottomInterface is not None
        else "strongL"
    )
    zMotorTop = (
        zMotorTopInterface.signalState if zMotorTopInterface is not None else "strongL"
    )
    magnet = magnetInterface.signalState if magnetInterface is not None else "strongL"

    if isHigh(xMotorLeft) and isHigh(xMotorRight):
        userError("XMotorLeft and XMotorRight are both high")
        hal.XMotor.set(0)
    elif isHigh(xMotorLeft):
        hal.XMotor.set(255)
    elif isHigh(xMotorRight):
        hal.XMotor.set(-255)
    else:
        hal.XMotor.set(0)

    if isHigh(yMotorBack) and isHigh(yMotorFront):
        userError("YMotorBack and YMotorFront are both high")
        hal.YMotor.set(0)
    elif isHigh(yMotorBack):
        hal.YMotor.set(-255)
    elif isHigh(yMotorFront):
        hal.YMotor.set(255)
    else:
        hal.YMotor.set(0)

    if isHigh(zMotorBottom) and isHigh(zMotorTop):
        userError("ZMotorBottom and ZMotorTop are both high")
        hal.ZMotor.set(0)
    elif isHigh(zMotorBottom):
        hal.ZMotor.set(-255)
    elif isHigh(zMotorTop):
        hal.ZMotor.set(255)
    else:
        hal.ZMotor.set(0)

    if isHigh(magnet):
        hal.Magnet.set(True)
    else:
        hal.Magnet.set(False)
