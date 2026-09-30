import type { NextConfig } from 'next';


const nextConfig: NextConfig = {
  // The org-creation wizard moved under the Console; keep old links working.
  redirects: async () => [{ source: '/get-started', destination: '/console/get-started', permanent: false }],
  // The service worker must never be served from a stale cache, or a bad worker can't be replaced.
  headers: async () => [{
    source: '/sw.js',
    headers: [
      { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
      { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
    ],
  }],
};

export default nextConfig;
