import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Estas configuraciones solo aplican para el lado del cliente
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        buffer: false,
        util: false,
      };
    }
    
    return config;
  },
  serverExternalPackages: ['@sendgrid/mail'],
};

export default nextConfig;
