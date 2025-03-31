import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  }
};

export default nextConfig;
