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
  // Force React 18 to be used
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: require.resolve("react"),
        "react-dom": require.resolve("react-dom"),
      }
    }
    return config
  },
}

module.exports = nextConfig
