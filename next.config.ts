import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/assets/pl/js/pa-R4Nu9a6RngMVOiNn7nRID.js",
        destination:
          "https://stats.parazettel.com/js/pa-R4Nu9a6RngMVOiNn7nRID.js",
      },
      {
        source: "/assets/pl/api/event",
        destination: "https://stats.parazettel.com/api/event",
      },
    ];
  },
};

export default nextConfig;
