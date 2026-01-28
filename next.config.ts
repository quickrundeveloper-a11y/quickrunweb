import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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

export default nextConfig;