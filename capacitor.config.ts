import type { CapacitorConfig } from "@capacitor/cli";
import { DEFAULT_DOMAIN } from "./constants/website";

const config: CapacitorConfig = {
  appId: "com.lumobc.lumo",
  appName: "Lumo",
  webDir: "out",
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    BackgroundRunner: {
      label: "com.lumobc.lumo.notifications",
      src: "runners/check-notifications.js",
      event: "pingNotificationsCheck",
      repeat: true,
      interval: 10,
      autoStart: true,
    },
    StatusBar: {
      overlaysWebView: false,
    },
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true,
  },
  server: {
    hostname: DEFAULT_DOMAIN,
    androidScheme: "https",
  },
};

export default config;
