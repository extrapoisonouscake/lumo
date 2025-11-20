import { isProduction } from "./core";
export const WEBSITE_TITLE = "Lumo";

export interface WebsitePage {
  name: string;
  isHiddenInSidebar?: boolean;
  showOnMobile?: boolean;
  showOnDesktop?: boolean;
}
export const unauthenticatedPathnames = ["/login", "/register"];
export const publicPathnames = [
  "/maintenance",
  "/legal/privacy-policy",
  "/support",
];
export const websitePagesWithStaticPaths: Record<string, WebsitePage> = {
  "/": {
    name: "Home",

    showOnMobile: true,
  },
  "/classes": {
    name: "Classes",

    showOnMobile: true,
  },
  "/schedule": {
    name: "Schedule",

    showOnMobile: true,
  },
  "/transcript": {
    name: "Transcript",

    showOnMobile: true,
  },

  "/settings": {
    name: "Settings",
  },
  "/profile": { name: "Profile", isHiddenInSidebar: true },
};
export const VISIBLE_DATE_FORMAT = "MM/DD/YYYY";
export const VISIBLE_TIME_FORMAT = "h:mm A";
export const APP_STORE_APP_ID = "6752838080";

const isProductionOverride =
  process.env.NEXT_PUBLIC_HTTP_NODE_ENV_OVERRIDE === "production";
const shouldUseProductionDomain = isProductionOverride || isProduction;
export const DEFAULT_DOMAIN = shouldUseProductionDomain
  ? "lumobc.ca"
  : "localhost";
export const CF_WORKER_URL = shouldUseProductionDomain
  ? "https://worker.lumobc.ca"
  : "http://localhost:8787";
const NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL =
  process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL; //no other syntax allowed due to Vercel
export const WEBSITE_ROOT = shouldUseProductionDomain
  ? `https://${NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL || DEFAULT_DOMAIN}`
  : `http://${DEFAULT_DOMAIN}:3000`;
