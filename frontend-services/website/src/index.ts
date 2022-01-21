import { config } from "./config"
import express, { Response } from 'express';
import nunjucks from 'nunjucks';
import path from 'path';
import { AddressInfo } from "net";
import { renderPageInit } from "./utils";


const content_path = config.NODE_ENV === 'development' ? 'src/content' : 'dist/content';
const nunjucks_configuration = {
    autoescape: true,
    noCache: config.NODE_ENV === 'development'
}
const languages = ['en', 'de'];

const renderPage = renderPageInit(content_path, config.DEFAULT_LANGUAGE);



const app = express();

app.set('etag', config.NODE_ENV !== 'development');
app.use((_req, res, next) => { res.removeHeader('X-Powered-By'); next(); });

nunjucks.configure(content_path + '/templates', { ...nunjucks_configuration, express: app });

app.use("/img", express.static(path.join(content_path, 'img')));
if (config.NODE_ENV === 'development') {
    // When developing, we dynamically transform the css files with postcss
    const { postcss_transform } = require("./debug_utils");
    app.use("/css", postcss_transform(path.join(content_path, 'css')));
} else {
    // For production, we use precompiled css files
    app.use("/css", express.static(path.join(content_path, 'css')));
}
for (const language of languages) {
    app.get('/' + language + '/', async (req, res) => { await renderPage('index', language, res); });
    app.use('/' + language + '/', async (req, res) => { await renderPage(req.path, language, res); });
}
app.get('/', function (req, res) {
    const selected_language = req.acceptsLanguages(languages) || config.DEFAULT_LANGUAGE;
    res.redirect(307, '/' + selected_language + req.originalUrl);
});



if (config.NODE_ENV === 'development') {
    // When developing, we start a browserSync server after listen
    const { start_browserSync } = require("./debug_utils");
    const server = app.listen(() => start_browserSync((server.address() as AddressInfo).port));
} else {
    // Just listen on the configured port
    app.listen(config.PORT);
}