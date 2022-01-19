import browserSync from 'browser-sync';
import express, { Response } from 'express';
import shrinkRay from 'shrink-ray-current';
import nunjucks from 'nunjucks';
import path from 'path';
import fs from 'fs';
import postcss from 'postcss';

const postcssConfig: any = require('../postcss.config');
const postcssTransformer = postcss(postcssConfig.plugins);
postcssTransformer.plugins

const app = express();
const port = 9777; // "xprs" in T9

// you can conditionally add routes and behaviour based on environment
const isProduction = 'production' === process.env.NODE_ENV;

process.on("SIGHUP", () => {
    process.exit(1);
});

app.set('etag', isProduction);
app.use((_req, res, next) => { res.removeHeader('X-Powered-By'); next(); });
app.use(shrinkRay());
app.use('/css', async function (req, res) {
    let fileSrc=path.join('src/content/css',req.path)
    let fileDst=path.join('css',req.path)
    let options = {from: fileSrc, to: fileDst, ...postcssConfig.options}
    postcssTransformer.process(fs.readFileSync(fileSrc),options).then(result => {res.contentType('css');res.send(result.css)}).catch(err => {console.log(err)})
});

app.use("/img", express.static(path.join('src/content/img')));

nunjucks.configure('src/content/templates', {
    autoescape: true,
    noCache: true,
    express: app
});

function renderPage(page: string, language: string, res: Response){
    const base_path='src/content/templates';
    const page_dir='pages';
    const default_language='en';
    if (fs.existsSync(path.join(base_path,page_dir,page+'_'+language+'.html'))){
        res.render(path.join(page_dir,page+'_'+language+'.html'), {language});
    }else if(fs.existsSync(path.join(base_path,page_dir,page+'_'+default_language+'.html'))){
        res.render(path.join(page_dir,page+'_'+default_language+'.html'), {language});
    }else if(fs.existsSync(path.join(base_path,page_dir,page+'.html'))){
        res.render(path.join(page_dir,page+'.html'), {language});
    }else{
        res.render(path.join(page_dir,'404.html'), {language});
    };
}

app.use('/en/', function (req, res) {
    renderPage(req.path.replace(/\.html$/, ''), 'en', res);
});

app.use('/de/', function (req, res) {
    renderPage(req.path.replace(/\.html$/, ''), 'de', res);
});

app.use('/', function (req, res) {
    renderPage(req.path.replace(/\.html$/, ''), 'en', res);
});

app.listen(port, listening);

function listening() {
    console.log(`Demo server available on http://localhost:${port}`);
    if (!isProduction) {
        // https://ponyfoo.com/articles/a-browsersync-primer#inside-a-node-application
        browserSync({
            files: ['src/**/*.{html,js,css}'],
            online: false,
            open: false,
            port: port + 1,
            proxy: 'localhost:' + port,
            ui: false,
        });
    }
}