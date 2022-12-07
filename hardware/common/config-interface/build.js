const copy = require('copy');
const {execSync} = require('child_process');

execSync('npx rimraf ./dist',{cwd: './', stdio: 'inherit'});
execSync('npx tsc',{cwd: './', stdio: 'inherit'});
copy('./src/content/img/**/*', './dist/content/img/', (err) => { if (err) throw err; });
copy('./src/content/templates/**/*', './dist/content/templates/', (err) => { if (err) throw err; });
execSync('npx postcss ./src/content/css --dir ./dist/content/css', {cwd: './', stdio: 'inherit'});