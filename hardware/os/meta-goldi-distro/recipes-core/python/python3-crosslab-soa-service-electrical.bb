SUMMARY = "Python Goldi Client"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/clients/soa_services/electricalConnection/python/dist/crosslab_soa_service_electrical-0.0.1.tar.gz \
"

S = "${WORKDIR}/crosslab_soa_service_electrical-0.0.1"

RDEPENDS:${PN} = "python3-crosslab-soa-client"

inherit setuptools3
