import type { NextConfig } from "next";

// Static export: the whole site builds to plain files in ./out, so it can be hosted anywhere.
// On GitHub Pages it lives under /Portfolio, so the deploy sets BASE_PATH; locally it is empty.
const basePath = process.env.BASE_PATH ?? "";
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  basePath,
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
