import type { CapacitorConfig } from "@capacitor/cli";
import { WEBSITE_ROOT } from "./constants/website";

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
    CapacitorHttp: {
      enabled: true,
    },
  },
  server:
    process.env.NODE_ENV === "development"
      ? {
          hostname: WEBSITE_ROOT,
          androidScheme: "http",
        }
      : undefined,
};

export default config;
