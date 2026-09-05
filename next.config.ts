import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/events", destination: "/#weekend", permanent: true },
      { source: "/story", destination: "/#story", permanent: true },
      { source: "/travel", destination: "/#travel", permanent: true },
      { source: "/faq", destination: "/#faq", permanent: true },
      { source: "/contact", destination: "/#faq", permanent: true },
      { source: "/photos", destination: "/#story", permanent: true },
      { source: "/guestbook", destination: "/", permanent: true },
      { source: "/day-of", destination: "/#weekend", permanent: true },
      { source: "/after", destination: "/", permanent: true },
      { source: "/invite/:path*", destination: "/rsvp", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
