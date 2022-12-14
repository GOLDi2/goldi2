SUMMARY = ""
LICENSE = "MIT & ISC & Unknown"

LIC_FILES_CHKSUM = "file://package.json;md5=c1ef182bfae8539087904022776fa2be"

DEPENDS = "nodejs-native"
RDEPENDS:${PN} = "nodejs"

SRC_URI = " \
    file://git \
    file://goldi2-admin.service \
"

S = "${WORKDIR}/git"

do_compile(){
    cd ${S}
    rm -rf node_modules
    npm --arch=$BUILD_ARCH --verbose install
    rm -rf node_modules
    rm -rf src
    npm --ignore-scripts --arch=$TARGET_ARCH --production --verbose install
}

do_install() {
    install -d ${D}${libdir}/node_modules/@goldi2/hardware-admin/
    cp ${S}/package.json ${D}${libdir}/node_modules/@goldi2/hardware-admin/
    cp -r ${S}/dist/ ${D}${libdir}/node_modules/@goldi2/hardware-admin/dist/
    cp -r ${S}/node_modules/ ${D}${libdir}/node_modules/@goldi2/hardware-admin/node_modules/

    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/goldi2-admin.service ${D}/${systemd_system_unitdir}
}

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "goldi2-admin.service"


FILES:${PN} = " \
    ${libdir}/node_modules/ \
    ${systemd_system_unitdir}/goldi2-admin.service \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"