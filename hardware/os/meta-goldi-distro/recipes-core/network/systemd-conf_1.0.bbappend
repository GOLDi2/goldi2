do_install:append() {
	rm ${D}${systemd_unitdir}/network/80-wired.network
    ln -s /data/config/wired.network ${D}${systemd_unitdir}/network/80-wired.network
}