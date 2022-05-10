SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

PV = "1.0+git${SRCPV}"

SRC_URI = "git://git@gitlab.tu-ilmenau.de/FakIA/fachgebiet-iks/goldi/goldi2/python_client.git;protocol=ssh;branch=master"
SRCREV = "4288f3a9531759a87ca52082cf390f9739b36b3b"

S = "${WORKDIR}/git"

RDEPENDS:${PN} = "python3-aiohttp python3-aiortc"

inherit setuptools3
