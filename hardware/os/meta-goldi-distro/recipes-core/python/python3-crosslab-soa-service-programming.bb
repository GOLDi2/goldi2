SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/crosslab/clients/soa_services/programming/python/dist/python-latest.tar.gz \
"

PV = "${MACHINE_VERSION}"

S = "${WORKDIR}"

do_compile:prepend() {
    cd ${S}
    mv crosslab_soa_service_programming-* crosslab_soa_service_programming
}

PEP517_SOURCE_PATH = "${WORKDIR}/crosslab_soa_service_programming"

RDEPENDS:${PN} = "python3-crosslab-soa-client"

inherit python_setuptools_build_meta
