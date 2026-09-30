import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Outfit, DM_Serif_Display, Noto_Sans_Tamil } from 'next/font/google';
import './globals.css';
import '@phosphor-icons/web/bold';
import '@phosphor-icons/web/fill';
import { PwaProvider } from '@/components/pwa/PwaProvider';
import { InstallPopup } from '@/components/pwa/InstallPopup';

const outfit = Outfit({ subsets: ['latin'], weight: ['300','400','500','600','700','800'], variable: '--font-outfit' });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-dm-serif' });
const notoTamil = Noto_Sans_Tamil({ subsets: ['tamil'], weight: '500', variable: '--font-noto-tamil' });

export const metadata: Metadata = {
  title: 'Koodal',
  description: 'Civic issue reporting for Tamil Nadu',
  icons: {
    icon: [
      { url: '/icons/android/launchericon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/android/launchericon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  // 'default' status bar (not black-translucent) and no viewportFit:'cover' on purpose: the
  // citizen screens don't pad for safe-area insets, so content would sit under the notch.
  appleWebApp: { capable: true, title: 'Koodal', statusBarStyle: 'default' },
};

export const viewport: Viewport = { themeColor: '#ffffff' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-cp-theme="light" className={`${outfit.variable} ${dmSerif.variable} ${notoTamil.variable}`}>
      <body>
        {/* Chrome can fire beforeinstallprompt before React hydrates; hold the event so PwaProvider can pick it up. */}
        <Script id="bip-capture" strategy="beforeInteractive">
          {`window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__koodalBip=e;});`}
        </Script>
        <PwaProvider>
          {children}
          <InstallPopup />
        </PwaProvider>
      </body>
    </html>
  );
}
