// Shared dark palette for the map-pin preview card, used identically by
// HomeScreen.tsx (mobile) and DesktopHome.tsx (desktop) so the two never drift.
export const PIN_PREVIEW_DARK = {
  cardBg: '#0d0d0d',
  cardBorder: '1px solid #262626',
  cardText: '#f5f5f5',
  photoGradientA: '#1a1a1a',
  photoGradientB: '#222',
  closeBtnBg: 'rgb(0 0 0 / .55)',
  closeBtnFg: '#fff',
  metaText: '#8a8a8a',
  supportBtnBg: '#1e1e1e',
  supportBtnBorder: '1px solid #2e2e2e',
  supportBtnFg: '#fff',
  openBtnBg: '#fff',
  openBtnFg: '#0f0f0f',
} as const;
