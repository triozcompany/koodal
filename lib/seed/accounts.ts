// Test accounts, shared by the seeder (lib/seed/run.server.ts, scripts/seed-console.ts) and the two
// sign-in pages that list them while test mode is on — one list, so they cannot drift apart.

export interface TestCitizen {
  phone: string;
  name: string;
  area: string;
  note: string;
  /** false = not pre-created, so signing in walks the full onboarding (Aadhaar + profile). */
  seeded: boolean;
}

export const TEST_CITIZENS: TestCitizen[] = [
  { phone: '9000000001', name: 'Kavya Raman', area: 'Velachery, Chennai', note: 'Main demo citizen', seeded: true },
  { phone: '9000000002', name: 'Arjun Kumar', area: 'Velachery, Chennai', note: 'Supporter 2', seeded: true },
  { phone: '9000000003', name: 'Meena Sundaram', area: 'Adyar, Chennai', note: 'Supporter 3', seeded: true },
  { phone: '9000000004', name: 'Karthik Selvam', area: 'Madipakkam, Chennai', note: 'Supporter 4', seeded: true },
  { phone: '9000000005', name: 'Lakshmi Narayanan', area: 'T. Nagar, Chennai', note: 'Supporter 5', seeded: true },
  { phone: '8787878787', name: 'Sathish Kumar', area: 'Anna Nagar, Madurai', note: 'Madurai citizen', seeded: true },
  { phone: '9000000009', name: 'New citizen', area: '', note: 'Not registered · full onboarding', seeded: false },
];

/** Same rule as uidForPhone in server/actions/auth.ts (the sign-in form sends "+91 …"). */
export const citizenUid = (phone: string) => `ph_91${phone}`;

export const TEST_STAFF = [
  { id: 'GCC-1001', name: 'Divya Raghavan', title: 'Commissioner’s Office', role: 'admin', depts: [] as string[], email: 'divya.raghavan@chennaicorporation.gov.in', phone: '+91 98401 23456', reportsTo: 'Commissioner, Greater Chennai Corp.', note: 'Admin · test mode & thresholds' },
  { id: 'GCC-2041', name: 'Priya Natarajan', title: 'Junior Engineer', role: 'staff', depts: ['Roads'], email: 'priya.natarajan@chennaicorporation.gov.in', phone: '+91 98402 11041', reportsTo: 'AE Farida Begum', note: 'Roads' },
  { id: 'GCC-2042', name: 'Farida Begum', title: 'Assistant Engineer', role: 'staff', depts: ['Water & Drainage', 'Sanitation'], email: 'farida.begum@chennaicorporation.gov.in', phone: '+91 98402 11042', reportsTo: 'Executive Engineer, Zone 13', note: 'Water & Drainage, Sanitation' },
] as const;

export const TEST_STAFF_PASSWORD = 'koodal-demo';
