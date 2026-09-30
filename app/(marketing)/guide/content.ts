// Platform guide content. Screenshots live in public/guide/ and come from a real run of the
// seeded demo (see docs/DEMO_GUIDE.md); the red numbered boxes in them mark what to tap.

export interface Shot { src: string; alt: string; kind: 'phone' | 'desk' }
export interface Step { text: string; shots?: Shot[] }
export interface Group { title?: string; intro?: string; steps?: Step[]; shots?: Shot[]; note?: string }
export interface Section { id: string; nav: string; eyebrow: string; title: string; lede: string; groups: Group[] }

const p = (name: string, alt: string): Shot => ({ src: `/guide/${name}.jpg`, alt, kind: 'phone' });
const d = (name: string, alt: string): Shot => ({ src: `/guide/${name}.jpg`, alt, kind: 'desk' });

export const SECTIONS: Section[] = [
  {
    id: 'start', nav: 'Getting started', eyebrow: 'Overview', title: 'How Koodal works',
    lede: 'Koodal has two apps that share one live timeline. Citizens use the **Koodal app** to report and back issues. Department staff use the **Koodal Console** to decide, assign and fix. Nothing is closed until the people who reported it confirm the fix.',
    groups: [
      {
        title: 'The life of an issue',
        steps: [
          { text: '**Report.** A citizen takes a photo, picks a category and a location. Koodal checks for a similar issue nearby first, so the same pothole is not reported ten times.' },
          { text: '**Support.** Neighbours back it with a tap. Each supporter raises community confidence.' },
          { text: '**Official case.** When support reaches **5 supporters or 80% confidence** (your admin can change both), the issue becomes an official case with a case ID and lands on the department’s desk.' },
          { text: '**Fix.** Staff approve it, assign a team, start work and mark it fixed with an after photo. Every step appears on the public timeline, live.' },
          { text: '**Confirm.** Citizens compare before and after photos. Enough confirmations close the case; three “not yet” answers reopen it.' },
        ],
      },
    ],
  },
  {
    id: 'sign-in', nav: 'Sign in', eyebrow: 'Accounts', title: 'Signing in',
    lede: 'Citizens sign in with a phone number and a one-time code. Staff sign in to the Console with their employee ID, password and a code.',
    groups: [
      {
        title: 'Citizens · Koodal app',
        steps: [
          { text: 'Open the app and tap **Log in**, then enter your phone number. While the demo is running, test accounts are listed below the field: tap one to fill it in.', shots: [p('10-citizen-phone', 'Enter your number or tap a test account')] },
          { text: 'Tap **Send OTP**.', shots: [p('10-citizen-send', 'Send OTP')] },
          { text: 'Enter the 6-digit code and tap **Verify**. If you have signed in before, you go straight to **Nearby**.', shots: [p('10-citizen-otp', 'The code screen'), p('10-citizen-nearby', 'Nearby: issues around you')] },
        ],
      },
      {
        title: 'Staff · Koodal Console',
        steps: [
          { text: 'Go to **Koodal Console** and enter your employee ID and password (or tap a test account).', shots: [d('10-console-signin-pick', 'Console sign-in')] },
          { text: 'Tap **Continue**.', shots: [d('10-console-signin-continue', 'Continue to the code step')] },
          { text: 'Enter the one-time code and tap **Verify & continue**.', shots: [d('10-console-code', 'The code screen')] },
          { text: 'You land on **Home**: what needs your decision, overdue work and hotspots. Staff see only their own departments; admins see everything.', shots: [d('10-console-home', 'Console home')] },
        ],
      },
    ],
  },
  {
    id: 'citizens', nav: 'For citizens', eyebrow: 'Koodal app', title: 'For citizens',
    lede: 'Report what is broken, back what your neighbours reported, and confirm when it is fixed.',
    groups: [
      {
        title: 'Create your account',
        intro: 'The first time you sign in, Koodal verifies that you are a resident and sets up your profile. It takes about a minute.',
        steps: [
          { text: 'Swipe through the three intro screens with **Next**, then tap **Get started**.', shots: [p('09-onb-intro', 'Intro'), p('09-onb-intro3', 'Get started')] },
          { text: 'Enter your phone number, tap **Send OTP**, then **Verify**.', shots: [p('09-onb-phone', 'Your phone number')] },
          { text: 'Verify your identity with Aadhaar e-KYC. Officials only see a verified badge, never your Aadhaar number.', shots: [p('09-onb-aadhaar', 'Aadhaar e-KYC'), p('09-onb-aadhaar-verify', 'Verify identity')] },
          { text: 'Add your name and your area, then tap **Continue**. You can post anonymously by default if you prefer.', shots: [p('09-onb-profile', 'Your profile')] },
          { text: 'Allow location so Koodal can show issues around you. You are in.', shots: [p('09-onb-permissions', 'Allow location'), p('09-onb-done', 'Your Nearby feed')] },
        ],
      },
      {
        title: 'Report an issue',
        steps: [
          { text: 'Tap the **camera** button at the bottom of the screen.', shots: [p('01-new-camera-button', 'The camera button')] },
          { text: 'Take a photo, or tap the **gallery** icon to pick one.', shots: [p('01-new-camera', 'Capture or choose a photo')] },
          { text: 'Give it a title, pick a category and describe what is wrong. Your GPS location is filled in; tap it to change.', shots: [p('01-new-form', 'Title, category and description')] },
          { text: 'Scroll down and **drag the arrow** to the right to report.', shots: [p('01-new-slide', 'Slide to report')] },
          { text: 'Koodal analyses the report: category, severity and the department it goes to. If nothing similar is nearby, tap **Post as new issue**.', shots: [p('01-new-ai-scanning', 'Analysing'), p('01-new-ai-result', 'No similar issue nearby')] },
          { text: 'Your issue is live, with you as the first supporter. Share it with neighbours so they can back it.', shots: [p('01-new-posted', 'Your new issue')] },
        ],
      },
      {
        title: 'When a similar issue already exists',
        intro: 'If someone nearby has already reported the same problem, Koodal suggests joining it instead of creating a duplicate. Joining counts as your support.',
        steps: [
          { text: 'Report as usual. The analysis screen shows **1 match nearby**; tap it.', shots: [p('02-join-form', 'A pothole report'), p('02-join-ai', 'Match found')] },
          { text: 'Check the match and tap **Join**. Choose **Mine is different** if it is a separate problem.', shots: [p('02-join-match', 'Join the existing issue')] },
          { text: 'Your photo is added to the existing issue and you are counted as a supporter.', shots: [p('02-join-joined', 'Joined as a supporter')] },
        ],
      },
      {
        title: 'Support an issue',
        intro: 'Open any issue and **press and hold “Hold to support”** until the button fills. What happens next depends on how close it is to the threshold.',
        steps: [
          { text: '**Your support makes it official.** An issue one supporter short becomes an official case the moment you support it, and you see the celebration screen.', shots: [p('03-s2b-before', '4 supporters, one short'), p('03-s2b-case', 'Now an official case')] },
          { text: '**Confidence can get it there too.** An issue with strong evidence can cross on confidence (80%) before it reaches 5 supporters.', shots: [p('03-s2c-before', '74% confidence'), p('03-s2c-case', '82%: official case')] },
          { text: '**Still gathering support.** If more backing is needed, your support is counted and the bar moves closer to the threshold.', shots: [p('03-s2d-before', '2 supporters'), p('03-s2d-after', '3 supporters, 40%')] },
          { text: '**Already official.** Once an issue is an official case, support closes and you can **Track official case** instead.', shots: [p('03-s2a-official', 'Already an official case')] },
        ],
      },
      {
        title: 'Track your cases',
        steps: [
          { text: 'Issues you support show their official case, the department and team, and the target date as they move forward.', shots: [p('04-s3-supported', 'A case you support')] },
          { text: 'The **Cases** tab lists everything you reported or supported, with a badge when something needs you.', shots: [p('04-cases-tab', 'Your cases')] },
        ],
      },
      {
        title: 'Confirm a fix',
        intro: 'When the department marks a case fixed, the people who backed it decide whether it really is.',
        steps: [
          { text: 'Open the case and tap **Check the fix**.', shots: [p('05-s4b-check', 'Check the fix')] },
          { text: 'Compare the before and after photos, then tap **Fixed** or **Not yet**.', shots: [p('05-s4b-verify', 'Is it fixed?')] },
          { text: 'When enough neighbours confirm, the case closes. Closed cases keep the fix note and proof photo on their timeline.', shots: [p('05-s4b-closed', 'Closed after your confirmation'), p('05-s4-closed', 'A completed case')] },
        ],
        note: 'Three “Not yet” answers reopen the case and send it back to the department.',
      },
    ],
  },
  {
    id: 'staff', nav: 'For staff', eyebrow: 'Koodal Console', title: 'For department staff',
    lede: 'Decide on new cases, do the work and show proof. Everything you do appears on the citizen’s timeline immediately.',
    groups: [
      {
        title: 'Decide on new cases',
        steps: [
          { text: 'Home lists every case that crossed the community threshold under **Needs your decision**, with the time left to decide. **Approve** assigns a team and target date; **Reject** needs a reason, an explanation and a proof photo.', shots: [d('03-console-needs-decision', 'Needs your decision')] },
        ],
      },
      {
        title: 'Work a case',
        steps: [
          { text: 'Open an assigned case and tap **Start work on site**.', shots: [d('06-s5-console-start', 'Start work on site')] },
          { text: 'When the work is done, tap **Mark as fixed**, add after photos and a short note, then tap **Send for confirmation**.', shots: [d('06-s5-console-markfixed', 'Mark as fixed with proof')] },
        ],
      },
      {
        title: 'What citizens see',
        intro: 'The citizen app updates live, with no refresh: assigned, then in progress, then fixed and waiting for confirmation.',
        shots: [p('06-s5-citizen-assigned', 'Assigned'), p('06-s5-citizen-progress', 'In progress'), p('06-s5-citizen-fixed', 'Fixed, asking citizens to confirm')],
      },
    ],
  },
  {
    id: 'analytics', nav: 'Analytics', eyebrow: 'Koodal Console', title: 'Analytics',
    lede: '**Insights** shows how your departments are doing: cases opened and fixed, resolution time, on-time fixes, reopen rate, department performance, a hotspot matrix, and recurring and reopened cases.',
    groups: [
      {
        steps: [
          { text: 'Filter by **When**, **Area**, **Department** or **Problem type**. Click a bar to zoom into that period, or export the numbers as CSV.', shots: [d('08-insights', 'Insights')] },
          { text: 'The **Cases** list shows every case with its status, community support, team and target date. Switch to **Board** to move cases between stages.', shots: [d('08-cases-list', 'Cases list')] },
        ],
      },
    ],
  },
  {
    id: 'admins', nav: 'For admins', eyebrow: 'Koodal Console', title: 'For admins',
    lede: 'Admins set the rules for the whole organisation in **Settings → Test mode & thresholds**. Other staff do not see this card.',
    groups: [
      {
        steps: [
          { text: '**Test mode** lists the test accounts on both sign-in pages and unlocks the data tools. Turn it off before real users sign in.', shots: [d('00-settings-testmode', 'Test mode')] },
          { text: '**Thresholds:** supporters needed to open a case, or the confidence that opens it, the confidence each support adds, and the confirmations needed to close a fixed case. Tap **Save thresholds**; the new rules apply immediately.', shots: [d('00-settings-thresholds', 'Thresholds')] },
          { text: '**Data tools** (test mode only). **Seed data** adds the demo scenarios. **Reset seed data** removes demo data and seeds a fresh copy; reports from real citizens stay. **Remove all data** deletes every report and citizen profile and asks you to type DELETE first.', shots: [d('00-reset-confirm', 'Confirm reset'), d('00-reset-done', 'Reset complete')] },
        ],
      },
    ],
  },
];

export const CITIZENS: [string, string, string][] = [
  ['Kavya Raman', '90000 00001', 'Main demo citizen'],
  ['Arjun Kumar', '90000 00002', 'Supporter'],
  ['Meena Sundaram', '90000 00003', 'Supporter'],
  ['Karthik Selvam', '90000 00004', 'Supporter'],
  ['Lakshmi Narayanan', '90000 00005', 'Supporter'],
  ['Sathish Kumar', '87878 78787', 'Madurai citizen'],
  ['New citizen', '90000 00009', 'Not registered: walks through account creation'],
];

export const STAFF: [string, string, string][] = [
  ['Divya Raghavan', 'GCC-1001', 'Admin · all departments, test mode and thresholds'],
  ['Priya Natarajan', 'GCC-2041', 'Staff · Roads'],
  ['Farida Begum', 'GCC-2042', 'Staff · Water & Drainage, Sanitation'],
];

export const SCENARIOS: [string, string, string][] = [
  ['CP-S1', 'Pothole near Vijayanagar bus stand, Velachery', 'Report a pothole nearby to see the join suggestion'],
  ['CP-S2A', 'Rainwater at Madipakkam junction', 'Already an official case, waiting for a decision'],
  ['CP-S2B', 'Garbage near Adyar bus depot', 'Your support makes it official (4 → 5 supporters)'],
  ['CP-S2C', 'Sewage on Kutchery Road, Mylapore', 'Crosses on confidence (74% → 82%)'],
  ['CP-S2D', 'Streetlights dark on Pondy Bazaar 2nd lane', 'Still gathering support after yours'],
  ['CP-S3', 'Storm drain open near Perungudi toll', 'Already supported by Kavya, assigned'],
  ['CP-S4 / S4B', 'Kathipara potholes / Elliot’s Beach footpath', 'Completed, and one fix waiting for your confirmation'],
  ['CP-S5', 'Road cave-in near Phoenix Mall signal', 'Roads staff start work and mark it fixed, live'],
];
