SUMMARY = ""

LICENSE = "CLOSED"
LIC_FILES_CHKSUM=""

MULTIMACH_TARGET_SYS = "${MACHINE_VARIANT}-${PACKAGE_ARCH}${TARGET_VENDOR}-${TARGET_OS}"

DEPENDS = "nodejs-native"
RDEPENDS:${PN} = "nodejs"

GIT_DIR = "${THISDIR}/../../../../.."

SRC_URI = " \
    file://${GIT_DIR}/hardware/common/config-interface/dist/npm-latest.tgz \
    file://goldi-config-interface.service \
"

PV = "${MACHINE_VERSION}"

S = "${WORKDIR}"

do_compile(){
    cd ${S}/package
    rm -rf node_modules
    npm --ignore-scripts --arch=$TARGET_ARCH --production --verbose install
}

do_compile[network] = "1"

do_install() {
    install -d ${D}${libdir}/node_modules/@goldi2/hardware-admin/
    cp ${S}/package/package.json ${D}${libdir}/node_modules/@goldi2/hardware-admin/
    cp -r ${S}/package/app/ ${D}${libdir}/node_modules/@goldi2/hardware-admin/app/
    cp -r ${S}/package/node_modules/ ${D}${libdir}/node_modules/@goldi2/hardware-admin/node_modules/

    install -d ${D}/${systemd_system_unitdir}
    install -m 0644 ${WORKDIR}/goldi-config-interface.service ${D}/${systemd_system_unitdir}

    # if ALLOW_UNAUTHORIZED_NETWORK_CONFIG is set, we need to append --allow-network-settings to the service file
    if [ -n "${ALLOW_UNAUTHORIZED_NETWORK_CONFIG}" ]; then
        sed -i "s|index.js|index.js --allow-network-settings|" ${D}/${systemd_system_unitdir}/goldi-config-interface.service
    fi
}

inherit systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "goldi-config-interface.service"


FILES:${PN} = " \
    ${libdir}/node_modules/ \
    ${systemd_system_unitdir}/goldi-config-interface.service \
"

INHIBIT_PACKAGE_DEBUG_SPLIT = "1"