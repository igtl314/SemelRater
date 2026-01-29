/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_IP_KEY: process.env.NEXT_PUBLIC_IP_KEY,
  },
  serverExternalPackages: [],
};

module.exports = nextConfig;
