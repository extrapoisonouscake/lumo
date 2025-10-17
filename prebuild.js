import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateSW } from "workbox-build";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isMobileApp = process.env.NEXT_PUBLIC_IS_MOBILE === "true";

if (isMobileApp) {
  console.log("Skipping service worker generation for mobile app build");
  process.exit(0);
}
const SW_DIR = path.resolve(__dirname, "public/sw");
const SW_PATH = path.join(SW_DIR, "sw.js");
fs.rmSync(SW_DIR, { recursive: true, force: true });

const { count, size, warnings } = await generateSW({
  swDest: SW_PATH,
  // Runtime caching only - no precaching
  globDirectory: ".",
  globPatterns: [],
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  skipWaiting: true,
  clientsClaim: true,
  sourcemap: false,
  runtimeCaching: [
    {
      // Cache Next.js static files (JS, CSS, etc.)
      urlPattern: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: "CacheFirst",
      options: {
        cacheName: "next-static",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      // Cache asset files (images, fonts, etc.)
      urlPattern: ({ url }) => url.pathname.startsWith("/assets/"),
      handler: "CacheFirst",
      options: {
        cacheName: "assets",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      // Cache images from any source
      urlPattern: ({ url, request }) => request.destination === "image",
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
  ],
});

if (warnings.length > 0) {
  console.warn(
    "Warnings encountered while generating a service worker:",
    warnings.join("\n")
  );
}
console.log(
  `Generated a service worker, which will precache ${count} files, totaling ${size} bytes.`
);

let serviceWorkerContent = fs.readFileSync(SW_PATH, "utf8");
serviceWorkerContent += `\n// Timestamp: ${Date.now()}`;

fs.writeFileSync(SW_PATH, serviceWorkerContent);
