/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  experimental: {
    serverActions: true
  },
  publicRuntimeConfig: {
    basePath: process.env.NEXT_PUBLIC_AUTH_URL
  },
  images: {
    domains: ['lh3.googleusercontent.com']
  }
}
