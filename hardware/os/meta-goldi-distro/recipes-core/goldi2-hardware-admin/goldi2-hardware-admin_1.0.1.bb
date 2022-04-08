# Recipe created by recipetool
# This is the basis of a recipe and may need further editing in order to be fully functional.
# (Feel free to remove these comments when editing.)

SUMMARY = ""
# WARNING: the following LICENSE and LIC_FILES_CHKSUM values are best guesses - it is
# your responsibility to verify that the values are complete and correct.
#
# The following license files were not able to be identified and are
# represented as "Unknown" below, you will need to check them yourself:
#   node_modules/qs/LICENSE.md
#   node_modules/typedarray/LICENSE
#   node_modules/concat-stream/node_modules/readable-stream/LICENSE
#   node_modules/concat-stream/node_modules/string_decoder/LICENSE
#   node_modules/nunjucks/LICENSE
#   node_modules/dotenv/LICENSE
#   node_modules/process-nextick-args/license.md
#
# NOTE: multiple licenses have been detected; they have been separated with &
# in the LICENSE value for now since it is a reasonable assumption that all
# of the licenses apply. If instead there is a choice between the multiple
# licenses then you should change the value to separate the licenses with |
# instead of &. If there is any doubt, check the accompanying documentation
# to determine which situation is applicable.
LICENSE = "MIT & ISC & Unknown"
LIC_FILES_CHKSUM = "file://node_modules/parseurl/LICENSE;md5=e7842ed4f188e53e53c3e8d9c4807e89 \
                    file://node_modules/toidentifier/LICENSE;md5=1a261071a044d02eb6f2bb47f51a3502 \
                    file://node_modules/object-assign/license;md5=a12ebca0510a773644101a99a867d210 \
                    file://node_modules/append-field/LICENSE;md5=5c090f9df283eefdcea00b2f0766ca6c \
                    file://node_modules/commander/LICENSE;md5=25851d4d10d6611a12d5571dab945a00 \
                    file://node_modules/safe-buffer/LICENSE;md5=badd5e91c737e7ffdf10b40c1f907761 \
                    file://node_modules/negotiator/LICENSE;md5=6417a862a5e35c17c904d9dda2cbd499 \
                    file://node_modules/range-parser/LICENSE;md5=d4246fb961a4f121eef5ffca47f0b010 \
                    file://node_modules/setprototypeof/LICENSE;md5=4846f1626304c2c0f806a539bbc7d54a \
                    file://node_modules/unpipe/LICENSE;md5=934ab86a8ab081ea0326add08d550739 \
                    file://node_modules/path-to-regexp/LICENSE;md5=44088ba57cb871a58add36ce51b8de08 \
                    file://node_modules/qs/LICENSE.md;md5=b289135779dd930509ae81e6041690c0 \
                    file://node_modules/body-parser/LICENSE;md5=0afd201e48c7d095454eed4ac1184e40 \
                    file://node_modules/raw-body/LICENSE;md5=c970d30155ebbdb1903e6de8c0666e18 \
                    file://node_modules/serve-static/LICENSE;md5=27b1707520b14d0bc890f4e75cd387b0 \
                    file://node_modules/cookie/LICENSE;md5=bc85b43b6f963e8ab3f88e63628448ca \
                    file://node_modules/readable-stream/LICENSE;md5=d7351a4fc8e956f1a68413490d5e655e \
                    file://node_modules/util-deprecate/LICENSE;md5=b7c99ef4b0f3ad9911a52219947f8cf0 \
                    file://node_modules/buffer-from/LICENSE;md5=46513463e8f7d9eb671a243f0083b2c6 \
                    file://node_modules/inherits/LICENSE;md5=5b2ef2247af6d355ae9d9f988092d470 \
                    file://node_modules/etag/LICENSE;md5=6e8686b7b13dd7ac8733645a81842c4a \
                    file://node_modules/string_decoder/LICENSE;md5=fcf5cfdc777e49f11402422c72a86f43 \
                    file://node_modules/finalhandler/LICENSE;md5=b506956e5cbfbe0d04f8a5c40107ec89 \
                    file://node_modules/streamsearch/LICENSE;md5=df3ad145c2acbfc4f246fa834a6675c7 \
                    file://node_modules/destroy/LICENSE;md5=c8d3a30332ecb31cfaf4c0a06da18f5c \
                    file://node_modules/mkdirp/LICENSE;md5=b2d989bc186e7f6b418a5fdd5cc0b56b \
                    file://node_modules/typedarray/LICENSE;md5=6085b70b74c7dcf7df4e955725e3153d \
                    file://node_modules/depd/LICENSE;md5=13babc4f212ce635d68da544339c962b \
                    file://node_modules/multer/LICENSE;md5=039580279923334e9eaeb656c54e6039 \
                    file://node_modules/core-util-is/LICENSE;md5=6126e36127d20ec0e2f637204a5c68ff \
                    file://node_modules/content-type/LICENSE;md5=f4b767f006864f81a4901347fe4efdab \
                    file://node_modules/escape-html/LICENSE;md5=f8746101546eeb9e4f6de64bb8bdf595 \
                    file://node_modules/a-sync-waterfall/LICENSE;md5=9df8a60d177947c99df1daed5e145d73 \
                    file://node_modules/concat-stream/LICENSE;md5=3ad90c134f824ddfcea611ee1fa567a8 \
                    file://node_modules/concat-stream/node_modules/safe-buffer/LICENSE;md5=badd5e91c737e7ffdf10b40c1f907761 \
                    file://node_modules/concat-stream/node_modules/readable-stream/LICENSE;md5=a67a7926e54316d90c14f74f71080977 \
                    file://node_modules/concat-stream/node_modules/string_decoder/LICENSE;md5=14af51f8c0a6c6e400b53e18c6e5f85c \
                    file://node_modules/express/LICENSE;md5=5513c00a5c36cd361da863dd9aa8875d \
                    file://node_modules/iconv-lite/LICENSE;md5=f942263d98f0d75e0e0101884e86261d \
                    file://node_modules/mime-types/LICENSE;md5=bf1f9ad1e2e1d507aef4883fff7103de \
                    file://node_modules/type-is/LICENSE;md5=0afd201e48c7d095454eed4ac1184e40 \
                    file://node_modules/mime/LICENSE;md5=8e8ea2ad138ce468f8570a0edbadea65 \
                    file://node_modules/utils-merge/LICENSE;md5=1cf0906082187f374cb9a63c54eb782c \
                    file://node_modules/forwarded/LICENSE;md5=13babc4f212ce635d68da544339c962b \
                    file://node_modules/debug/LICENSE;md5=ddd815a475e7338b0be7a14d8ee35a99 \
                    file://node_modules/asap/LICENSE.md;md5=6ef000dc4ca2360ae9216d401862c653 \
                    file://node_modules/proxy-addr/LICENSE;md5=6e8686b7b13dd7ac8733645a81842c4a \
                    file://node_modules/ipaddr.js/LICENSE;md5=88f60a4b6e44cb849b5d907a7664c0ef \
                    file://node_modules/mime-db/LICENSE;md5=175b28b58359f8b4a969c9ab7c828445 \
                    file://node_modules/array-flatten/LICENSE;md5=44088ba57cb871a58add36ce51b8de08 \
                    file://node_modules/content-disposition/LICENSE;md5=13babc4f212ce635d68da544339c962b \
                    file://node_modules/on-finished/LICENSE;md5=1b1f7f9cec194121fdf616b971df7a7b \
                    file://node_modules/ms/license.md;md5=fd56fd5f1860961dfa92d313167c37a6 \
                    file://node_modules/dicer/LICENSE;md5=df3ad145c2acbfc4f246fa834a6675c7 \
                    file://node_modules/send/LICENSE;md5=df2b0938eba0709b77ac937e2d552b7a \
                    file://node_modules/send/node_modules/ms/license.md;md5=2b8bc52ae6b7ba58e1629deabd53986f \
                    file://node_modules/media-typer/LICENSE;md5=c6e0ce1e688c5ff16db06b7259e9cd20 \
                    file://node_modules/http-errors/LICENSE;md5=607209623abfcc77b9098f71a0ef52f9 \
                    file://node_modules/merge-descriptors/LICENSE;md5=aaf57ba8c5c9bf256fea7e943991a81a \
                    file://node_modules/nunjucks/LICENSE;md5=ffb8fbaed70c2bbb27445c2cf9384ca3 \
                    file://node_modules/dotenv/LICENSE;md5=f063f692e0722821de5bd48ee5898746 \
                    file://node_modules/bytes/LICENSE;md5=013e95467eddb048f19a6f5b42820f86 \
                    file://node_modules/fresh/LICENSE;md5=373c2cf0978b37e434394a43b4cbbdb4 \
                    file://node_modules/statuses/LICENSE;md5=36e2bc837ce69a98cc33a9e140d457e5 \
                    file://node_modules/process-nextick-args/license.md;md5=216769dac98a78ec088ee7cc6fad1dfa \
                    file://node_modules/busboy/LICENSE;md5=df3ad145c2acbfc4f246fa834a6675c7 \
                    file://node_modules/safer-buffer/LICENSE;md5=3baebc2a17b8f5bff04882cd0dc0f76e \
                    file://node_modules/minimist/LICENSE;md5=aea1cde69645f4b99be4ff7ca9abcce1 \
                    file://node_modules/vary/LICENSE;md5=13babc4f212ce635d68da544339c962b \
                    file://node_modules/encodeurl/LICENSE;md5=272621efa0ff4f18a73221e49ab60654 \
                    file://node_modules/methods/LICENSE;md5=c16a7dd9f946172f07086576d135d9d3 \
                    file://node_modules/accepts/LICENSE;md5=bf1f9ad1e2e1d507aef4883fff7103de \
                    file://node_modules/ee-first/LICENSE;md5=c8d3a30332ecb31cfaf4c0a06da18f5c \
                    file://node_modules/xtend/LICENSE;md5=66787c5cd698a0b30b358c7e30f500ca \
                    file://package.json;md5=ba4313d695c85f571ac932cabdd606bc \
                    file://node_modules/a-sync-waterfall/package.json;md5=dc00ee19c80dc1dcdb0ed870b4e34701 \
                    file://node_modules/accepts/package.json;md5=32a15d6909fcae63e52d8664593d32d5 \
                    file://node_modules/append-field/package.json;md5=c32cdcbb2318460adadc8efd177aa1b3 \
                    file://node_modules/array-flatten/package.json;md5=cb1aa7f817100a03395dd0163bf6ebe9 \
                    file://node_modules/asap/package.json;md5=4c974dfa11d66358b3f8610ffcad5478 \
                    file://node_modules/body-parser/package.json;md5=a8b1cabbf614876800d2705e159e3380 \
                    file://node_modules/buffer-from/package.json;md5=5d307ad7d2ccde25a82e944fb224ebe2 \
                    file://node_modules/busboy/package.json;md5=8560608d11f2a79820b6e08a76f5f714 \
                    file://node_modules/bytes/package.json;md5=5e3137feec27c5d88693e0cb2ff95d3c \
                    file://node_modules/commander/package.json;md5=559c22783d1b9bc3462653c0aedb7eb4 \
                    file://node_modules/concat-stream/node_modules/isarray/package.json;md5=a490f11007b2cc9d19c4a250592c2e71 \
                    file://node_modules/concat-stream/node_modules/readable-stream/package.json;md5=55d646ab9e50735393b18c874d0bd5ab \
                    file://node_modules/concat-stream/node_modules/safe-buffer/package.json;md5=bd7ef6f38f0ba20882d2601bd3ecaf11 \
                    file://node_modules/concat-stream/node_modules/string_decoder/package.json;md5=4a56e8c1789fe3bc13c55f8fec7e3ce2 \
                    file://node_modules/concat-stream/package.json;md5=61caf8dd4ec0cd0fe58d27f28dc499d1 \
                    file://node_modules/content-disposition/package.json;md5=5b285d4db057e7e72225e8e928d2ffa3 \
                    file://node_modules/content-type/package.json;md5=138f1013d1de872220bf2a2f2f052660 \
                    file://node_modules/cookie/package.json;md5=9ffd5fc85fd41d22b897364b95a8f292 \
                    file://node_modules/cookie-signature/package.json;md5=076c53814237236a9d1aa999f33ee501 \
                    file://node_modules/core-util-is/package.json;md5=ce4cfe45404dea29ac581e68ba998ecc \
                    file://node_modules/debug/package.json;md5=71a7656944ffe50cc27ebe02491ae49b \
                    file://node_modules/depd/package.json;md5=b6682ec09424cb14ad83a252a6748f35 \
                    file://node_modules/destroy/package.json;md5=ea66becf61cc69aece23e86ea3caf921 \
                    file://node_modules/dicer/package.json;md5=510fc43bdaca6cf5b4bf59bdd5e67a80 \
                    file://node_modules/dotenv/package.json;md5=2a7b951e456a22ebcfbd0e61fe7ee025 \
                    file://node_modules/ee-first/package.json;md5=3ed21090e07ef5dd57729a77c4291cb9 \
                    file://node_modules/encodeurl/package.json;md5=453a9bb10c91e0ec44f305b14e30ce82 \
                    file://node_modules/escape-html/package.json;md5=e9c758769fec9883d5ce3d30b8ee1047 \
                    file://node_modules/etag/package.json;md5=fec91cc11e50ee734c65c2d703db3884 \
                    file://node_modules/express/package.json;md5=432531f4d482272a08138f17af91e732 \
                    file://node_modules/finalhandler/package.json;md5=65618bd839fed72de71aea141e19e568 \
                    file://node_modules/forwarded/package.json;md5=e7df15eb8d27abec5607f111411a9df1 \
                    file://node_modules/fresh/package.json;md5=193849cf18966de2814f4f6e85740069 \
                    file://node_modules/http-errors/package.json;md5=9c177a8d4ca9a669bacc5611336fed2c \
                    file://node_modules/iconv-lite/package.json;md5=a8b97f25878ddc5419a9afe173037035 \
                    file://node_modules/inherits/package.json;md5=f73908dab55d4259f3ed052ce9fb2fbb \
                    file://node_modules/ipaddr.js/package.json;md5=17bc176c8d78f76c5e70cad7ba16a598 \
                    file://node_modules/isarray/package.json;md5=b0687e3b16a90d54d57edc86b31a496d \
                    file://node_modules/media-typer/package.json;md5=127ce4abeb265c6eef7b45540241ca91 \
                    file://node_modules/merge-descriptors/package.json;md5=570e06d8ce0167e07a32ba70fdd56795 \
                    file://node_modules/methods/package.json;md5=8a9cbead0f83bf845207ad21534dfdfa \
                    file://node_modules/mime/package.json;md5=624ef11f91e60b224942ff81b13d10c6 \
                    file://node_modules/mime-db/package.json;md5=12c5cd5cfa1d4f45af207db1715d4b70 \
                    file://node_modules/mime-types/package.json;md5=7ad9a6119e3173ea667f1409fefba992 \
                    file://node_modules/minimist/package.json;md5=5e7a3ce9f200f99433a6d6541cf55f25 \
                    file://node_modules/mkdirp/package.json;md5=65a9c81d4f8abb72f51e7ea6a7f02957 \
                    file://node_modules/ms/package.json;md5=cbd55880a650b56c3d5acddbbdbee9bc \
                    file://node_modules/multer/package.json;md5=4955a1a1decabb17c1214d2536899d04 \
                    file://node_modules/negotiator/package.json;md5=5d2bc8ae77831203c6d0ce3a17e599cf \
                    file://node_modules/nunjucks/package.json;md5=7c410f0fa353214de32e71db47277cf1 \
                    file://node_modules/object-assign/package.json;md5=2854c33ba575a9ebc613d1a617ece277 \
                    file://node_modules/on-finished/package.json;md5=d08696acafdda765ba2fe878b287912a \
                    file://node_modules/parseurl/package.json;md5=5b1493bd775444f0994d0b1063db1900 \
                    file://node_modules/path-to-regexp/package.json;md5=19e58964462995e183c1cd8147a9b8a1 \
                    file://node_modules/process-nextick-args/package.json;md5=6bd1fff965ff97b4aff54e6b4e382ed0 \
                    file://node_modules/proxy-addr/package.json;md5=9b004d1140b24f5ae3f21fcdba8951fc \
                    file://node_modules/qs/package.json;md5=5d307dad1ac46c182b34717ca478191a \
                    file://node_modules/range-parser/package.json;md5=89b7cc42d2831a8061361ca29545f837 \
                    file://node_modules/raw-body/package.json;md5=166fb229b203e8aaca9ce5541d5d8ad3 \
                    file://node_modules/readable-stream/package.json;md5=1825033f8407dad727b21012aa583610 \
                    file://node_modules/safe-buffer/package.json;md5=b206856c7ef099626bf28cdc5498787a \
                    file://node_modules/safer-buffer/package.json;md5=274d956f400350c9f6cf96d22cdda227 \
                    file://node_modules/send/node_modules/ms/package.json;md5=a682078f64a677ddad1f50307a14b678 \
                    file://node_modules/send/package.json;md5=4a7772a8acb1d83d83add9cece80c8ed \
                    file://node_modules/serve-static/package.json;md5=7b875998a9f9c794b31cf0f81ca15786 \
                    file://node_modules/setprototypeof/package.json;md5=3c0480d60c15fe4fe27ae36205d1f949 \
                    file://node_modules/statuses/package.json;md5=ce09e65d18aa8425eac89e41fde1837a \
                    file://node_modules/streamsearch/package.json;md5=6da86aa1ad809dadbdeb8c7f54cc4f03 \
                    file://node_modules/string_decoder/package.json;md5=cbd2e5a6014aa6054d05c8cfca2e65a2 \
                    file://node_modules/toidentifier/package.json;md5=fd6e2543a1b015cc443c7a2dcc4e3668 \
                    file://node_modules/type-is/package.json;md5=ffa244d8a6f745a081a0cdde026879c9 \
                    file://node_modules/typedarray/package.json;md5=252085c44894a63cd58d8c343f2ba589 \
                    file://node_modules/unpipe/package.json;md5=f8318a554ed98c6a030942e9c14aaac8 \
                    file://node_modules/util-deprecate/package.json;md5=73e6c3ff1709538c921d13a75cae485d \
                    file://node_modules/utils-merge/package.json;md5=0230ade39b9c19f5fcc29ed02dff4afe \
                    file://node_modules/vary/package.json;md5=3577fc17c1b964af7cfe2c17c73f84f3 \
                    file://node_modules/xtend/package.json;md5=9a88dd08c469a5a8b2ea15f999bf5db8"

SRC_URI = "npm://registry.npmjs.com/;package=@goldi2/hardware-admin;version=${PV} \
           npmsw://${THISDIR}/${BPN}/npm-shrinkwrap.json \
           file://goldi2-admin.service \
           "

S = "${WORKDIR}/npm"

inherit npm systemd

SYSTEMD_AUTO_ENABLE = "enable"
SYSTEMD_SERVICE:${PN} = "goldi2-admin.service"

do_install:append() {
  install -d ${D}/${systemd_system_unitdir}
  install -m 0644 ${WORKDIR}/goldi2-admin.service ${D}/${systemd_system_unitdir}
}

FILES:${PN} += "${systemd_system_unitdir}/goldi2-admin.service"

LICENSE:${PN} = "Unknown"
LICENSE:${PN}-a-sync-waterfall = "MIT"
LICENSE:${PN}-accepts = "MIT"
LICENSE:${PN}-append-field = "MIT"
LICENSE:${PN}-array-flatten = "MIT"
LICENSE:${PN}-asap = "MIT"
LICENSE:${PN}-body-parser = "MIT"
LICENSE:${PN}-buffer-from = "MIT"
LICENSE:${PN}-busboy = "MIT"
LICENSE:${PN}-bytes = "MIT"
LICENSE:${PN}-commander = "MIT"
LICENSE:${PN}-concat-stream-isarray = "Unknown"
LICENSE:${PN}-concat-stream-readable-stream = "Unknown"
LICENSE:${PN}-concat-stream-safe-buffer = "MIT"
LICENSE:${PN}-concat-stream-stringdecoder = "Unknown"
LICENSE:${PN}-concat-stream = "MIT"
LICENSE:${PN}-content-disposition = "MIT"
LICENSE:${PN}-content-type = "MIT"
LICENSE:${PN}-cookie = "MIT"
LICENSE:${PN}-cookie-signature = "Unknown"
LICENSE:${PN}-core-util-is = "MIT"
LICENSE:${PN}-debug = "MIT"
LICENSE:${PN}-depd = "MIT"
LICENSE:${PN}-destroy = "MIT"
LICENSE:${PN}-dicer = "MIT"
LICENSE:${PN}-dotenv = "Unknown"
LICENSE:${PN}-ee-first = "MIT"
LICENSE:${PN}-encodeurl = "MIT"
LICENSE:${PN}-escape-html = "MIT"
LICENSE:${PN}-etag = "MIT"
LICENSE:${PN}-express = "MIT"
LICENSE:${PN}-finalhandler = "MIT"
LICENSE:${PN}-forwarded = "MIT"
LICENSE:${PN}-fresh = "MIT"
LICENSE:${PN}-http-errors = "MIT"
LICENSE:${PN}-iconv-lite = "MIT"
LICENSE:${PN}-inherits = "ISC"
LICENSE:${PN}-ipaddrjs = "MIT"
LICENSE:${PN}-isarray = "Unknown"
LICENSE:${PN}-media-typer = "MIT"
LICENSE:${PN}-merge-descriptors = "MIT"
LICENSE:${PN}-methods = "MIT"
LICENSE:${PN}-mime = "MIT"
LICENSE:${PN}-mime-db = "MIT"
LICENSE:${PN}-mime-types = "MIT"
LICENSE:${PN}-minimist = "MIT"
LICENSE:${PN}-mkdirp = "MIT"
LICENSE:${PN}-ms = "MIT"
LICENSE:${PN}-multer = "MIT"
LICENSE:${PN}-negotiator = "MIT"
LICENSE:${PN}-nunjucks = "BSD-2-Clause"
LICENSE:${PN}-object-assign = "MIT"
LICENSE:${PN}-on-finished = "MIT"
LICENSE:${PN}-parseurl = "MIT"
LICENSE:${PN}-path-to-regexp = "MIT"
LICENSE:${PN}-process-nextick-args = "MIT"
LICENSE:${PN}-proxy-addr = "MIT"
LICENSE:${PN}-qs = "BSD-3-Clause"
LICENSE:${PN}-range-parser = "MIT"
LICENSE:${PN}-raw-body = "MIT"
LICENSE:${PN}-readable-stream = "MIT"
LICENSE:${PN}-safe-buffer = "MIT"
LICENSE:${PN}-safer-buffer = "MIT"
LICENSE:${PN}-send-ms = "MIT"
LICENSE:${PN}-send = "MIT"
LICENSE:${PN}-serve-static = "MIT"
LICENSE:${PN}-setprototypeof = "ISC"
LICENSE:${PN}-statuses = "MIT"
LICENSE:${PN}-streamsearch = "MIT"
LICENSE:${PN}-stringdecoder = "MIT"
LICENSE:${PN}-toidentifier = "MIT"
LICENSE:${PN}-type-is = "MIT"
LICENSE:${PN}-typedarray = "MIT"
LICENSE:${PN}-unpipe = "MIT"
LICENSE:${PN}-util-deprecate = "MIT"
LICENSE:${PN}-utils-merge = "MIT"
LICENSE:${PN}-vary = "MIT"
LICENSE:${PN}-xtend = "MIT"
