do_install:append () {
    cat >> ${D}${sysconfdir}/fstab <<EOF

/dev/mmcblk0p1  /boot   vfat    defaults        0       0 
/dev/mmcblk0p4  /data   ext4    x-systemd.growfs        0       0  

EOF
}