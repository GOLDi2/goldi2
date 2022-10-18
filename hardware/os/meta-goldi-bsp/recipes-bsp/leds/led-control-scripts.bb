SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

SRC_URI = " \
    file://set_led_connected \
    file://set_led_connecting \
    file://set_led_connection_lost \
    file://set_led_experiment \
    file://set_led_no_experiment \
    file://set_led_uploading \
"

do_install() {
    install -d ${D}/usr/bin/
    install -m 0755 ${WORKDIR}/set_led_connected ${D}/usr/bin/set_led_connected
    install -m 0755 ${WORKDIR}/set_led_connecting ${D}/usr/bin/set_led_connecting
    install -m 0755 ${WORKDIR}/set_led_connection_lost ${D}/usr/bin/set_led_connection_lost
    install -m 0755 ${WORKDIR}/set_led_experiment ${D}/usr/bin/set_led_experiment
    install -m 0755 ${WORKDIR}/set_led_no_experiment ${D}/usr/bin/set_led_no_experiment
    install -m 0755 ${WORKDIR}/set_led_uploading ${D}/usr/bin/set_led_uploading
}

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"