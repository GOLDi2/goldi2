import { execSync } from 'child_process';
import copy from 'copy';

execSync('npx rimraf ./app', { cwd: './', stdio: 'inherit' });
execSync('npx tsc', { cwd: './', stdio: 'inherit' });
copy('./src/content/templates/**/*', './app/content/templates/', err => {
  if (err) throw err;
});
execSync('npx postcss ./src/content/css --dir ./app/content/css', {
  cwd: './',
  stdio: 'inherit',
});
