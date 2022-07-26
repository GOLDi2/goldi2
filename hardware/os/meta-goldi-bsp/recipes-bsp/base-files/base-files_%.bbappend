do_install:append () {
    cat >> ${D}${sysconfdir}/fstab <<EOF

/dev/mmcblk0p1  /boot         vfat    defaults                0       0 
/dev/mmcblk0p4  /data-local   ext4    x-systemd.growfs        0       0  
overlay         /data    overlay defaults,x-systemd.requires=/data-local,lowerdir=/data-factory,upperdir=/data-local/overlay,workdir=/data-local/overlay-work 0 0
/data/shadow /etc/shadow none defaults,bind 0 0

EOF
}

##overlay         /etc    overlay defaults,x-systemd.requires=/data-local,lowerdir=/etc,upperdir=/data-local/etc-overlay,workdir=/data-local/etc-overlay-work 0 0