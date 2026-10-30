import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    // Apply to all preview responses, including assets and metadata endpoints.
    return process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production"
      ? [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }]
      : [];
  },
};

export default nextConfig;
