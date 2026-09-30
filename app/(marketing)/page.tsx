import type { Metadata } from 'next';
import { Navbar } from './_components/Navbar';
import { Hero } from './_components/Hero';
import { TryIt } from './_components/TryIt';
import { ProductVideo } from './_components/ProductVideo';
import { IssueMarquee } from './_components/IssueMarquee';
import { AiCards } from './_components/AiCards';
import { ProductBento } from './_components/ProductBento';
import { OrgTypes } from './_components/OrgTypes';
import { Pricing } from './_components/Pricing';
import { Trust } from './_components/Trust';
import { Faq } from './_components/Faq';
import { GuideSection } from './_components/GuideSection';
import { CtaBand } from './_components/CtaBand';
import { Footer } from './_components/Footer';

export const metadata: Metadata = {
  title: 'Koodal · Every issue reported, resolved and confirmed',
  description: 'One open loop for cities, apartments, campuses and institutions: members report and verify, your team fixes, members confirm.',
};

export default function LandingPage() {
  return (
    <div className="kd-root" data-cp-theme="light">
      <Navbar />
      <Hero />
      <ProductVideo />
      <TryIt />
      <IssueMarquee />
      <AiCards />
      <ProductBento />
      <OrgTypes />
      <Pricing />
      <Trust />
      <GuideSection />
      <Faq />
      <CtaBand />
      <Footer />
    </div>
  );
}
