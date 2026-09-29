'use server';
import { adminAuth } from '@/lib/firebase/admin';

// Demo staff directory for Greater Chennai Corp. Plain-text passwords are acceptable only
// because this is a hackathon mock; it never leaves the server (non-exported, 'use server').
// depts: [] means the staff member sees every department.
const STAFF = [
  { id: 'GCC-1001', password: 'koodal-demo', name: 'Divya Raghavan', title: 'Commissioner’s Office', depts: [] as string[] },
  { id: 'GCC-2041', password: 'koodal-demo', name: 'Priya Natarajan', title: 'Junior Engineer', depts: ['Roads'], email: 'priya.natarajan@chennaicorporation.gov.in', phone: '+91 98402 11041', reportsTo: 'AE Farida Begum' },
  { id: 'GCC-2042', password: 'koodal-demo', name: 'Farida Begum', title: 'Assistant Engineer', depts: ['Water & Drainage', 'Sanitation'], email: 'farida.begum@chennaicorporation.gov.in', phone: '+91 98402 11042', reportsTo: 'Executive Engineer, Zone 13' },
];

function find(empId: string, password: string) {
  const id = empId.trim().toUpperCase();
  return STAFF.find((s) => s.id === id && s.password === password);
}

export interface StaffProfile { id: string; name: string; title: string; depts: string[]; email?: string; phone?: string; reportsTo?: string }

/** Step 1: check employee ID + password. The OTP screen only opens if this passes. */
export async function checkStaffCredentials(empId: string, password: string): Promise<{ ok: boolean }> {
  return { ok: !!find(empId, password) };
}

/**
 * Step 2, after the (mocked) OTP: re-verify the credentials and mint a Firebase custom token
 * carrying a `staff` claim, so server actions and rules can tell staff from citizens.
 */
export async function signInStaff(empId: string, password: string): Promise<{ token: string; staff: StaffProfile } | null> {
  const s = find(empId, password);
  if (!s) return null;
  const token = await adminAuth.createCustomToken(`staff_${s.id}`, { staff: true, org: 'gcc', depts: s.depts, staffName: s.name });
  return { token, staff: { id: s.id, name: s.name, title: s.title, depts: s.depts, email: s.email, phone: s.phone, reportsTo: s.reportsTo } };
}
