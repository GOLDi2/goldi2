SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/crosslab/clients/soa_services/file/python/dist/python-latest.tar.gz \
"

PV = "${MACHINE_VERSION}"

S = "${WORKDIR}"

do_compile:prepend() {
    cd ${S}
    mv crosslab_soa_service_file-* crosslab_soa_service_file
}

PEP517_SOURCE_PATH = "${WORKDIR}/crosslab_soa_service_file"

RDEPENDS:${PN} = "python3-crosslab-soa-client"

inherit python_setuptools_build_meta
