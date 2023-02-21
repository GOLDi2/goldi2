import browserSync from 'browser-sync';
import {Request, Response} from 'express';
import fs from 'fs';
import path from 'path';
import postcss, {AcceptedPlugin, ProcessOptions} from 'postcss';

import {config} from './config';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const postcssConfig: {plugins: AcceptedPlugin; options: ProcessOptions} = require('../postcss.config');
const postcssTransformer = postcss(postcssConfig.plugins);

export function postcss_transform(dir: string) {
  return (req: Request, res: Response) => {
    const fileSrc = path.join(dir, req.path);
    const fileDst = req.originalUrl;
    const options = {from: fileSrc, to: fileDst, ...postcssConfig.options};
    postcssTransformer
      .process(fs.readFileSync(fileSrc), options)
      .then(result => {
        res.contentType('css');
        res.send(result.css);
      })
      .catch(err => {
        console.log(err);
      });
  };
}

export function start_browserSync(port: number) {
  // https://ponyfoo.com/articles/a-browsersync-primer#inside-a-node-application
  browserSync({
    files: ['src/**/*.{html,js,css}'],
    online: false,
    open: false,
    port: config.PORT,
    proxy: 'https://localhost:' + port,
    ui: false,
  });
}
