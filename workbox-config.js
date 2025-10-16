const urlPattern = new RegExp(`/static|assets|_next\/.*/`);
module.exports = {
  swDest: "public/sw/sw.js",
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
};
