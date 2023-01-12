SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
        file://${GIT_DIR}/clients/api/python/dist/crosslab_api_client-0.0.1.tar.gz \
"

S = "${WORKDIR}/crosslab_api_client-0.0.1"

RDEPENDS:${PN} = "python3-aiohttp python3-dateutil"

inherit setuptools3
