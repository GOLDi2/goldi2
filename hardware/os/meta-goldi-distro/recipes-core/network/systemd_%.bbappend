do_install:append() {
    sed -i '/Wants=/ a RequiresMountsFor=/data/config/wired.network /data/config/wireless.network' ${D}${systemd_system_unitdir}/systemd-networkd.service
}