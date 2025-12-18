/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname, // Stops the wrong Downloads folder detection
  },
};

module.exports = nextConfig;
