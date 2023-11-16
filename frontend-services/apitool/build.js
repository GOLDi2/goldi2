import * as esbuild from 'esbuild';
import fs from 'fs';
import crypto from 'crypto';

esbuild.buildSync({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outfile: 'http-dist/bundle.js',
    loader: {
        '.css': 'text',
    },
    format: 'esm',
});

const bundle = fs.readFileSync('http-dist/bundle.js');
const hashSumBundle = crypto.createHash('md5');
hashSumBundle.update(bundle);

const hexBundle = hashSumBundle.digest('hex');
const newBundleName = `bundle.${hexBundle}.js`;

const stylesheet = fs.readFileSync('http-dist/stylesheet.css');
const hashSumStylesheet = crypto.createHash('md5');
hashSumStylesheet.update(stylesheet);

const hexStylesheet = hashSumStylesheet.digest('hex');
const newStylesheetName = `stylesheet.${hexStylesheet}.css`;

const contentIndex = fs.readFileSync('http-dist/index.html');
fs.writeFileSync(
    'http-dist/index.html',
    contentIndex
        .toString()
        .replace(/bundle\.js/g, newBundleName)
        .replace(/stylesheet\.css/g, newStylesheetName)
);
fs.renameSync('http-dist/bundle.js', 'http-dist/' + newBundleName);
fs.renameSync('http-dist/stylesheet.css', 'http-dist/' + newStylesheetName);
