SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

PV = "1.0+git${SRCPV}"

SRC_URI = "git://gitlab.tu-ilmenau.de/FakIA/fachgebiet-iks/goldi/goldi2/python_client.git;protocol=https;branch=master;user=token:${GITLAB_TOKEN}"
SRCREV = "04c79aceec500b16c7251ed210d2b3ccff7a0394"

S = "${WORKDIR}/git"

RDEPENDS:${PN} = "python3-aiohttp python3-aiortc"

inherit setuptools3
