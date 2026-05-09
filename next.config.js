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
  async headers() {
    return [
      {
        source: '/tru',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'CDN-Cache-Control', value: 'no-store' },
          { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/api/tru/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, max-age=0' },
          { key: 'CDN-Cache-Control', value: 'no-store' },
          { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
        ],
      },
    ];
  },
};
