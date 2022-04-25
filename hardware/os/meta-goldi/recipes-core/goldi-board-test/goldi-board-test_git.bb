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
LICENSE = "MIT"
LIC_FILES_CHKSUM = "file://LICENSE;md5=f2c6e854b04f73c7caa9a9ea48b57f1e"

SRC_URI = " \
    git://git@gitlab.tu-ilmenau.de/FakIA/fachgebiet-iks/goldi/goldi2/goldi-board-test.git;protocol=ssh;rev=8c24cf7e981c4e8e2d7dc65e8fd4d177cd23a94e \
    npmsw://${THISDIR}/${BPN}/npm-shrinkwrap.json \
    "

# Modify these as desired
PV = "0.0.1"
# SRCREV = "8c24cf7e981c4e8e2d7dc65e8fd4d177cd23a94e"

S = "${WORKDIR}/git"

inherit npm

LICENSE_${PN} = "Unknown MIT"
