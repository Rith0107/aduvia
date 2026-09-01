import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/(.*)", headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Frame-Options", value: "DENY" },
      ] },
      // Only the no-index review copies can be framed, and only by Aduvia
      // itself. Normal application routes retain the stricter DENY policy.
      { source: "/mobile-preview/(.*)", headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ] },
    ];
  },
};

export default nextConfig;
