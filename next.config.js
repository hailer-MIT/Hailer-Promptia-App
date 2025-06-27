/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["mongoose"],
  },
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  webpack(config) {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };

    // Handle Mongoose properly in webpack
    config.resolve.fallback = {
      ...config.resolve.fallback,
      mongoose: false,
    };

    return config;
  },
};

module.exports = nextConfig;
