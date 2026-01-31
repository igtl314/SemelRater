/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_IP_KEY: process.env.NEXT_PUBLIC_IP_KEY,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.eu-north-1.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
