SUMMARY = "Provides a SVF-Player"
HOMEPAGE = "https://gitlab.tu-ilmenau.de/FakIA/fachgebiet-iks/goldi/goldi2/hardware/svf-player"
SRCREV = "6abaae4b0d99e0f879a16e0d72a89866f9b91b5b"
SRC_URI = "git://gitlab.tu-ilmenau.de/FakIA/fachgebiet-iks/goldi/goldi2/hardware/svf-player.git;protocol=https;user=token:${GITLAB_TOKEN}"
LICENSE = "LGPLv2.1"
LIC_FILES_CHKSUM = "file://LICENSE;md5=f2c6e854b04f73c7caa9a9ea48b57f1e"
SRC_URI[sha256sum] = "354ec4faf8359290f187fff0c513702747a3e2a3823a259978239e05f4e780cd"
S = "${WORKDIR}/git"

DEPENDS = "bcm2835 bison-native flex"

inherit meson
