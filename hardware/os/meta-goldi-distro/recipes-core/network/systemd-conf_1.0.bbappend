FILESEXTRAPATHS:prepend := "${THISDIR}/files:"

do_install:append() {
	rm ${D}${systemd_unitdir}/network/80-wired.network
    ln -s /data/network-config/wired.network ${D}${systemd_unitdir}/network/80-wired.network

    install -D -m 0644 ${WORKDIR}/wired.network ${D}/data-factory/network-config/wired.network
}

FILES:${PN}:append = " \
    /data-factory/network-config/wired.network \
"