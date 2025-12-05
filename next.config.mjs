/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'wsrv.nl' }, // <-- INDISPENSABLE
      { protocol: 'https', hostname: 'cdn.futbin.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
    ],
  },
};

export default nextConfig;