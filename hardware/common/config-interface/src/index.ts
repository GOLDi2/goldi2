import express from "express";
import nunjucks from "nunjucks";
import multer from "multer";
import { spawnSync } from 'child_process';
import { config } from "./config";
import path from 'path';
import { renderPageInit } from "./utils";

const app = express();

const firmware_upload = multer({dest: '/tmp/'});

const content_path = config.NODE_ENV === 'development' ? 'src/content' : 'dist/content';
const nunjucks_configuration = {
    autoescape: true,
    noCache: config.NODE_ENV === 'development'
}

nunjucks.configure(content_path + '/templates', { ...nunjucks_configuration, express: app });

const languages = ['en'];
const renderPage = renderPageInit(content_path, config.DEFAULT_LANGUAGE);

let router = express.Router();

router.post('/upload_firmware', firmware_upload.single('file'), async ( req, res, next ) => {
    let {stderr, stdout} = spawnSync(`rauc install ${(req as any).file.path}`, {shell: true});
    await renderPage(req.path, (req as any).language, res, {stderr, stdout});
});

router.use('/', async (req, res) => { await renderPage(req.path, (req as any).language, res); });

// IMG paths
app.use("/img", express.static(path.join(content_path, 'img')));

// CSS paths
if (config.NODE_ENV === 'development') {
    // When developing, we dynamically transform the css files with postcss
    const { postcss_transform } = require("./debug_utils");
    app.use("/css", postcss_transform(path.join(content_path, 'css')));
} else {
    // For production, we use precompiled css files
    app.use("/css", express.static(path.join(content_path, 'css')));
}

// HTML paths
for (const language of languages) {
    app.get('/' + language + '/', async (req, res) => { await renderPage('index', language, res); });
    app.use('/' + language + '/', async (req, res, next) => { (req as any).language=language; next(); }, router);
}
app.get('/', function (req, res) {
    const selected_language = req.acceptsLanguages(languages) || config.DEFAULT_LANGUAGE;
    res.redirect(307, '/' + selected_language + req.originalUrl);
});

app.listen( config.PORT );