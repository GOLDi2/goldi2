DESCRIPTION = "GOLDi test application packagegroup"
SUMMARY = "GOLDi packagegroup - tools/testapps"

PACKAGE_ARCH = "${MACHINE_ARCH}"

inherit packagegroup

RDEPENDS_${PN} = " \
    ethtool \
    evtest \
    fbset \
    memtester \
    v4l-utils \
"