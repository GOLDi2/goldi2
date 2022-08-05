SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    git://token:${GITLAB_TOKEN}@gitlab.tu-ilmenau.de/FakIA/fachgebiet-iks/goldi/goldi2/hardware/applications.git;protocol=https;branch=master \
    file://load-fpga-firmware.service \
"
SRCREV = "647e328dcadeb0e25530dc621a984c5cdaddcef3"
PV = "1.0.0+git${SRCPV}"

S = "${WORKDIR}/git/gantry"
do_compile(){
    cd ${S}
    npm run compile
}

do_install() {
    install -d ${D}/lib/firmware/lattice/
    cp ${S}/dist/bitstream.svf ${D}/lib/firmware/lattice/firmware.svf

    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/load-fpga-firmware.service ${D}/${systemd_system_unitdir}
}

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "load-fpga-firmware.service"

FILES:${PN} = " \
    ${systemd_system_unitdir}/load-fpga-firmware.service \
    /lib/firmware/lattice/firmware.svf \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"