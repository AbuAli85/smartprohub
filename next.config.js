/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["localhost", "v0.blob.com"],
    unoptimized: true,
  },
  experimental: {
    // Force npm to use legacy-peer-deps during build
    forceSwcTransforms: true,
    serverActions: true,
  },
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/client",
        destination: "/client/dashboard",
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
