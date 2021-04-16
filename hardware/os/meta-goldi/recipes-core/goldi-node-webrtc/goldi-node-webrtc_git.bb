# Recipe created by recipetool
# This is the basis of a recipe and may need further editing in order to be fully functional.
# (Feel free to remove these comments when editing.)

SUMMARY = ""

inherit pkgconfig
     
DEPENDS = "glib-2.0 gstreamer1.0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad"
RDEPENDS_${PN} = "glib-2.0 gstreamer1.0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad"

# WARNING: the following LICENSE and LIC_FILES_CHKSUM values are best guesses - it is
# your responsibility to verify that the values are complete and correct.
#
# The following license files were not able to be identified and are
# represented as "Unknown" below, you will need to check them yourself:
#   node_modules/node-addon-api/LICENSE.md
#
# NOTE: multiple licenses have been detected; they have been separated with &
# in the LICENSE value for now since it is a reasonable assumption that all
# of the licenses apply. If instead there is a choice between the multiple
# licenses then you should change the value to separate the licenses with |
# instead of &. If there is any doubt, check the accompanying documentation
# to determine which situation is applicable.
LICENSE = "Unknown & MIT"
LIC_FILES_CHKSUM = "file://node_modules/node-addon-api/LICENSE.md;md5=0492ef29a9d558a3e9660e7accc9ca6a \
                    file://node_modules/ws/LICENSE;md5=95833e8f03687308b0584a377b9e12b0 \
                    file://package.json;md5=d3cb516b84b6e2787d061df51328180d \
                    file://node_modules/bindings/package.json;md5=b795b00f79b2cacda87b00eff791966a \
                    file://node_modules/node-addon-api/package.json;md5=b570300df4894f1e7eca67970f5836ce \
                    file://node_modules/ws/package.json;md5=8022f931be0aad6faee591f67ce95401"

SRC_URI = " \
    git://git@github.com/GOLDi2/node-webrtc.git;protocol=ssh \
    npmsw://${THISDIR}/${BPN}/npm-shrinkwrap.json \
    "

# Modify these as desired
PV = "0.0.0+git${SRCPV}"
SRCREV = "483f0971835057417f5e9b0ae73eab403b5f8467"

S = "${WORKDIR}/git"

inherit npm

LICENSE_${PN} = "Unknown"
LICENSE_${PN}-bindings = "Unknown"
LICENSE_${PN}-node-addon-api = "Unknown"
LICENSE_${PN}-ws = "MIT"

#do_compile() {
#    pkg-config gstreamer-1.0 --cflags-only-I | sed 's/-I //g'
#}
