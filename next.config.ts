import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    // proxyClientMaxBodySize: "20mb", // removed, not supported
  },
};

export default nextConfig;
