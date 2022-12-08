# Recipe created by recipetool
# This is the basis of a recipe and may need further editing in order to be fully functional.
# (Feel free to remove these comments when editing.)

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

SUMMARY = "The test program for the GOLDi interface-boards"
LICENSE = "CLOSED"

LIC_FILES_CHKSUM = "file://LICENSE;md5=f2c6e854b04f73c7caa9a9ea48b57f1e"

DEPENDS = "nodejs-native bcm2835"
RDEPENDS:${PN} = "nodejs" 

SRC_URI = " \
    file://git \
"

S = "${WORKDIR}/git"

inherit meson

do_compile:append() {
    cd ${S}
    rm -rf dist
    rm -rf node_modules
    npm install
    npm run build
}

do_install:append() {
    install -d ${D}${libdir}/node_modules/@goldi2/goldi-board-test/
    cp ${S}/package.json ${D}${libdir}/node_modules/@goldi2/goldi-board-test/
    cp -r ${S}/dist/ ${D}${libdir}/node_modules/@goldi2/goldi-board-test/dist/
    cp -r ${S}/node_modules/ ${D}${libdir}/node_modules/@goldi2/goldi-board-test/node_modules/
}

FILES:${PN} = "\
    ${libdir}/node_modules/ \
    ${bindir}/goldi-board-test \
    ${bindir}/goldi-board-test-util \
    "
