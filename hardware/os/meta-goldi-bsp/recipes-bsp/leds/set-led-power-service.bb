SUMMARY = "Enable power LED"

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    file://set_led_power.service \
"

RDEPENDS:${PN} = "led-control-scripts"

do_install() {
    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/set_led_power.service ${D}/${systemd_system_unitdir}

    sed -i 's/crosslab_client/'"crosslab-${MACHINE_VARIANT}"'/' ${D}/${systemd_system_unitdir}/set_led_power.service
}

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "set_led_power.service"

FILES:${PN} = " \
    ${systemd_system_unitdir}/set_led_power.service \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"