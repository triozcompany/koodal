import type { Metadata } from 'next';
import { Outfit, DM_Serif_Display, Noto_Sans_Tamil } from 'next/font/google';
import './globals.css';
import '@phosphor-icons/web/bold';
import '@phosphor-icons/web/fill';

const outfit = Outfit({ subsets: ['latin'], weight: ['300','400','500','600','700','800'], variable: '--font-outfit' });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', variable: '--font-dm-serif' });
const notoTamil = Noto_Sans_Tamil({ subsets: ['tamil'], weight: '500', variable: '--font-noto-tamil' });

export const metadata: Metadata = {
  title: 'Koodal',
  description: 'Civic issue reporting for Tamil Nadu',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-cp-theme="light" className={`${outfit.variable} ${dmSerif.variable} ${notoTamil.variable}`}>
      <body>{children}</body>
    </html>
  );
}
