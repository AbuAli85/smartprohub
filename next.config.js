/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ["localhost", "vercel.app", "supabase.co"],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ensure we're using SWC
  experimental: {
    forceSwcTransforms: true,
    appDir: true,
  },
}

module.exports = nextConfig
