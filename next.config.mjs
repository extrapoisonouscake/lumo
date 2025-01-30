/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/api/aspen/:path*",
        destination: `https://myeducation.gov.bc.ca/aspen/:path*`, //!reused
      },
      {
        source: "/announcements/direct/:id",
        destination: `https://${process.env.UPLOADTHING_APP_ID}.ufs.sh/f/:id`,
      },
    ];
  },
};

export default nextConfig;
