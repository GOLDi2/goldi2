import { config } from "./config"
import express, { Response } from 'express';
import nunjucks from 'nunjucks';
import path from 'path';
import fs from 'fs';
import { AddressInfo } from "net";


const content_path = config.NODE_ENV === 'development' ? 'src/content' : 'dist/content';
const nunjucks_configuration = {
    autoescape: true,
    noCache: config.NODE_ENV === 'development'
}

const app = express();

app.set('etag', config.NODE_ENV !== 'development');
app.use((_req, res, next) => { res.removeHeader('X-Powered-By'); next(); });

nunjucks.configure(content_path + '/templates', { ...nunjucks_configuration, express: app });

app.use("/img", express.static(path.join(content_path, 'img')));
if (config.NODE_ENV === 'development') {
    // When developing, we dynamically transform the css files with postcss
    const { postcss_transform } = require("./debug_utils");
    app.use("/css", postcss_transform(path.join(content_path, 'css')));
}else{
    // For production, we use precompiled css files
    app.use("/css", express.static(path.join(content_path, 'css')));

}

function renderPage(page: string, language: string, res: Response) {
    const base_path = 'src/content/templates';
    const page_dir = 'pages';
    const default_language = 'en';
    if (fs.existsSync(path.join(base_path, page_dir, page + '_' + language + '.html'))) {
        res.render(path.join(page_dir, page + '_' + language + '.html'), { language });
    } else if (fs.existsSync(path.join(base_path, page_dir, page + '_' + default_language + '.html'))) {
        res.render(path.join(page_dir, page + '_' + default_language + '.html'), { language });
    } else if (fs.existsSync(path.join(base_path, page_dir, page + '.html'))) {
        res.render(path.join(page_dir, page + '.html'), { language });
    } else {
        res.render(path.join(page_dir, '404.html'), { language });
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

if (config.NODE_ENV === 'development') {
    // When developing, we start a browserSync server after listen
    const { start_browserSync } = require("./debug_utils");
    const server=app.listen(()=>start_browserSync((server.address() as AddressInfo).port));
} else {
    // Just listen on the configured port
    app.listen(config.PORT);
}