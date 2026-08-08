import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['local-origin.dev', '*.local-origin.dev'],
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    globalNotFound: true,
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "ffwcxcawzwyupgnubjfo.supabase.co",
    },
  ],
  },
};

export default nextConfig;
