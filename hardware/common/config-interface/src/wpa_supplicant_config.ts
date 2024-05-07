#!/usr/bin/env node
import fs from "fs";
import ini from "ini";

import { config } from "./config";

const wpa_network_regex = /^network={(.*?)}$/gms;
const wpa_user_managed_regex =
  /^# start user managed\n(.*?)# end user managed$/gms;

export class WpaSupplicantConfig {
  public network: {
    ssid?: string;
    eap?: string;
    phase2?: string;
    identity?: string;
    anonymous_identity?: string;
    password?: string;
    psk?: string;
    key_mgmt?: "NONE" | "WPA-PSK" | "WPA-EAP";
  } = {};

  constructor() {
    this.read();
  }

  private read() {
    const wpa_file_content = fs.readFileSync(
      config.WPA_SUPPLICANT_CONFIG_FILE,
      "utf-8"
    );
    const user_managed_section = wpa_user_managed_regex.exec(wpa_file_content);

    const wpa_network = wpa_network_regex.exec(
      (user_managed_section && user_managed_section[1]) ?? ""
    );

    this.network = (wpa_network && ini.parse(wpa_network[1])) ?? {};
  }

  private stringify_network() {
    let ret = "";
    if (this.network.ssid) {
      ret = `network={\n    ssid="${this.network.ssid}"\n`;

      if (this.network.key_mgmt)
        ret += `    key_mgmt=${this.network.key_mgmt}\n`;
      if (this.network.eap) ret += `    eap=${this.network.eap}\n`;
      if (this.network.phase2) ret += `    phase2="${this.network.phase2}"\n`;
      if (this.network.identity)
        ret += `    identity="${this.network.identity}"\n`;
      if (this.network.anonymous_identity)
        ret += `    anonymous_identity="${this.network.anonymous_identity}"\n`;
      if (this.network.password)
        ret += `    password="${this.network.password}"\n`;
      if (this.network.psk) ret += `    psk="${this.network.psk}"\n`;

      ret += "}\n";
    }
    return ret;
  }

  public write() {
    const wpa_file_content = fs.readFileSync(
      config.WPA_SUPPLICANT_CONFIG_FILE,
      "utf-8"
    );
    const wpa_file_content_new = wpa_file_content.replace(
      wpa_user_managed_regex,
      `# start user managed\n${this.stringify_network()}# end user managed`
    );
    fs.writeFileSync(config.WPA_SUPPLICANT_CONFIG_FILE, wpa_file_content_new);
  }
}
