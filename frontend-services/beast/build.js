const copy = require('copy');

copy('./Praktikum/**/*', './dist/Praktikum', (err) => { if (err) throw err; });
copy('./assets/**/*', './dist/assets', (err) => { if (err) throw err; });
copy('./css/**/*', './dist/css', (err) => { if (err) throw err; });
copy('./doc/**/*', './dist/doc', (err) => { if (err) throw err; });
copy('./js/**/*.js', './dist/js', (err) => { if (err) throw err; });
copy(['./LICENSE','./blank.html','./get_and_set.html','./sample.html','./workspacetest.html','index.html'], './dist/', (err) => { if (err) throw err; });