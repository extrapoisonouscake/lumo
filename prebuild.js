import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { generateSW } from "workbox-build";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SW_DIR = path.resolve(__dirname, "public/sw");
const SW_PATH = path.join(SW_DIR, "sw.js");
fs.rmSync(SW_DIR, { force: true, recursive: true });
const { count, size, warnings } = await generateSW({
  swDest: SW_PATH,
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  skipWaiting: true,
  sourcemap: false,
  runtimeCaching: [
    {
      urlPattern: ({ url }) =>
        ["/assets", "/_next"].some((p) => url.pathname.startsWith(p)),
      handler: "CacheFirst",
      options: {
        cacheName: "Static files caching",
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
