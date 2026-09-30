import type { Metadata } from 'next';
import { Suspense } from 'react';
import '../../(marketing)/marketing.css';
import { GetStarted } from '../../(marketing)/_components/GetStarted';

export const metadata: Metadata = {
  title: 'Get started · Koodal',
  description: 'Create your Koodal organization in a few steps.',
};

export default function GetStartedPage() {
  return (
    <Suspense fallback={null}>
      <GetStarted />
    </Suspense>
  );
}
