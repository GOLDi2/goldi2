SUMMARY = ""
LICENSE = "MIT & ISC & Unknown"

LIC_FILES_CHKSUM = "file://package.json;md5=47c6ca06ee34cc38292c76d278b23766"

DEPENDS = "nodejs-native"

SRC_URI = " \
    git://git@gitlab.tu-ilmenau.de/FakIA/fachgebiet-iks/goldi/goldi2/hardware/admin.git;protocol=ssh;branch=master \
    file://goldi2-admin.service\
"
SRCREV = "667abe06b0e2b55ab9c77ffd5124f63f75a65bb1"
PV = "1.0.3+git${SRCPV}"

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