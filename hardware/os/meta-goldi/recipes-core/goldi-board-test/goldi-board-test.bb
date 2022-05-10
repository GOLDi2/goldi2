# Recipe created by recipetool
# This is the basis of a recipe and may need further editing in order to be fully functional.
# (Feel free to remove these comments when editing.)

SUMMARY = "The test program for the GOLDi interface-boards"
# WARNING: the following LICENSE and LIC_FILES_CHKSUM values are best guesses - it is
# your responsibility to verify that the values are complete and correct.
#
# The following license files were not able to be identified and are
# represented as "Unknown" below, you will need to check them yourself:
#   jtag-over-svf/python-bsdl-parser/LICENSE
#
# NOTE: multiple licenses have been detected; they have been separated with &
# in the LICENSE value for now since it is a reasonable assumption that all
# of the licenses apply. If instead there is a choice between the multiple
# licenses then you should change the value to separate the licenses with |
# instead of &. If there is any doubt, check the accompanying documentation
# to determine which situation is applicable.

# Modify these as desired
PV = "0.0.1+git${SRCPV}"
SRCREV = "${AUTOREV}"

DEPENDS = "nodejs-native bcm2835"

LICENSE = "MIT & Unknown"
LIC_FILES_CHKSUM = "file://LICENSE;md5=f2c6e854b04f73c7caa9a9ea48b57f1e \
                    file://src/jtag-over-svf/python-bsdl-parser/LICENSE;md5=2f2ea6fe7f978668ec24007591c34461 \
                    file://package.json;md5=a9c2246e2b3d0a07b604465da8c794a4"

SRC_URI = "git://git@gitlab.tu-ilmenau.de/FakIA/fachgebiet-iks/goldi/goldi2/goldi-board-test.git;protocol=ssh"

S = "${WORKDIR}/git"

inherit meson

do_compile_append() {
    cd ${S}
    rm -rf dist
    rm -rf node_modules
    npm install
    npm run build
}

do_install_append() {
    install -d ${D}${libdir}/node_modules/@goldi2/goldi-board-test/
    cp ${S}/package.json ${D}${libdir}/node_modules/@goldi2/goldi-board-test/
    cp -r ${S}/dist/ ${D}${libdir}/node_modules/@goldi2/goldi-board-test/dist/
    cp -r ${S}/node_modules/ ${D}${libdir}/node_modules/@goldi2/goldi-board-test/node_modules/
}

FILES_${PN} = "\
    ${libdir}/node_modules/ \
    ${bindir}/goldi-board-test \
    ${bindir}/goldi-board-test-util \
    "

LICENSE_${PN} = "Unknown MIT"
