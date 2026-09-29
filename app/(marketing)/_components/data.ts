export const TRIAL_DAYS = 14;

export const TYPES = [
  { k: 'gov', l: 'Government', icon: 'ph-bank', bg: 'var(--cp-peacock)', fg: '#fff', ex: 'Corporations, municipalities, panchayats', s: 'Civic issues from citizens, routed to departments and wards.', chips: ['Roads', 'Drains', 'Garbage', 'Streetlights'], v: ['citizens', 'departments'], ph: 'e.g. Tambaram City Corporation' },
  { k: 'apt', l: 'Apartment or community', icon: 'ph-buildings', bg: 'var(--cp-marigold)', fg: '#0f0f0f', ex: 'Apartments, gated communities, residents’ associations', s: 'Maintenance issues from residents, handled by your services and vendors.', chips: ['Lifts', 'Plumbing', 'Security', 'Housekeeping'], v: ['residents', 'services'], ph: 'e.g. Green Valley Apartments' },
  { k: 'uni', l: 'University or campus', icon: 'ph-graduation-cap', bg: '#0f0f0f', fg: '#fff', ex: 'Universities, colleges, schools', s: 'Campus issues from students and staff, sent to the right office.', chips: ['Hostel', 'Wi-Fi', 'Labs', 'Canteen'], v: ['students', 'offices'], ph: 'e.g. ABC University' },
  { k: 'inst', l: 'Institution', icon: 'ph-first-aid-kit', bg: 'var(--cp-pulse)', fg: '#fff', ex: 'Hospitals, offices, factories, NGOs', s: 'Facility and service issues from members, tracked by your teams.', chips: ['Facilities', 'IT', 'Safety', 'Cleaning'], v: ['members', 'teams'], ph: 'e.g. Kaveri Hospital' },
  { k: 'other', l: 'Something else', icon: 'ph-circles-three-plus', bg: 'var(--cp-leaf)', fg: '#fff', ex: 'Start from a blank set and name things your way', s: '', chips: [] as string[], v: ['members', 'teams'], ph: 'Your organization name' },
] as const;

export type OrgType = (typeof TYPES)[number];

export const PLANS = [
  { k: 'starter', l: 'Starter', m: 999, y: 833, lim: 'Up to 100 members · 2 staff seats', for: 'For small apartments, clubs and associations.', feats: ['Up to 100 members', '2 staff seats', 'Invite link and join code', 'Email support'] },
  { k: 'community', l: 'Community', m: 2499, y: 2083, lim: 'Up to 500 members · 5 staff seats', for: 'For gated communities, schools and societies.', feats: ['Up to 500 members', '5 staff seats', 'Invite link and join code', 'Custom categories and teams', 'Email support'] },
  { k: 'institution', l: 'Institution', m: 6999, y: 5833, lim: 'Up to 3,000 members · 15 staff seats', for: 'For colleges, hospitals and offices.', feats: ['Up to 3,000 members', '15 staff seats', 'Email-domain joining', 'Custom categories and teams', 'Priority support'] },
  { k: 'civic', l: 'Civic', m: null, y: null, lim: 'Unlimited members · unlimited staff', for: 'For corporations, municipalities and large campuses.', feats: ['Unlimited members and staff', 'Open public joining by location', 'Department SSO', 'Public case timeline and open data', 'Dedicated onboarding'] },
] as const;

export type Plan = (typeof PLANS)[number];
export type Cycle = 'monthly' | 'yearly';

export const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
export const planPrice = (p: Plan, c: Cycle) => (p.m == null ? 'Custom' : inr(c === 'yearly' ? p.y : p.m));
export const planPer = (p: Plan, c: Cycle) => (p.m == null ? 'talk to us' : c === 'yearly' ? '/ month, billed yearly' : '/ month');

export const LANGS: [string, string, string][] = [
  ['en', 'English', 'English'], ['ta', 'தமிழ்', 'Tamil'], ['hi', 'हिन्दी', 'Hindi'], ['te', 'తెలుగు', 'Telugu'],
  ['kn', 'ಕನ್ನಡ', 'Kannada'], ['ml', 'മലയാളം', 'Malayalam'], ['bn', 'বাংলা', 'Bengali'], ['mr', 'मराठी', 'Marathi'],
  ['gu', 'ગુજરાતી', 'Gujarati'], ['pa', 'ਪੰਜਾਬੀ', 'Punjabi'], ['or', 'ଓଡ଼ିଆ', 'Odia'], ['ur', 'اردو', 'Urdu'],
];

export const NAV_SECTIONS: [string, string][] = [['Try it', 'demo'], ['Product', 'product'], ['AI', 'ai'], ['Who it’s for', 'types'], ['Pricing', 'pricing'], ['FAQ', 'faq']];

export const FAQS: [string, string][] = [
  ['Do members pay to use Koodal?', 'No. Organizations subscribe. Residents, students, citizens and staff use Koodal for free.'],
  ['Which languages does Koodal support?', 'The app works in 12 Indian languages, and members can report by voice in the language they speak. Reports stay in the language they were written in.'],
  ['Is our data kept separate from other organizations?', 'Yes. Every organization has its own isolated space. Members only see the organizations they belong to, and staff only see their own teams’ cases.'],
  ['How do people join our organization?', 'Share a link or join code, invite by email or phone, or let anyone with your email domain join. You can also require admin approval.'],
  ['What happens when the free trial ends?', 'Nothing is charged until you add a payment method. We remind you three days before the trial ends, and you can pay by UPI AutoPay, card or bank transfer.'],
  ['Can a city corporation use Koodal?', 'Yes. The Civic plan adds open public joining, department SSO, a public case timeline and open data exports, with dedicated onboarding.'],
];
