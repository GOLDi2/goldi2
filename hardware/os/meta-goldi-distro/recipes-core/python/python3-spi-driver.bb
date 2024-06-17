SUMMARY = "Python SPI Driver for the goldi1 hardware"
LICENSE = "CLOSED"
LIC_FILES_CHKSUM = ""

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/hardware/common/spi-driver/dist/spi_driver-0.0.1.tar.gz \
"

PV = "${MACHINE_VERSION}"

S = "${WORKDIR}/spi_driver-0.0.1"

RDEPENDS:${PN} = "python3-spidev python3-pyee"

inherit python_setuptools_build_meta
