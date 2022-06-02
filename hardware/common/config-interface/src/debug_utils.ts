import { Request, Response } from 'express';
import postcss from 'postcss';
import path from 'path';
import fs from 'fs';
import browserSync from 'browser-sync';
import { config } from './config';

const postcssConfig: any = require('../postcss.config');
const postcssTransformer = postcss(postcssConfig.plugins);


export function postcss_transform(dir: string) {
    return (req: Request, res: Response) => {
        let fileSrc = path.join(dir, req.path);
        let fileDst = req.originalUrl;
        let options = { from: fileSrc, to: fileDst, ...postcssConfig.options }
        postcssTransformer.process(fs.readFileSync(fileSrc), options).then((result: any) => { res.contentType('css'); res.send(result.css) }).catch((err: any) => { console.log(err) })
    }
}

export function start_browserSync(port: number){
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