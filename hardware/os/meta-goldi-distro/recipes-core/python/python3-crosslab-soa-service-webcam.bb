SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/crosslab/clients/soa_services/webcam/python/dist/python-latest.tar.gz \
"

S = "${WORKDIR}"

do_compile:prepend() {
    cd ${S}
    mv crosslab_soa_service_webcam-* crosslab_soa_service_webcam
}

PEP517_SOURCE_PATH = "${WORKDIR}/crosslab_soa_service_webcam"

RDEPENDS:${PN} = "python3-crosslab-soa-client"

inherit python_setuptools_build_meta
