#!/usr/bin/env node
import { execSync } from 'child_process';
import cookieParser from 'cookie-parser';
import express from 'express';
import asyncHandler from 'express-async-handler';
import expressWinston from 'express-winston';
import { AddressInfo } from 'net';
import nunjucks from 'nunjucks';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';

import { config } from './config.js';
import { ApplicationDataSource, init_database } from './database/datasource.js';
import { DeviceModel } from './database/model.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const content_path =
  config.NODE_ENV === 'development' ? 'src/content' : __dirname + '/content';
const nunjucks_configuration = {
  autoescape: true,
  noCache: config.NODE_ENV === 'development',
};

init_database();

const app = express();

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
});

app.set('etag', config.NODE_ENV !== 'development');
app.use((_req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());

nunjucks.configure(content_path + '/templates', {
  ...nunjucks_configuration,
  express: app,
});

app.use('/img', express.static(path.join(content_path, 'img')));
if (config.NODE_ENV === 'development') {
  // When developing, we dynamically transform the css files with postcss
  let postcss_transform: ReturnType<typeof import('./debug_utils.js').postcss_transform>;
  import('./debug_utils.js').then(debug_utils => {
    postcss_transform = debug_utils.postcss_transform(path.join(content_path, 'css'));
  });
  app.use('/css', (req, res) => postcss_transform(req, res));
} else {
  // For production, we use precompiled css files
  app.use('/css', express.static(path.join(content_path, 'css')));
}

app.use(
  expressWinston.logger({
    winstonInstance: logger,
    // optional: control whether you want to log the meta data about the request (default to true)
    meta: true,
    // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
    msg: 'HTTP {{req.method}} {{req.url}}',
    // Use the default Express/morgan request formatting. Enabling this will override any msg if true.
    expressFormat: true,
    // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
    colorize: true,
    ignoreRoute: function () {
      return false;
    }, // optional: allows to skip some log messages based on request and/or response
  }),
);

app.get('/', async (_req, res, next) => {
  try {
    const devices = await ApplicationDataSource.manager.findBy(DeviceModel, {});
    res.render('./pages/index.html', { devices });
  } catch (e) {
    next(e);
  }
});

app.get('/updates/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const current_version = req.query.current_version;
    const device = await ApplicationDataSource.manager.findOneByOrFail(DeviceModel, {
      id,
    });
    device.last_contact = new Date();
    if (current_version) device.current_version = current_version as string;
    await ApplicationDataSource.manager.save(DeviceModel, device);
    if (current_version === device.target_version) res.status(204).send();
    else if (device.target_url) res.status(303).location(device.target_url).send();
    else res.status(204).send();
  } catch (e) {
    next(e);
  }
});

app.post(
  '/add',
  asyncHandler(async (req, res) => {
    const { id, name } = req.body;

    await ApplicationDataSource.manager.insert(DeviceModel, { id, name });
    res.status(201).send();
  }),
);

app.post(
  '/name',
  asyncHandler(async (req, res) => {
    const { id, name } = req.body;

    const device = await ApplicationDataSource.manager.findOneByOrFail(DeviceModel, {
      id,
    });
    device.name = name;
    await ApplicationDataSource.manager.save(DeviceModel, device);
    res.status(201).send();
  }),
);

app.post(
  '/delete',
  asyncHandler(async (req, res) => {
    const { id } = req.body;

    await ApplicationDataSource.manager.delete(DeviceModel, { id });
    res.status(201).send();
  }),
);

app.post(
  '/update',
  asyncHandler(async (req, res) => {
    const { url, ids } = req.body;

    const info_raw = execSync('rauc info --no-verify --output-format=json ' + url, {
      stdio: 'pipe',
    }).toString();

    const { version } = JSON.parse(info_raw);

    const devices = await Promise.all(
      ids.map((id: string) =>
        ApplicationDataSource.manager.findOneBy(DeviceModel, { id }),
      ),
    );
    devices.forEach(async device => {
      device.target_url = url;
      device.target_version = version;
    });
    await ApplicationDataSource.manager.save(devices);

    res.status(201).send();
  }),
);

app.use(expressWinston.errorLogger({ winstonInstance: logger }));

if (config.NODE_ENV === 'development') {
  // When developing, we start a browserSync server after listen
  import('./debug_utils.js').then(debug_utils => {
    const server = app.listen(() =>
      debug_utils.start_browserSync((server.address() as AddressInfo).port),
    );
  });
} else {
  // Just listen on the configured port
  app.listen(config.PORT);
}
