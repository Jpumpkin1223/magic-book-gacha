import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/magic-book-gacha',
  images: { unoptimized: true },
};

export default nextConfig;
