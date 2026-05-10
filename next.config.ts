import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NETLIFY ? undefined : "standalone",
};

export default nextConfig;
