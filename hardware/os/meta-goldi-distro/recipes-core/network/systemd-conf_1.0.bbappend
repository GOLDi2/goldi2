FILESEXTRAPATHS:prepend := "${THISDIR}/files:"

SRC_URI:append = "\
    file://wireless.network \
    file://wireless-ap.network \
"

do_install:append() {
	rm ${D}${systemd_unitdir}/network/80-wired.network
    ln -s /data/network-config/wired.network ${D}${systemd_unitdir}/network/80-wired.network
    ln -s /data/network-config/wireless.network ${D}${systemd_unitdir}/network/80-wireless.network

    install -D -m 0644 ${WORKDIR}/wired.network ${D}/data-factory/network-config/wired.network
    install -D -m 0644 ${WORKDIR}/wireless.network ${D}/data-factory/network-config/wireless.network

    install -D -m 0644 ${WORKDIR}/wireless-ap.network ${D}${systemd_unitdir}/network/20-wireless-ap.network
}

FILES:${PN}:append = " \
    /data-factory/network-config/wired.network \
    /data-factory/network-config/wireless.network \
    ${systemd_unitdir}/network/80-wireless.network \
    ${systemd_unitdir}/network/20-wireless-ap.network \
"