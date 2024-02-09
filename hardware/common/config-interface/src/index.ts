#!/usr/bin/env node
import { spawn, spawnSync } from "child_process";
import express from "express";
import fs from "fs";
import https from "https";
import http from "http";
import ini from "ini";
import multer from "multer";
import { AddressInfo } from "net";
import nunjucks from "nunjucks";
import path from "path";

import { pam_auth } from "./auth";
import { config } from "./config";
import { createProcessInterface } from "./process_interface";
import { createSSLCertificate, renderPageInit } from "./utils";

const app = express();

app.use(pam_auth("Admin Area"));

const multipart = multer({ dest: "/tmp/" });

const content_path = path.join(
  __dirname,
  "..",
  config.NODE_ENV === "development" ? "src" : "app",
  "content"
);
const nunjucks_configuration = {
  autoescape: true,
  noCache: config.NODE_ENV === "development",
};

nunjucks.configure(content_path + "/templates", {
  ...nunjucks_configuration,
  express: app,
});

const languages = ["en"];
const renderPage = renderPageInit(content_path, config.DEFAULT_LANGUAGE);

const router = express.Router();

// Firmware Upload

const firmwareFuns = createProcessInterface(router, "/upload_firmware_show");
router.post("/upload_firmware", multipart.single("file"), async (req, res) => {
  if (!req.authorized) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const command = `rauc install ${(req as any).file.path} && reboot`;
  firmwareFuns.setProcess(spawn(command, { shell: true }));
  await renderPage(req.path, req.language, res, {
    authorized: req.authorized,
  });
});

// Manual Control

/*createProcessInterface(router, '/manual_control', () => {
  return spawn('manual_control', {shell: true});
});*/

// Network Configuration

router.all("/network", multipart.none(), async (req, res) => {
  let network_settings = ini.parse(
    fs
      .readFileSync(config.NETWORK_CONFIG_FILE, "utf-8")
      .replace(/Address=/g, "Address[]=")
      .replace(/DNS=/g, "DNS[]=")
  );
  if (req.body) {
    network_settings = {
      ...network_settings,
      Network: {
        ...network_settings.Network,
        DHCP: req.body.dhcp ? "yes" : "no",
        Address: req.body.address.split(";"),
        Gateway: req.body.gateway,
        DNS: req.body.dns.split(";"),
      },
      Address: {
        Address: "169.254.79.79/16",
      },
    };
    fs.writeFileSync(
      config.NETWORK_CONFIG_FILE,
      ini
        .stringify(network_settings)
        .replace(/\[\]/g, "")
        .replace(/^.*=\n/gm, "")
    );
    if (config.NODE_ENV !== "development")
      spawnSync("systemctl restart systemd-networkd.service", { shell: true });
  }
  await renderPage(req.path, req.language, res, {
    dhcp: network_settings.Network.DHCP == "yes",
    address: network_settings.Network.Address
      ? network_settings.Network.Address.join(";")
      : "",
    gateway: network_settings.Network.Gateway,
    dns: network_settings.Network.DNS
      ? network_settings.Network.DNS.join(";")
      : "",
    authorized: req.authorized,
  });
});

const wpa_network_regex = /^network={(.*?)}$/gms;
const scan_result_regex =
  /^\w\w(?::\w\w)+[\t ]+[^\s]+[\t ]+[^\s]+[\t ]+([^\s]+)[\t ]+(.*?)$/gm;
const security_key_mgmt_map = new Map([
  ["none", "NONE"],
  ["personal", "WPA-PSK"],
  ["enterprise", "WPA-EAP"],
]);
const key_mgmt_security_map = new Map([
  ["NONE", "none"],
  ["WPA-PSK", "personal"],
  ["WPA-EAP", "enterprise"],
]);
router.all("/wireless", multipart.none(), async (req, res) => {
  let network_settings = ini.parse(
    fs
      .readFileSync(config.WIRELESS_NETWORK_CONFIG_FILE, "utf-8")
      .replace(/Address=/g, "Address[]=")
      .replace(/DNS=/g, "DNS[]=")
  );

  const wpa_file_content = fs.readFileSync(
    config.WPA_SUPPLICANT_CONFIG_FILE,
    "utf-8"
  );
  const wpa_network_raw = wpa_network_regex.exec(wpa_file_content);
  let wpa_network: { [key: string]: string | undefined } = {};
  if (wpa_network_raw) {
    const _wpa_network = ini.parse(wpa_network_raw[1]);
    if (_wpa_network.ssid !== "GOLDi Config Interface") {
      wpa_network = _wpa_network;
    }
  }

  const scan_string = spawnSync(
    "wpa_cli scan > /dev/null && wpa_cli scan_results",
    { shell: true }
  ).stdout.toString();
  const scan_result: { flags: string; ssid: string }[] = [];
  let m: RegExpExecArray | null;
  while ((m = scan_result_regex.exec(scan_string)) !== null) {
    scan_result.push({ flags: m[1], ssid: m[2] });
  }

  if (req.body) {
    network_settings = {
      ...network_settings,
      Network: {
        ...network_settings.Network,
        DHCP: req.body.dhcp ? "yes" : "no",
        Address: req.body.address.split(";"),
        Gateway: req.body.gateway,
        DNS: req.body.dns.split(";"),
      },
    };
    wpa_network = {
      ssid: req.body[req.body.security + "_ssid"],
      eap: req.body[req.body.security + "_eap"],
      phase2: req.body[req.body.security + "_phase2"],
      identity: req.body[req.body.security + "_identity"],
      anonymous_identity: req.body[req.body.security + "_anonymous_identity"],
      password:
        req.body.security == "enterprise"
          ? req.body[req.body.security + "_password"]
          : undefined,
      psk:
        req.body.security != "enterprise"
          ? req.body[req.body.security + "_password"]
          : undefined,
      key_mgmt: security_key_mgmt_map.get(req.body.security),
    };

    fs.writeFileSync(
      config.WIRELESS_NETWORK_CONFIG_FILE,
      ini
        .stringify(network_settings)
        .replace(/\[\]/g, "")
        .replace(/^.*=\n/gm, "")
    );

    let stringified_wpa_network = "";
    if (wpa_network.ssid) {
      stringified_wpa_network = `\nnetwork={\n    ssid="${wpa_network.ssid}"\n`;

      if (wpa_network.key_mgmt)
        stringified_wpa_network += `    key_mgmt=${wpa_network.key_mgmt}\n`;
      if (wpa_network.eap)
        stringified_wpa_network += `    eap=${wpa_network.eap}\n`;
      if (wpa_network.phase2)
        stringified_wpa_network += `    phase2="${wpa_network.phase2}"\n`;
      if (wpa_network.identity)
        stringified_wpa_network += `    identity="${wpa_network.identity}"\n`;
      if (wpa_network.anonymous_identity)
        stringified_wpa_network += `    anonymous_identity="${wpa_network.anonymous_identity}"\n`;
      if (wpa_network.password)
        stringified_wpa_network += `    password="${wpa_network.password}"\n`;
      if (wpa_network.psk)
        stringified_wpa_network += `    psk="${wpa_network.password}"\n`;

      stringified_wpa_network += "}\n";
    }

    const stringified_wpa_conf = `ctrl_interface=/var/run/wpa_supplicant
ctrl_interface_group=0
${stringified_wpa_network}
network={
    frequency=2437
    ssid="GOLDi Config Interface"
    mode=2
    key_mgmt=NONE
}`;
    fs.writeFileSync(config.WPA_SUPPLICANT_CONFIG_FILE, stringified_wpa_conf);

    if (config.NODE_ENV !== "development") {
      spawnSync(
        "wpa_cli reconfigure; systemctl restart systemd-networkd.service",
        { shell: true }
      );
    }
  }

  await renderPage(req.path, req.language, res, {
    scanned_networks: scan_result,
    ssid: wpa_network.ssid,
    eap: wpa_network.eap,
    phase2: wpa_network.phase2,
    identity: wpa_network.identity,
    anonymous_identity: wpa_network.anonymous_identity,
    password: wpa_network.password ?? wpa_network.psk,
    dhcp: network_settings.Network.DHCP == "yes",
    address: network_settings.Network.Address
      ? network_settings.Network.Address.join(";")
      : "",
    gateway: network_settings.Network.Gateway,
    dns: network_settings.Network.DNS
      ? network_settings.Network.DNS.join(";")
      : "",
    authorized: req.authorized,
    security: key_mgmt_security_map.get(wpa_network.key_mgmt ?? ""),
  });
});

// Crosslab Setup

router.all("/crosslab", multipart.none(), async (req, res) => {
  if (!req.authorized) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let crosslab_settings: any = {};
  try {
    crosslab_settings = JSON.parse(
      fs.readFileSync(config.CROSSLAB_CONFIG_FILE, "utf-8")
    );
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
    fs.writeFileSync(
      config.CROSSLAB_CONFIG_FILE,
      JSON.stringify(crosslab_settings)
    );
    spawnSync("systemctl restart goldi-crosslab.service", { shell: true });
  }
  await renderPage(req.path, req.language, res, {
    id: crosslab_settings.deviceId,
    token: crosslab_settings.authToken,
    url: crosslab_settings.url,
    authorized: req.authorized,
  });
});

// General Setup

router.use("/", async (req, res) => {
  await renderPage(req.path, req.language, res, { authorized: req.authorized });
});

// IMG paths
app.use("/img", express.static(path.join(content_path, "img")));

// CSS paths
if (config.NODE_ENV === "development") {
  // When developing, we dynamically transform the css files with postcss
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { postcss_transform } = require("./debug_utils");
  app.use("/css", postcss_transform(path.join(content_path, "css")));
} else {
  // For production, we use precompiled css files
  app.use("/css", express.static(path.join(content_path, "css")));
}

// HTML paths
for (const language of languages) {
  app.get("/" + language + "/", async (req, res) => {
    await renderPage("index", language, res, { authorized: req.authorized });
  });
  app.use(
    "/" + language + "/",
    async (req, _res, next) => {
      req.language = language;
      next();
    },
    router
  );
}

app.get("/", function (req, res) {
  const selected_language =
    req.acceptsLanguages(languages) || config.DEFAULT_LANGUAGE;
  res.redirect(307, "/" + selected_language + req.originalUrl);
});

if (config.NODE_ENV === "development") {
  // When developing, we start a browserSync server after listen
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { start_browserSync } = require("./debug_utils");
  const server = https
    .createServer(createSSLCertificate("./"), app)
    .listen(() => start_browserSync((server.address() as AddressInfo).port));
} else {
  // Just listen on the configured port
  https
    .createServer(createSSLCertificate("/data/certificates/"), app)
    .listen(config.PORT);

  http.createServer((_req, res)=>{
    res.writeHead(302, { "Location": "https://goldi1.local/" });
    res.end();
  }).listen(80);
}
