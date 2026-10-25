// Shown inside the citizen shell while a route's code loads, so a tap gets an instant response instead of a stall.
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '20px 16px' }}>
      <style>{'@keyframes cp-skel{0%,100%{opacity:.55}50%{opacity:1}}'}</style>
      {[56, 96, 96, 96, 96].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 20, background: 'var(--cp-surface-2)', animation: 'cp-skel 1.1s ease-in-out infinite' }} />
      ))}
    </div>
  );
}
