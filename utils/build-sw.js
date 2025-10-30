import fs from "fs";
import path from "path";
import { generateSW } from "workbox-build";

const isMobileApp = process.env.NEXT_PUBLIC_IS_MOBILE === "true";

if (isMobileApp) {
  console.log("Skipping service worker generation for mobile app build");
  process.exit(0);
}
const rootDir = process.cwd();
const SW_DIR = path.resolve(rootDir, "public/sw");
fs.rmSync(SW_DIR, { recursive: true, force: true });
const SW_PATH = path.join(SW_DIR, "sw.js");

// Collect files from public/assets for precaching
function getAssetsFiles(dir, baseDir = dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAssetsFiles(fullPath, baseDir, files);
    } else {
      const relativePath = path.relative(baseDir, fullPath);
      files.push(relativePath);
    }
  }
  return files;
}

const ASSETS_DIR = path.resolve(rootDir, "public/assets");
const assetFiles = getAssetsFiles(ASSETS_DIR).map((file) => ({
  url: `/assets/${file.replace(/\\/g, "/")}`,
  revision: fs.statSync(path.join(ASSETS_DIR, file)).mtime.getTime().toString(),
}));

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
  cleanupOutdatedCaches: true,
  sourcemap: false,
  navigateFallback: "/",
  navigateFallbackDenylist: [/^\/api\//, /^\/swagger\//, /^\/_next\//],
  // Precache the root URL and public/assets files so they're always available
  additionalManifestEntries: [
    { url: "/", revision: Date.now().toString() },
    ...assetFiles,
  ],
  // Convert .next/static paths to absolute _next/static URLs
  // But don't transform asset files that already have absolute paths
  manifestTransforms: [
    (manifestEntries) => {
      const manifest = manifestEntries.map((entry) => {
        // Only transform relative paths (from glob), not absolute paths (from additionalManifestEntries)
        if (!entry.url.startsWith("/")) {
          entry.url = `/_next/static/${entry.url}`;
        }
        return entry;
      });
      return { manifest };
    },
  ],
  runtimeCaching: [
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
  `Generated a service worker, which will precache ${count} files (including ${assetFiles.length} asset files), totaling ${size} bytes.`
);

let serviceWorkerContent = fs.readFileSync(SW_PATH, "utf8");
serviceWorkerContent += `\n// Timestamp: ${Date.now()}`;

fs.writeFileSync(SW_PATH, serviceWorkerContent);
