import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "thumb.wikimedia.org" },
    ],
  },
  // Phone / LAN access to the Next image optimizer in dev
  allowedDevOrigins: ["192.168.86.44", "127.0.0.1", "localhost"],
  eslint: {
    // eslint-config-next 16 + flat config has a known serialize issue during build
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
