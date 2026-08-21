import type { NextConfig } from "next";

const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com;
    style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    style-src-elem 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
    font-src 'self' data: https://cdn.jsdelivr.net;
    img-src 'self' blob: data: https://images.unsplash.com https://lh3.googleusercontent.com https://encrypted-tbn0.gstatic.com https://logo.clearbit.com https://autocomplete.clearbit.com https://cdn.jsdelivr.net;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'self' https://api.razorpay.com;
    connect-src 'self' https://lumberjack.razorpay.com https://api.razorpay.com https://autocomplete.clearbit.com;
    upgrade-insecure-requests;
`.replace(/\s+/g, " ").trim();

const nextConfig: NextConfig = {
  // ─── IMAGE OPTIMIZATION CONFIG ─────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/a/**",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
  },

  // ─── SECURITY HEADERS & CSP CONFIG ──────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default nextConfig;