SUMMARY = "Python Goldi Crosslab"

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

MULTIMACH_TARGET_SYS = "${MACHINE_VARIANT}-${PACKAGE_ARCH}${TARGET_VENDOR}-${TARGET_OS}"

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/hardware/boards/${MACHINE_VARIANT}/crosslab/dist/io_board_crosslab-0.0.1.tar.gz \
"

RDEPENDS:${PN} = "python3 python3-crosslab-api-client python3-crosslab-soa-client python3-spi-driver python3-crosslab-soa-service-electrical led-control-scripts gstreamer1.0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad"

S = "${WORKDIR}/io_board_crosslab-0.0.1"
inherit setuptools3
