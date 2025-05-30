const copy = require('copy');
const {execSync} = require('child_process');

execSync('npx rimraf ./app',{cwd: './', stdio: 'inherit'});
execSync('npx tsc',{cwd: './', stdio: 'inherit'});
copy('./src/content/img/**/*', './app/content/img/', (err) => { if (err) throw err; });
copy('./src/content/templates/**/*', './app/content/templates/', (err) => { if (err) throw err; });
copy('./src/content/js/**/*', './app/content/js/', (err) => { if (err) throw err; });
execSync('npx postcss ./src/content/css --dir ./app/content/css', {cwd: './', stdio: 'inherit'});