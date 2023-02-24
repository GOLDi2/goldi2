SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/crosslab/clients/soa/python/dist/python-latest.tar.gz \
"

S = "${WORKDIR}"

do_compile:prepend() {
    cd ${S}
    mv crosslab_soa_client* crosslab_soa_client
}

DISTUTILS_SETUP_PATH = "${WORKDIR}/crosslab_soa_client"

RDEPENDS:${PN} = "python3-crosslab-api-client python3-crosslab-aiortc"

inherit setuptools3
