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
fs.rmSync(SW_DIR, { recursive: true, force: true });
const SW_PATH = path.join(SW_DIR, "sw.js");

const { count, size, warnings, manifestEntries } = await generateSW({
  swDest: SW_PATH,
  // Precache Next.js static files
  globDirectory: ".next/static",
  globPatterns: [
    "**/*.{js,css,woff,woff2,ttf,otf,eot,svg,png,jpg,jpeg,gif,webp,ico,json}",
  ],
  globIgnores: ["chunks/app/api/**", "chunks/app/swagger/**"],
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  skipWaiting: true,
  clientsClaim: true,
  sourcemap: false,
  navigateFallback: "/",
  navigateFallbackDenylist: [/^\/api\//, /^\/swagger\//, /^\/_next\//],
  // Convert .next/static paths to _next/static for web URLs
  manifestTransforms: [
    (manifestEntries) => {
      const manifest = manifestEntries.map((entry) => {
        entry.url = `_next/static/${entry.url}`;
        return entry;
      });
      return { manifest };
    },
  ],
  runtimeCaching: [
    {
      // Cache HTML pages (navigation requests) for SPA offline support
      urlPattern: ({ request }) => request.mode === "navigate",
      handler: "NetworkFirst",
      options: {
        cacheName: "pages",
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
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
    warnings.join("\n"),
    manifestEntries
  );
}
console.log(
  `Generated a service worker, which will precache ${count} files, totaling ${size} bytes.`
);

let serviceWorkerContent = fs.readFileSync(SW_PATH, "utf8");
serviceWorkerContent += `\n// Timestamp: ${Date.now()}`;

fs.writeFileSync(SW_PATH, serviceWorkerContent);
