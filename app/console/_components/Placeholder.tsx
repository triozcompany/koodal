export function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: '26px 28px' }}>
      <h1 style={{ font: "400 32px/1.05 'DM Serif Display',serif", letterSpacing: '-.03em', margin: 0 }}>{title}</h1>
    </div>
  );
}
