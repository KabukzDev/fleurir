import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
