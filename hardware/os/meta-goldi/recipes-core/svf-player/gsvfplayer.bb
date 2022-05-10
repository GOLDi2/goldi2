SUMMARY = "Provides the goldi-svf-player"
HOMEPAGE = "https://github.com/lassertos/goldi-svf-player"
SRCREV = "${AUTOREV}"
SRC_URI = "git://git@github.com/lassertos/goldi-svf-player.git;protocol=ssh"
LICENSE = "LGPLv2.1"
LIC_FILES_CHKSUM = "file://COPYING;md5=d32239bcb673463ab874e80d47fae504"
SRC_URI[sha256sum] = "354ec4faf8359290f187fff0c513702747a3e2a3823a259978239e05f4e780cd"
S = "${WORKDIR}/git"

DEPENDS = "bcm2835"

inherit autotools
