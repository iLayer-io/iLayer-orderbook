import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
  output: "export",
  assetPrefix: "/iLayer-dex/",
  basePath: "/iLayer-dex",
};

export default nextConfig;
