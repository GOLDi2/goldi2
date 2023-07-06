#!/usr/bin/env node

import { config } from "./config"
import express, { NextFunction, Request, Response } from 'express';
import nunjucks from 'nunjucks';
import path from 'path';
import { AddressInfo } from "net";
import { renderPageInit } from "./utils";
import { APIClient } from "@cross-lab-project/api-client"
import { AuthenticationServiceTypes } from "@cross-lab-project/api-client";
import expressWinston from 'express-winston';
import winston from 'winston';
import cookieParser from 'cookie-parser'
import asyncHandler from 'express-async-handler';
import { admin_router } from "./admin";
import { experiment_router } from "./experiment";

declare module 'express-serve-static-core' {
    interface Request {
        apiClient: APIClient
        user?: AuthenticationServiceTypes.User<'response'>
    }
}


const content_path = config.NODE_ENV === 'development' ? 'src/content' : path.dirname(__filename) + '/content';
const nunjucks_configuration = {
    autoescape: true,
    noCache: config.NODE_ENV === 'development'
}
const languages = ['en', 'de'];

const renderPage = renderPageInit(content_path, config.DEFAULT_LANGUAGE);

const app = express();

const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
    ],
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
    ),
})

app.set('etag', config.NODE_ENV !== 'development');
app.use((_req, res, next) => { res.removeHeader('X-Powered-By'); next(); });
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

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

app.use(expressWinston.logger({
    winstonInstance: logger,
    meta: true, // optional: control whether you want to log the meta data about the request (default to true)
    msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    ignoreRoute: function () { return false; } // optional: allows to skip some log messages based on request and/or response
}));

async function handle_login(req: Request, res: Response, next: NextFunction) {
    let loggedIn = false
    for (const method of ['tui', 'local'] as const) {
        try {
            await req.apiClient.login(req.body.username, req.body.password, { method });
            res.cookie('token', req.apiClient.accessToken, { secure: true, httpOnly: true, sameSite: 'strict' })
            loggedIn = true
            break;
        } catch (error) {
            logger.log('info', `Could not login with method '${method}`)
        }
    }
    if (loggedIn) {
        try {
            req.user = await req.apiClient.getIdentity()
            if (req.query.redirect) {
                res.redirect(303, req.query.redirect as string);
            } else {
                res.redirect(303, 'index.html' as string);
            }
        } catch (e) {
            logger.warn(e)
            res.clearCookie('token')
            next()
        }
    } else {
        res.clearCookie('token')
        logger.warn('user could not be logged in!')
        next()
    }
}

async function handle_logout(req: Request, res: Response, _next: NextFunction) {
    res.clearCookie('token')
    if (req.query.redirect) {
        res.redirect(303, req.query.redirect as string);
    } else {
        res.redirect(303, "/index.html" as string);
    }
}

app.use('/', asyncHandler(async (req: Request, res, next) => {
    req.apiClient = new APIClient(config.API_URL)
    req.user = undefined
    if (req.cookies.token) {
        try {
            req.apiClient.accessToken = req.cookies.token
            req.user = {
                ...await req.apiClient.getIdentity(),
                token: req.cookies.token
            }
        } catch (e) {
            logger.info(e)
            res.clearCookie('token')
        }
    }
    next()
}))

for (const language of languages) {
    app.post('/' + language + '/login.html', asyncHandler(handle_login));
    app.get('/' + language + '/logout.html', asyncHandler(handle_logout));
    app.use('/' + language + '/admin/', admin_router(language, renderPage, logger))
    app.use('/' + language + '/', experiment_router(language, renderPage, logger))
    app.get('/' + language + '/', asyncHandler(async (req, res) => { await renderPage('index', language, res, req.user); }));
    app.use('/' + language + '/', asyncHandler(async (req, res) => { await renderPage(req.path, language, res, req.user); }));
}

app.use('/', function (req, res) {
    const selected_language = req.acceptsLanguages(languages) || config.DEFAULT_LANGUAGE;
    res.redirect(307, '/' + selected_language + req.originalUrl);
});

app.use(expressWinston.errorLogger({ winstonInstance: logger }));

if (config.NODE_ENV === 'development') {
    // When developing, we start a browserSync server after listen
    const { start_browserSync } = require("./debug_utils");
    const server = app.listen(() => start_browserSync((server.address() as AddressInfo).port));
} else {
    // Just listen on the configured port
    app.listen(config.PORT);
}