import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    // @ts-expect-error - reactCompiler is supported at runtime but not yet in types
    reactCompiler: true,
  },
};

export default nextConfig;
