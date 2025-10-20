import type { CapacitorConfig } from "@capacitor/cli";
import { WEBSITE_TITLE } from "./constants/website";

const config: CapacitorConfig = {
  appId: "com.lumobc.lumo",
  appName: WEBSITE_TITLE,
  webDir: "out",
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    StatusBar: {
      overlaysWebView: false,
    },
    CapacitorHttp: {
      enabled: true,
    },
  },
  ios: {
    limitsNavigationsToAppBoundDomains: true,
  },
  server: {
    hostname: process.env.NODE_ENV === "production" ? "lumobc.ca" : "localhost",
    androidScheme: "https",
  },
};

export default config;
