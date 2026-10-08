const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/zynora/:path*",
        destination: "http://localhost:5000/api/zynora/:path*",
      },
      {
        source: "/api/admin/knowledge/:path*",
        destination: "http://localhost:5000/api/admin/knowledge/:path*",
      },
      {
        source: "/api/conversations/:path*",
        destination: "http://localhost:5000/api/conversations/:path*",
      },
      {
        source: "/api/conversations",
        destination: "http://localhost:5000/api/conversations",
      },
      {
        source: "/api/monitoring/:path*",
        destination: "http://localhost:5000/api/monitoring/:path*",
      },
    ];
  },
};

export default nextConfig;