/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  outputFileTracingRoot: require('path').join(__dirname),
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // GitHub Pages 需要
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, '.'),
    };
    return config;
  },
};

module.exports = nextConfig;

