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
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://eu-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  // Required for PostHog ingest proxy (trailing slash on /ingest/...)
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
