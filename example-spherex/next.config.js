/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.symlinks = true;
    return config;
  },
};

module.exports = nextConfig;
