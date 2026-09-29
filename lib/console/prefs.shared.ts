// Shared by the server actions and the client, so this file must not be a 'use client' module.
export interface Prefs {
  lang: string;
  notif: Record<string, boolean>;
  ch: Record<string, boolean>;
  timeout: '15m' | '30m' | '60m';
  /** Seeded design-mock issues are hidden unless this is on. */
  showDemo: boolean;
}
export const DEFAULT_PREFS: Prefs = {
  lang: 'en',
  notif: { threshold: true, sla: true, reopen: true, dispute: true, digest: false },
  ch: { push: true, email: true, sms: false },
  timeout: '30m',
  showDemo: false,
};

// Same 12 languages as the design (the citizen app's list plus Urdu).
export const LANGUAGES: [string, string, string][] = [
  ['en', 'English', 'English'], ['ta', 'தமிழ்', 'Tamil'], ['hi', 'हिन्दी', 'Hindi'], ['te', 'తెలుగు', 'Telugu'], ['kn', 'ಕನ್ನಡ', 'Kannada'], ['ml', 'മലയാളം', 'Malayalam'],
  ['bn', 'বাংলা', 'Bengali'], ['mr', 'मराठी', 'Marathi'], ['gu', 'ગુજરાતી', 'Gujarati'], ['pa', 'ਪੰਜਾਬੀ', 'Punjabi'], ['or', 'ଓଡ଼ିଆ', 'Odia'], ['ur', 'اردو', 'Urdu'],
];
export const TIMEOUT_MIN = { '15m': 15, '30m': 30, '60m': 60 } as const;
