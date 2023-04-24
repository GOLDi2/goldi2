SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
        file://${GIT_DIR}/crosslab/clients/api/python/dist/python-latest.tar.gz \
"

S = "${WORKDIR}"

do_compile:prepend() {
    cd ${S}
    mv crosslab_api_client-* crosslab_api_client
}

PEP517_SOURCE_PATH = "${WORKDIR}/crosslab_api_client"

RDEPENDS:${PN} = "python3-aiohttp python3-dateutil python3-typing-extensions"

inherit python_setuptools_build_meta
