/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable the App Router
  experimental: {
    serverActions: true,
    appDir: true,
  },
  // Disable type checking during development to speed things up
  typescript: {
    // Don't perform type checking during development
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
  // Disable ESLint during development
  eslint: {
    // Don't run ESLint during development
    ignoreDuringBuilds: process.env.NODE_ENV === "development",
  },
  // Configure image optimization
  images: {
    domains: ["localhost"],
  },
  // Increase memory limit for builds if needed
  experimental: {
    // Use more memory if available
    memoryBasedWorkersCount: true,
    // Enable server actions
    serverActions: true,
  },
  // Suppress the WebSocket optional dependency warnings
  webpack: (config) => {
    // Ignore the WebSocket optional dependencies warnings
    config.ignoreWarnings = [{ module: /node_modules\/ws\/lib\/(buffer-util|validation)\.js/ }, { message: /DEP0040/ }]

    return config
  },
}

module.exports = nextConfig
