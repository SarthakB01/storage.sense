// next.config.js

/** @type {import('next/dist/server/config').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com'],
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '3000',
          pathname: '/api/files/**',
        },
      ],
  },
};

module.exports = nextConfig;