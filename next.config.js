/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: [
        'truos.ai',
        'www.truos.ai',
        'homelife.truos.ai',
        'localhost:3000',
        'truos.vercel.app',
      ],
    },
  },
  async rewrites() {
    return [
      { source: '/start', destination: '/start/index.html' },
    ];
  },
};
