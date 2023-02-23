#!/usr/bin/env node
import {spawn, spawnSync} from 'child_process';
import express from 'express';
import fs from 'fs';
import https from 'https';
import ini from 'ini';
import multer from 'multer';
import {AddressInfo} from 'net';
import nunjucks from 'nunjucks';
import path from 'path';

import {pam_auth} from './auth';
import {config} from './config';
import {createProcessInterface} from './process_interface';
import {createSSLCertificate, renderPageInit} from './utils';

const app = express();

app.use(pam_auth('Admin Area'));

const firmware_upload = multer({dest: '/tmp/'});

const content_path = path.join(__dirname, '..', config.NODE_ENV === 'development' ? 'src' : 'app', 'content');
const nunjucks_configuration = {
  autoescape: true,
  noCache: config.NODE_ENV === 'development',
};

nunjucks.configure(content_path + '/templates', {
  ...nunjucks_configuration,
  express: app,
});

const languages = ['en'];
const renderPage = renderPageInit(content_path, config.DEFAULT_LANGUAGE);

const router = express.Router();

// Firmware Upload

const firmwareFuns = createProcessInterface(router, '/upload_firmware_show');
router.post('/upload_firmware', firmware_upload.single('file'), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const command = `rauc install ${(req as any).file.path} && reboot`;
  firmwareFuns.setProcess(spawn(command, {shell: true}));
  await renderPage(req.path, req.language, res);
});

// Manual Control

createProcessInterface(router, '/manual_control', () => {
  return spawn('manual_control', {shell: true});
});

// Network Configuration

router.all('/network', firmware_upload.none(), async (req, res) => {
  let network_settings = ini.parse(
    fs
      .readFileSync(config.NETWORK_CONFIG_FILE, 'utf-8')
      .replace(/Address=/g, 'Address[]=')
      .replace(/DNS=/g, 'DNS[]='),
  );
  if (req.body) {
    network_settings = {
      ...network_settings,
      Network: {
        ...network_settings.Network,
        DHCP: req.body.dhcp ? 'yes' : 'no',
        Address: req.body.address.split(';'),
        Gateway: req.body.gateway,
        DNS: req.body.dns.split(';'),
      },
      Address: {
        Address: '169.254.79.79/16',
      },
    };
    fs.writeFileSync(
      config.NETWORK_CONFIG_FILE,
      ini
        .stringify(network_settings)
        .replace(/\[\]/g, '')
        .replace(/^.*=\n/gm, ''),
    );
    spawnSync('systemctl restart systemd-networkd.service', {shell: true});
  }
  await renderPage(req.path, req.language, res, {
    dhcp: network_settings.Network.DHCP == 'yes',
    address: network_settings.Network.Address ? network_settings.Network.Address.join(';') : '',
    gateway: network_settings.Network.Gateway,
    dns: network_settings.Network.DNS ? network_settings.Network.DNS.join(';') : '',
  });
});

// Crosslab Setup

router.all('/crosslab', firmware_upload.none(), async (req, res) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let crosslab_settings: any = {};
  try {
    crosslab_settings = JSON.parse(fs.readFileSync(config.CROSSLAB_CONFIG_FILE, 'utf-8'));
  } catch {
    /* empty */
  }
  if (req.body) {
    crosslab_settings = {
      ...crosslab_settings,
      deviceId: req.body.id,
      authToken: req.body.token,
      url: req.body.url,
    };
    fs.writeFileSync(config.CROSSLAB_CONFIG_FILE, JSON.stringify(crosslab_settings));
    spawnSync('systemctl restart goldi-crosslab.service', {shell: true});
  }
  await renderPage(req.path, req.language, res, {
    id: crosslab_settings.deviceId,
    token: crosslab_settings.authToken,
    url: crosslab_settings.url,
  });
});

// General Setup

router.use('/', async (req, res) => {
  await renderPage(req.path, req.language, res);
});

// IMG paths
app.use('/img', express.static(path.join(content_path, 'img')));

// CSS paths
if (config.NODE_ENV === 'development') {
  // When developing, we dynamically transform the css files with postcss
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {postcss_transform} = require('./debug_utils');
  app.use('/css', postcss_transform(path.join(content_path, 'css')));
} else {
  // For production, we use precompiled css files
  app.use('/css', express.static(path.join(content_path, 'css')));
}

// HTML paths
for (const language of languages) {
  app.get('/' + language + '/', async (_req, res) => {
    await renderPage('index', language, res);
  });
  app.use(
    '/' + language + '/',
    async (req, _res, next) => {
      req.language = language;
      next();
    },
    router,
  );
}
app.get('/', function (req, res) {
  const selected_language = req.acceptsLanguages(languages) || config.DEFAULT_LANGUAGE;
  res.redirect(307, '/' + selected_language + req.originalUrl);
});

if (config.NODE_ENV === 'development') {
  // When developing, we start a browserSync server after listen
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const {start_browserSync} = require('./debug_utils');
  const server = https
    .createServer(createSSLCertificate('./'), app)
    .listen(() => start_browserSync((server.address() as AddressInfo).port));
} else {
  // Just listen on the configured port
  https.createServer(createSSLCertificate('/data/certificates/'), app).listen(config.PORT);
}
