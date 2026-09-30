import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Koodal',
    short_name: 'Koodal',
    description: 'Report, verify and resolve your community’s issues in the open.',
    start_url: '/nearby',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    lang: 'en',
    icons: [
      { src: '/icons/android/launchericon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/android/launchericon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
