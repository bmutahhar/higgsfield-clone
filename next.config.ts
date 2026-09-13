import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Higgsfield serves stills through their own cdn-cgi image transform and
    // mp4 loops straight from the CDN origin. See src/config/media.ts.
    remotePatterns: [
      { protocol: "https", hostname: "higgsfield.ai", pathname: "/cdn-cgi/**" },
      { protocol: "https", hostname: "cdn.higgsfield.ai", pathname: "/**" },
    ],
  },
};

export default nextConfig;
