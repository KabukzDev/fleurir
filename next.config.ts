import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
