SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/crosslab/clients/soa_services/electricalConnection/python/dist/python-latest.tar.gz \
"

S = "${WORKDIR}"

do_compile:prepend() {
    cd ${S}
    mv crosslab_soa_service_electrical-* crosslab_soa_service_electrical
}

PEP517_SOURCE_PATH = "${WORKDIR}/crosslab_soa_service_electrical"

RDEPENDS:${PN} = "python3-crosslab-soa-client"

inherit python_setuptools_build_meta
