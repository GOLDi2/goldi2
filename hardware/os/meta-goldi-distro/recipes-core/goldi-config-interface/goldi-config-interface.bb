SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

DEPENDS = "nodejs-native"
RDEPENDS:${PN} = "nodejs"

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/hardware/common/config-interface/dist/npm-latest.tgz \
    file://goldi-config-interface.service \
"

S = "${WORKDIR}"

do_compile(){
    cd ${S}/package
    rm -rf node_modules
    npm --arch=$BUILD_ARCH --verbose install
    rm -rf node_modules
    rm -rf src
    npm --ignore-scripts --arch=$TARGET_ARCH --production --verbose install
}

do_install() {
    install -d ${D}${libdir}/node_modules/@goldi2/hardware-admin/
    cp ${S}/package/package.json ${D}${libdir}/node_modules/@goldi2/hardware-admin/
    cp -r ${S}/package/app/ ${D}${libdir}/node_modules/@goldi2/hardware-admin/app/
    cp -r ${S}/package/node_modules/ ${D}${libdir}/node_modules/@goldi2/hardware-admin/node_modules/

    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/goldi-config-interface.service ${D}/${systemd_system_unitdir}
}

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "goldi-config-interface.service"


FILES:${PN} = " \
    ${libdir}/node_modules/ \
    ${systemd_system_unitdir}/goldi-config-interface.service \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"