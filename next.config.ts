import type { NextConfig } from "next";

const backendApiUrl =
  process.env.BACKEND_API_URL ?? "http://localhost:8080/api";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
