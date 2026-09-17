import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output keeps the Docker runtime image small — only the
  // traced production dependencies ship, not the full node_modules tree.
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
};

export default nextConfig;
