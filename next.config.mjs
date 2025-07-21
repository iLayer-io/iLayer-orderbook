export const isGhPages = process.env.DEPLOY_TARGET === 'gh-pages';
export const isProd = process.env.NODE_ENV === 'production';
export const repo = 'iLayer-orderbook';
export const baseUrl = isGhPages && isProd ? `/${repo}` : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  images: {
    unoptimized: true
  },
  output: 'export',
  basePath: baseUrl,
  assetPrefix: baseUrl
};

export default nextConfig;
