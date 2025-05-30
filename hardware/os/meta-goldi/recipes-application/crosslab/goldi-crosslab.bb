SUMMARY = "Python Goldi Crosslab"

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

MULTIMACH_TARGET_SYS = "${MACHINE_VARIANT}-${PACKAGE_ARCH}${TARGET_VENDOR}-${TARGET_OS}"

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/hardware/boards/${MACHINE_VARIANT}/crosslab/dist/python-latest.tar.gz \
"

PV = "${MACHINE_VERSION}"

S = "${WORKDIR}"

do_compile:prepend() {
    cd ${S}
    mv *crosslab-* goldi-crosslab
}

PEP517_SOURCE_PATH = "${WORKDIR}/goldi-crosslab"

RDEPENDS:${PN} = "python3 python3-crosslab-api-client python3-crosslab-soa-client python3-spi-driver python3-crosslab-soa-service-electrical python3-crosslab-soa-service-webcam set-led-power-service led-control-scripts gstreamer1.0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad"

inherit python_setuptools_build_meta
