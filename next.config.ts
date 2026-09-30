import type { NextConfig } from 'next';


const nextConfig: NextConfig = {
  // The org-creation wizard moved under the Console; keep old links working.
  redirects: async () => [{ source: '/get-started', destination: '/console/get-started', permanent: false }],
};

export default nextConfig;
