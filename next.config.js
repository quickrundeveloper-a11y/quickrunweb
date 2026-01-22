/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // turbopack option removed as it is not supported in next.config.js for this version
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true, // 301 redirect for SEO
      },
    ];
  },
};

module.exports = nextConfig;
