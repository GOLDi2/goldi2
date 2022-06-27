SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

PV = "1.0+git${SRCPV}"

SRC_URI = "git://git@gitlab.tu-ilmenau.de/FakIA/fachgebiet-iks/goldi/goldi2/python_client.git;protocol=ssh;branch=master"
SRCREV = "7a2b4046182e28be7eb5880393383b451e06cf77"

S = "${WORKDIR}/git"

RDEPENDS:${PN} = "python3-aiohttp python3-aiortc"

inherit setuptools3
