import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // drei <Html> overlays mount their own React roots; StrictMode's dev-only
  // double mount races them. Production behaviour is unchanged.
  reactStrictMode: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
