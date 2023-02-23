SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/clients/soa/python/dist/crosslab_soa_client-0.0.1.tar.gz \
"

S = "${WORKDIR}/crosslab_soa_client-0.0.1"

RDEPENDS:${PN} = "python3-crosslab-api-client python3-crosslab-aiortc"

inherit setuptools3
