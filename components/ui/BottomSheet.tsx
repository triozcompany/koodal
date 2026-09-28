import type { CSSProperties, ReactNode } from 'react';

export interface BottomSheetProps {
  children: ReactNode;
  title?: string;
  style?: CSSProperties;
}

export function BottomSheet({ children, title, style }: BottomSheetProps) {
  return (
    <div style={{
      background: 'var(--cp-surface)',
      borderRadius: '26px 26px 0 0',
      boxShadow: 'var(--k-sh-sheet)',
      display: 'flex',
      flexDirection: 'column',
      ...style,
    }}>
      {/* Drag handle */}
      <div style={{ padding: '10px 20px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', touchAction: 'none', cursor: 'grab' }}>
        <span style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--cp-line)' }} />
      </div>
      {title && (
        <div style={{ padding: '4px 20px 14px', font: '400 23px/1 "DM Serif Display",serif', color: 'var(--cp-ink)' }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
