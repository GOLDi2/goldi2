do_install:append () {
    cat >> ${D}${sysconfdir}/fstab <<EOF

/data/shadow /etc/shadow none defaults,bind 0 0

EOF
}