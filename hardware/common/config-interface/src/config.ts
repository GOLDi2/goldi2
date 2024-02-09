import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.GOLDI_HARDWARE_ADMIN_PORT ? parseInt(process.env.GOLDI_HARDWARE_ADMIN_PORT) : 443,
  DEFAULT_LANGUAGE: process.env.GOLDI_HARDWARE_ADMIN_DEFAULT_LANGUAGE || 'en',
  NETWORK_CONFIG_FILE: process.env.GOLDI_HARDWARE_ADMIN_NETWORK_CONFIG_FILE || '/lib/systemd/network/80-wired.network',
  WIRELESS_NETWORK_CONFIG_FILE: process.env.GOLDI_HARDWARE_ADMIN_WIRELESS_NETWORK_CONFIG_FILE || '/lib/systemd/network/80-wireless.network',
  WPA_SUPPLICANT_CONFIG_FILE: process.env.GOLDI_HARDWARE_ADMIN_WPA_SUPPLICANT_CONFIG_FILE || '/etc/wpa_supplicant/wpa_supplicant-wlan0.conf',
  CROSSLAB_CONFIG_FILE: process.env.GOLDI_HARDWARE_ADMIN_CROSSLAB_CONFIG_FILE || '/data/crosslab',
  NODE_ENV: process.env.NODE_ENV || 'production',
};
