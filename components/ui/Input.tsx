import type { CSSProperties, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import styles from './Input.module.css';

interface LabelProps { label?: string; style?: CSSProperties; }

function FieldLabel({ label, style }: LabelProps) {
  if (!label) return null;
  return (
    <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)', ...style }}>
      {label}
    </span>
  );
}

export interface CitizenInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  wrapStyle?: CSSProperties;
}

export function CitizenInput({ label, wrapStyle, style, ...props }: CitizenInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...wrapStyle }}>
      <FieldLabel label={label} />
      <input
        className={styles.citizen}
        style={{
          height: 42,
          padding: '0 16px',
          borderRadius: 21,
          border: '1px solid var(--cp-line)',
          background: 'var(--cp-bg)',
          font: '500 13px/1 Outfit,sans-serif',
          color: 'var(--cp-ink)',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color .15s',
          ...style,
        }}
        {...props}
      />
    </div>
  );
}

export interface GovInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  wrapStyle?: CSSProperties;
}

export function GovInput({ label, wrapStyle, style, ...props }: GovInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...wrapStyle }}>
      <FieldLabel label={label} />
      <input
        className={styles.gov}
        style={{
          height: 54,
          padding: '0 18px',
          borderRadius: 16,
          border: '1.5px solid var(--cp-line)',
          background: 'var(--cp-surface)',
          font: '600 15px/1 Outfit,sans-serif',
          color: 'var(--cp-ink)',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color .15s',
          ...style,
        }}
        {...props}
      />
    </div>
  );
}

export interface GouvTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  wrapStyle?: CSSProperties;
}

export function GouvTextarea({ label, wrapStyle, style, ...props }: GouvTextareaProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...wrapStyle }}>
      <FieldLabel label={label} />
      <textarea
        className={styles.textarea}
        style={{
          padding: '12px 14px',
          borderRadius: 14,
          border: '1.5px solid var(--cp-line)',
          background: 'var(--cp-surface)',
          font: "500 13.5px/1.45 Outfit,'Noto Sans Tamil',sans-serif",
          color: 'var(--cp-ink)',
          width: '100%',
          boxSizing: 'border-box',
          resize: 'vertical',
          transition: 'border-color .15s',
          ...style,
        }}
        {...props}
      />
    </div>
  );
}
