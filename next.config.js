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
    domains: ["placeholder.svg", "v0.blob.com"],
    unoptimized: true,
  },
  experimental: {
    // Force npm to use legacy-peer-deps during build
    forceSwcTransforms: true,
  },
}

module.exports = nextConfig
