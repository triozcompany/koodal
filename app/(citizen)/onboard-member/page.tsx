'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/app-context';
import { AuthScreen } from '../screens/AuthScreen';

export default function OnboardMemberPage() {
  const router = useRouter();
  const { mob, authed } = useApp();

  // Once the wizard has actually finished (signed in + verified + named),
  // this is the one place that decides where a freshly-onboarded member lands.
  useEffect(() => {
    if (authed) router.replace('/nearby');
  }, [authed, router]);

  return <AuthScreen mob={mob} />;
}
