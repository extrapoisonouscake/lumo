/** @type {import('next').NextConfig} */
export default {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: false,
  webpack(config) {
    // Configure SVG imports as React components
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    return config;
  },
  async rewrites() {
    return [
      {
        source: "/announcements/direct/:id",
        destination: `https://${process.env.UPLOADTHING_APP_ID}.ufs.sh/f/:id`,
      },
    ];
  },
};
