import { withSentryConfig } from "@sentry/nextjs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isMobileApp = process.env.NEXT_PUBLIC_IS_MOBILE === "true";
/** @type {import('next').NextConfig} */
let config = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  reactStrictMode: false,
  outputFileTracingRoot: __dirname,
  webpack(config) {
    if (isMobileApp) {
      config.module.rules.push({
        test: /app\/(api|swagger)\/.*/,
        loader: "ignore-loader",
      });
    }
    // Configure SVG imports as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
};
if (isMobileApp) {
  config.output = "export";
  config.productionBrowserSourceMaps = true;
} else {
  config.rewrites = async () => {
    return [
      {
        source: "/announcements/direct/:id",
        destination: `https://${process.env.UPLOADTHING_APP_ID}.ufs.sh/f/:id`,
      },
      {
        source:
          "/:path((?!api|_next|swagger|assets|.well-known|js|favicon.ico|.*\\.).*)",
        destination: "/",
      },
    ];
  };
  config.headers = async () => {
    const headers = [
      {
        source: "/sw/:path*",
        headers: [{ key: "Service-Worker-Allowed", value: "/" }],
      },
    ];
    if (process.env.NODE_ENV === "development") {
      headers.push({
        source: "/api/:path*", // Apply to all API routes
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Allow all origins (use with caution)
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      });
    }
    return headers;
  };
  config = withSentryConfig(config, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "lumobc",

    project: "lumo",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    // tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  });
}
export default config;
