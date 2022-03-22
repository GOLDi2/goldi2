SUMMARY = "Provides the GOLDi-Board-Test program"
HOMEPAGE = "https://gitlab.tu-ilmenau.de/pihe5617/goldi-board-test"
SRCREV = "${AUTOREV}"
SRC_URI = "git://git@gitlab.tu-ilmenau.de/pihe5617/goldi-board-test.git;protocol=ssh;branch=dev"
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://LICENSE;md5=f2c6e854b04f73c7caa9a9ea48b57f1e"
SRC_URI[sha256sum] = "354ec4faf8359290f187fff0c513702747a3e2a3823a259978239e05f4e780cd"
S = "${WORKDIR}/git"

DEPENDS = "bcm2835"
RDEPENDS_${PN} = "python3-core"

FILES_${PN} += " ${libdir}/python3.8/site-packages/goldi_test_cases"

inherit meson
