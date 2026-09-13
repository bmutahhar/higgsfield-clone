import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    // Higgsfield serves stills through their own cdn-cgi image transform and
    // mp4 loops straight from the CDN origin. See src/config/media.ts.
    remotePatterns: [
      { protocol: "https", hostname: "higgsfield.ai", pathname: "/cdn-cgi/**" },
      { protocol: "https", hostname: "cdn.higgsfield.ai", pathname: "/**" },
      { protocol: "https", hostname: "static.higgsfield.ai", pathname: "/**" },
      { protocol: "https", hostname: "images.higgs.ai", pathname: "/**" },
      {
        protocol: "https",
        hostname: "d8j0ntlcm91z4.cloudfront.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
