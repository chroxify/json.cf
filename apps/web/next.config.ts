import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/github",
        destination: "https://github.com/chroxify/json.cf",
        statusCode: 302,
      },
      {
        source: "/docs",
        destination: "https://api.json.cf/v1/swagger",
        statusCode: 302,
      },
    ];
  },
};

export default nextConfig;
