// Shown inside the Console shell while a route's code loads, so a click gets an instant response instead of a stall.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 24 }}>
      <style>{'@keyframes cp-skel{0%,100%{opacity:.55}50%{opacity:1}}'}</style>
      {[220, 90, 90, 320].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 20, background: 'var(--cp-surface-2)', animation: 'cp-skel 1.1s ease-in-out infinite' }} />
      ))}
    </div>
  );
}
