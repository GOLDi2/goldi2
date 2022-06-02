import express from "express";
import nunjucks from "nunjucks";
import multer from "multer";
import { spawn, spawnSync } from 'child_process';
import { config } from "./config";
import path from 'path';
import { renderPageInit } from "./utils";
import { AddressInfo } from "net";
import { EventEmitter } from 'events';
import ini from 'ini';
import fs from 'fs';
import https from "https";
import { pamAuthenticatePromise } from 'node-linux-pam';
import {execSync} from 'child_process';

function pam_auth(realm: string) {
    async function _pam_auth(req: express.Request, res: express.Response, next: express.NextFunction) {
        function send_auth() {
            res.header('WWW-Authenticate', 'Basic realm="' + realm + '"');
            res.status(401).send('Authentication required');
        }

        if (req.headers.authorization && req.headers.authorization.search('Basic ') === 0) {
            var decodedAuth = Buffer.from(req.headers.authorization.split(' ')[1], 'base64').toString().split(':');

            const options = {
                username: decodedAuth[0],
                password: decodedAuth[1],
            };

            pamAuthenticatePromise(options).then(() => {
                next();
            }).catch((err) => {
                send_auth();
                console.log("Failed Authentication Attemp: ", err)
            })
            return;
        }
        send_auth();
    }
    return _pam_auth;
}


const app = express();

app.use(pam_auth("Admin Area"))

const firmware_upload = multer({ dest: '/tmp/' });

const content_path = path.join(__dirname, '..', config.NODE_ENV === 'development' ? 'src' : 'dist', 'content');
const nunjucks_configuration = {
    autoescape: true,
    noCache: config.NODE_ENV === 'development'
}

nunjucks.configure(content_path + '/templates', { ...nunjucks_configuration, express: app });

const languages = ['en'];
const renderPage = renderPageInit(content_path, config.DEFAULT_LANGUAGE);

let router = express.Router();

let upload_firmware_emitter: EventEmitter | boolean = false;
let upload_firmware_out = ""
router.post('/upload_firmware', firmware_upload.single('file'), async (req, res, next) => {
    const command = `rauc install ${(req as any).file.path}`
    upload_firmware_out = command + '\n'
    upload_firmware_emitter = new EventEmitter()
    const rauc = spawn(command, { shell: true });
    rauc.stdout.on("data", (data) => { upload_firmware_out += data; (upload_firmware_emitter as EventEmitter).emit("changed") })
    rauc.stderr.on("data", (data) => { upload_firmware_out += data; (upload_firmware_emitter as EventEmitter).emit("changed") })
    await renderPage(req.path, (req as any).language, res, { upload_firmware_out });
    await new Promise(resolve => rauc.on('close', resolve));
    (upload_firmware_emitter as EventEmitter).emit("changed")
    upload_firmware_emitter = false
});
router.get('/upload_firmware_show', async (req, res, next) => {
    let reload = false
    if (upload_firmware_emitter) {
        reload = true
        await Promise.race([new Promise<void>(resolve => setTimeout(() => resolve(), 1000)), new Promise<void>(resolve => (upload_firmware_emitter as EventEmitter).once("changed", resolve))]);
    }
    await renderPage(req.path, (req as any).language, res, { upload_firmware_out, reload });
});

router.all('/network', firmware_upload.none(), async (req, res, next) => {
    let network_settings = ini.parse(fs.readFileSync(config.NETWORK_CONFIG_FILE, 'utf-8').replace(/Address=/g, "Address[]=").replace(/DNS=/g, "DNS[]="))
    if (req.body) {
        network_settings = {
            ...network_settings,
            Network: {
                ...network_settings.Network,
                DHCP: req.body.dhcp ? 'yes' : 'no',
                Address: req.body.address.split(";"),
                Gateway: req.body.gateway,
                DNS: req.body.dns.split(";"),
            },
            Address: {
                Address: "169.254.79.79/16"
            }
        }
        fs.writeFileSync(config.NETWORK_CONFIG_FILE, ini.stringify(network_settings).replace(/\[\]/g, "").replace(/^.*=\n/gm, ""))
        spawnSync('systemctl restart systemd-networkd.service', { shell: true });
    }
    await renderPage(req.path, (req as any).language, res, {
        dhcp: network_settings.Network.DHCP == 'yes',
        address: network_settings.Network.Address ? network_settings.Network.Address.join(";") : "",
        gateway: network_settings.Network.Gateway,
        dns: network_settings.Network.DNS ? network_settings.Network.DNS.join(";") : ""
    });

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
    app.use('/' + language + '/', async (req, res, next) => { (req as any).language = language; next(); }, router);
}
app.get('/', function (req, res) {
    const selected_language = req.acceptsLanguages(languages) || config.DEFAULT_LANGUAGE;
    res.redirect(307, '/' + selected_language + req.originalUrl);
});

function createSSLCertificate(path: string){
    if(!fs.existsSync(path+'key.pem')){
        execSync('openssl genrsa -out key.pem 2048')
    }
    if(!fs.existsSync(path+'cert.pem')){
        execSync('openssl req -x509 -sha256 -days 3650 -nodes \
                  -key '+path+'key.pem -out '+path+'cert.pem -subj "/CN=example.com" \
                  -addext "subjectAltName=DNS:example.com,DNS:www.example.net,IP:10.0.0.1"')
    }
    return {
        key: fs.readFileSync("key.pem"),
        cert: fs.readFileSync("cert.pem"),
    }
}

if (config.NODE_ENV === 'development') {
    // When developing, we start a browserSync server after listen
    const { start_browserSync } = require("./debug_utils");
    const server = https.createServer(createSSLCertificate(''),app).listen(() => start_browserSync((server.address() as AddressInfo).port));
} else {
    // Just listen on the configured port
    https.createServer(createSSLCertificate('/data/certificates'),app).listen(config.PORT);
}