# Recipe created by recipetool
# This is the basis of a recipe and may need further editing in order to be fully functional.
# (Feel free to remove these comments when editing.)

SUMMARY = "The GOLDi embedded distro admin panel"
# WARNING: the following LICENSE and LIC_FILES_CHKSUM values are best guesses - it is
# your responsibility to verify that the values are complete and correct.
#
# The following license files were not able to be identified and are
# represented as "Unknown" below, you will need to check them yourself:
#   node_modules/qs/LICENSE
#
# NOTE: multiple licenses have been detected; they have been separated with &
# in the LICENSE value for now since it is a reasonable assumption that all
# of the licenses apply. If instead there is a choice between the multiple
# licenses then you should change the value to separate the licenses with |
# instead of &. If there is any doubt, check the accompanying documentation
# to determine which situation is applicable.
LICENSE = "MIT & Unknown & ISC"
LIC_FILES_CHKSUM = "file://node_modules/on-finished/LICENSE;md5=1b1f7f9cec194121fdf616b971df7a7b \
                    file://node_modules/body-parser/LICENSE;md5=0afd201e48c7d095454eed4ac1184e40 \
                    file://node_modules/cookie/LICENSE;md5=bc85b43b6f963e8ab3f88e63628448ca \
                    file://node_modules/path-to-regexp/LICENSE;md5=44088ba57cb871a58add36ce51b8de08 \
                    file://node_modules/escape-html/LICENSE;md5=f8746101546eeb9e4f6de64bb8bdf595 \
                    file://node_modules/http-errors/LICENSE;md5=607209623abfcc77b9098f71a0ef52f9 \
                    file://node_modules/send/LICENSE;md5=df2b0938eba0709b77ac937e2d552b7a \
                    file://node_modules/send/node_modules/ms/license.md;md5=fd56fd5f1860961dfa92d313167c37a6 \
                    file://node_modules/mime/LICENSE;md5=8e8ea2ad138ce468f8570a0edbadea65 \
                    file://node_modules/destroy/LICENSE;md5=c8d3a30332ecb31cfaf4c0a06da18f5c \
                    file://node_modules/content-disposition/LICENSE;md5=13babc4f212ce635d68da544339c962b \
                    file://node_modules/mime-db/LICENSE;md5=c8d3a30332ecb31cfaf4c0a06da18f5c \
                    file://node_modules/methods/LICENSE;md5=c16a7dd9f946172f07086576d135d9d3 \
                    file://node_modules/statuses/LICENSE;md5=36e2bc837ce69a98cc33a9e140d457e5 \
                    file://node_modules/iconv-lite/LICENSE;md5=f942263d98f0d75e0e0101884e86261d \
                    file://node_modules/content-type/LICENSE;md5=f4b767f006864f81a4901347fe4efdab \
                    file://node_modules/vary/LICENSE;md5=13babc4f212ce635d68da544339c962b \
                    file://node_modules/qs/LICENSE;md5=d5c7c6dc45a33a0a9620ed81315672d7 \
                    file://node_modules/express/LICENSE;md5=5513c00a5c36cd361da863dd9aa8875d \
                    file://node_modules/accepts/LICENSE;md5=bf1f9ad1e2e1d507aef4883fff7103de \
                    file://node_modules/array-flatten/LICENSE;md5=44088ba57cb871a58add36ce51b8de08 \
                    file://node_modules/merge-descriptors/LICENSE;md5=aaf57ba8c5c9bf256fea7e943991a81a \
                    file://node_modules/ms/license.md;md5=fd56fd5f1860961dfa92d313167c37a6 \
                    file://node_modules/parseurl/LICENSE;md5=e7842ed4f188e53e53c3e8d9c4807e89 \
                    file://node_modules/mime-types/LICENSE;md5=bf1f9ad1e2e1d507aef4883fff7103de \
                    file://node_modules/forwarded/LICENSE;md5=13babc4f212ce635d68da544339c962b \
                    file://node_modules/media-typer/LICENSE;md5=c6e0ce1e688c5ff16db06b7259e9cd20 \
                    file://node_modules/serve-static/LICENSE;md5=27b1707520b14d0bc890f4e75cd387b0 \
                    file://node_modules/utils-merge/LICENSE;md5=1cf0906082187f374cb9a63c54eb782c \
                    file://node_modules/ipaddr.js/LICENSE;md5=88f60a4b6e44cb849b5d907a7664c0ef \
                    file://node_modules/safer-buffer/LICENSE;md5=3baebc2a17b8f5bff04882cd0dc0f76e \
                    file://node_modules/fresh/LICENSE;md5=373c2cf0978b37e434394a43b4cbbdb4 \
                    file://node_modules/ee-first/LICENSE;md5=c8d3a30332ecb31cfaf4c0a06da18f5c \
                    file://node_modules/type-is/LICENSE;md5=0afd201e48c7d095454eed4ac1184e40 \
                    file://node_modules/safe-buffer/LICENSE;md5=badd5e91c737e7ffdf10b40c1f907761 \
                    file://node_modules/inherits/LICENSE;md5=5b2ef2247af6d355ae9d9f988092d470 \
                    file://node_modules/finalhandler/LICENSE;md5=b506956e5cbfbe0d04f8a5c40107ec89 \
                    file://node_modules/depd/LICENSE;md5=13babc4f212ce635d68da544339c962b \
                    file://node_modules/bytes/LICENSE;md5=013e95467eddb048f19a6f5b42820f86 \
                    file://node_modules/proxy-addr/LICENSE;md5=6e8686b7b13dd7ac8733645a81842c4a \
                    file://node_modules/toidentifier/LICENSE;md5=1a261071a044d02eb6f2bb47f51a3502 \
                    file://node_modules/negotiator/LICENSE;md5=6417a862a5e35c17c904d9dda2cbd499 \
                    file://node_modules/raw-body/LICENSE;md5=c970d30155ebbdb1903e6de8c0666e18 \
                    file://node_modules/unpipe/LICENSE;md5=934ab86a8ab081ea0326add08d550739 \
                    file://node_modules/etag/LICENSE;md5=6e8686b7b13dd7ac8733645a81842c4a \
                    file://node_modules/setprototypeof/LICENSE;md5=4846f1626304c2c0f806a539bbc7d54a \
                    file://node_modules/debug/LICENSE;md5=ddd815a475e7338b0be7a14d8ee35a99 \
                    file://node_modules/encodeurl/LICENSE;md5=272621efa0ff4f18a73221e49ab60654 \
                    file://node_modules/range-parser/LICENSE;md5=d4246fb961a4f121eef5ffca47f0b010 \
                    file://package.json;md5=83352ce8d586c823383d8bcb5155e39f \
                    file://node_modules/accepts/package.json;md5=e6b1f36c7fc3d4a53c34db28ed1fc745 \
                    file://node_modules/array-flatten/package.json;md5=cb1aa7f817100a03395dd0163bf6ebe9 \
                    file://node_modules/body-parser/package.json;md5=d733814bad2ae132f08ab3d55c77b6a8 \
                    file://node_modules/bytes/package.json;md5=bb3cba8a8a870732b7eee0d2e4e29955 \
                    file://node_modules/content-disposition/package.json;md5=7dd4be647ccfcb92d9943e73b26afced \
                    file://node_modules/content-type/package.json;md5=138f1013d1de872220bf2a2f2f052660 \
                    file://node_modules/cookie/package.json;md5=995f6fbcc9e40fa3f539a51194665ac6 \
                    file://node_modules/cookie-signature/package.json;md5=076c53814237236a9d1aa999f33ee501 \
                    file://node_modules/debug/package.json;md5=71a7656944ffe50cc27ebe02491ae49b \
                    file://node_modules/depd/package.json;md5=b6682ec09424cb14ad83a252a6748f35 \
                    file://node_modules/destroy/package.json;md5=ea66becf61cc69aece23e86ea3caf921 \
                    file://node_modules/ee-first/package.json;md5=3ed21090e07ef5dd57729a77c4291cb9 \
                    file://node_modules/encodeurl/package.json;md5=453a9bb10c91e0ec44f305b14e30ce82 \
                    file://node_modules/escape-html/package.json;md5=e9c758769fec9883d5ce3d30b8ee1047 \
                    file://node_modules/etag/package.json;md5=fec91cc11e50ee734c65c2d703db3884 \
                    file://node_modules/express/package.json;md5=bf6c1ca718319e619a9ebd41d5cbef6d \
                    file://node_modules/finalhandler/package.json;md5=65618bd839fed72de71aea141e19e568 \
                    file://node_modules/forwarded/package.json;md5=43c511e831e953c713743c5fc67aa990 \
                    file://node_modules/fresh/package.json;md5=193849cf18966de2814f4f6e85740069 \
                    file://node_modules/http-errors/package.json;md5=18637d36709871c643fdd58b14332bf3 \
                    file://node_modules/iconv-lite/package.json;md5=a8b97f25878ddc5419a9afe173037035 \
                    file://node_modules/inherits/package.json;md5=74b2e77f5c27cdb14784f7f2512a1918 \
                    file://node_modules/ipaddr.js/package.json;md5=17bc176c8d78f76c5e70cad7ba16a598 \
                    file://node_modules/media-typer/package.json;md5=127ce4abeb265c6eef7b45540241ca91 \
                    file://node_modules/merge-descriptors/package.json;md5=570e06d8ce0167e07a32ba70fdd56795 \
                    file://node_modules/methods/package.json;md5=8a9cbead0f83bf845207ad21534dfdfa \
                    file://node_modules/mime/package.json;md5=624ef11f91e60b224942ff81b13d10c6 \
                    file://node_modules/mime-db/package.json;md5=0e8c957f7c9bb16ad6a9d8ce1327e91c \
                    file://node_modules/mime-types/package.json;md5=4d78752212821b31da04f985667090de \
                    file://node_modules/ms/package.json;md5=cbd55880a650b56c3d5acddbbdbee9bc \
                    file://node_modules/negotiator/package.json;md5=f532dffa79bfce9737c04201d64b5160 \
                    file://node_modules/on-finished/package.json;md5=d08696acafdda765ba2fe878b287912a \
                    file://node_modules/parseurl/package.json;md5=5b1493bd775444f0994d0b1063db1900 \
                    file://node_modules/path-to-regexp/package.json;md5=19e58964462995e183c1cd8147a9b8a1 \
                    file://node_modules/proxy-addr/package.json;md5=e99ed9f8aac6231b2559c5d17704b3e7 \
                    file://node_modules/qs/package.json;md5=8cdc396d5a17cd69a677dce0fe432492 \
                    file://node_modules/range-parser/package.json;md5=89b7cc42d2831a8061361ca29545f837 \
                    file://node_modules/raw-body/package.json;md5=4ff24de48d62683b79d442e1672cec63 \
                    file://node_modules/safe-buffer/package.json;md5=bd7ef6f38f0ba20882d2601bd3ecaf11 \
                    file://node_modules/safer-buffer/package.json;md5=274d956f400350c9f6cf96d22cdda227 \
                    file://node_modules/send/node_modules/ms/package.json;md5=83b5d192dde33fb41adda4ce8b9eb521 \
                    file://node_modules/send/package.json;md5=3645cd9d22c03f5bc9b3dddfe795b348 \
                    file://node_modules/serve-static/package.json;md5=d9c0bf270eb80f5b87045c69b8d6c79b \
                    file://node_modules/setprototypeof/package.json;md5=1541c2199513a8830073d21fe710bb0b \
                    file://node_modules/statuses/package.json;md5=ce09e65d18aa8425eac89e41fde1837a \
                    file://node_modules/toidentifier/package.json;md5=2ecc7acf5b134a92fbc0b0999a02f84d \
                    file://node_modules/type-is/package.json;md5=ffa244d8a6f745a081a0cdde026879c9 \
                    file://node_modules/unpipe/package.json;md5=f8318a554ed98c6a030942e9c14aaac8 \
                    file://node_modules/utils-merge/package.json;md5=0230ade39b9c19f5fcc29ed02dff4afe \
                    file://node_modules/vary/package.json;md5=3577fc17c1b964af7cfe2c17c73f84f3"

SRC_URI = " \
    git://git@github.com/GOLDi2/goldi-distro-admin.git;protocol=ssh \
    npmsw://${THISDIR}/${BPN}/npm-shrinkwrap.json \
    "

# Modify these as desired
PV = "1.0.0+git${SRCPV}"
SRCREV = "4610b609ae235a96be65f35b1d3b6ff701c94fb1"

S = "${WORKDIR}/git"

inherit npm

LICENSE_${PN} = "Unknown"
LICENSE_${PN}-accepts = "MIT"
LICENSE_${PN}-array-flatten = "MIT"
LICENSE_${PN}-body-parser = "MIT"
LICENSE_${PN}-bytes = "MIT"
LICENSE_${PN}-content-disposition = "MIT"
LICENSE_${PN}-content-type = "MIT"
LICENSE_${PN}-cookie = "MIT"
LICENSE_${PN}-cookie-signature = "Unknown"
LICENSE_${PN}-debug = "MIT"
LICENSE_${PN}-depd = "MIT"
LICENSE_${PN}-destroy = "MIT"
LICENSE_${PN}-ee-first = "MIT"
LICENSE_${PN}-encodeurl = "MIT"
LICENSE_${PN}-escape-html = "MIT"
LICENSE_${PN}-etag = "MIT"
LICENSE_${PN}-express = "MIT"
LICENSE_${PN}-finalhandler = "MIT"
LICENSE_${PN}-forwarded = "MIT"
LICENSE_${PN}-fresh = "MIT"
LICENSE_${PN}-http-errors = "MIT"
LICENSE_${PN}-iconv-lite = "MIT"
LICENSE_${PN}-inherits = "ISC"
LICENSE_${PN}-ipaddrjs = "MIT"
LICENSE_${PN}-media-typer = "MIT"
LICENSE_${PN}-merge-descriptors = "MIT"
LICENSE_${PN}-methods = "MIT"
LICENSE_${PN}-mime = "MIT"
LICENSE_${PN}-mime-db = "MIT"
LICENSE_${PN}-mime-types = "MIT"
LICENSE_${PN}-ms = "MIT"
LICENSE_${PN}-negotiator = "MIT"
LICENSE_${PN}-on-finished = "MIT"
LICENSE_${PN}-parseurl = "MIT"
LICENSE_${PN}-path-to-regexp = "MIT"
LICENSE_${PN}-proxy-addr = "MIT"
LICENSE_${PN}-qs = "Unknown"
LICENSE_${PN}-range-parser = "MIT"
LICENSE_${PN}-raw-body = "MIT"
LICENSE_${PN}-safe-buffer = "MIT"
LICENSE_${PN}-safer-buffer = "MIT"
LICENSE_${PN}-send-ms = "MIT"
LICENSE_${PN}-send = "MIT"
LICENSE_${PN}-serve-static = "MIT"
LICENSE_${PN}-setprototypeof = "ISC"
LICENSE_${PN}-statuses = "MIT"
LICENSE_${PN}-toidentifier = "MIT"
LICENSE_${PN}-type-is = "MIT"
LICENSE_${PN}-unpipe = "MIT"
LICENSE_${PN}-utils-merge = "MIT"
LICENSE_${PN}-vary = "MIT"
