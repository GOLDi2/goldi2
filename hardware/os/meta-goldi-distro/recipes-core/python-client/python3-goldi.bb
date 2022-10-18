SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

PV = "1.0+git${SRCPV}"

SRC_URI = "git://gitlab.tu-ilmenau.de/FakIA/fachgebiet-iks/goldi/goldi2/python_client.git;protocol=https;branch=master;user=token:${GITLAB_TOKEN}"
SRCREV = "94c44a5b6a9328c4672bf064846858418f490133"

S = "${WORKDIR}/git"

RDEPENDS:${PN} = "python3-aiohttp python3-aiortc"

inherit setuptools3
