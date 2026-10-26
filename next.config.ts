import type { NextConfig } from "next";

const rawBackendUrl =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://paygo-backend-6w4q.onrender.com'
    : 'http://localhost:5000');

// Clean up trailing slash and trailing /api to ensure proper proxy destination
const backendUrl = rawBackendUrl.trim().replace(/\/+$/, '').replace(/\/api$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ];
  }
};

export default nextConfig;
