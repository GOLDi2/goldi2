FILESEXTRAPATHS:prepend := "${THISDIR}/${PN}:"

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "wpa_supplicant@wlan0.service"


SRC_URI:append = "\
    file://wpa_supplicant-wlan0.conf \
"

do_install:append() {
    install -d ${D}/etc/wpa_supplicant
    ln -s /data/network-config/wpa_supplicant-wlan0.conf ${D}/etc/wpa_supplicant/wpa_supplicant-wlan0.conf
    install -D -m 0644 ${WORKDIR}/wpa_supplicant-wlan0.conf ${D}/data-factory/network-config/wpa_supplicant-wlan0.conf
}

FILES:${PN}:append = " \
    /data-factory/network-config/wpa_supplicant-wlan0.conf \
    /etc/wpa_supplicant/wpa_supplicant-wlan0.conf \
"