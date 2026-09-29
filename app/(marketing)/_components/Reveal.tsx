'use client';
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

// Fade/slide in once when 12% of the element is visible. Reduced-motion users get no motion.
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) {
        setShown(true);
        io.disconnect();
      }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, shown] as const;
}

export function Reveal({ as: Tag = 'section', style, children, ...rest }: {
  as?: 'section' | 'div';
  id?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [ref, shown] = useReveal<HTMLElement>();
  return (
    <Tag
      ref={ref as never}
      {...rest}
      style={{
        ...style,
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(40px)',
        transition: 'opacity .8s ease, transform .8s cubic-bezier(.2,.9,.25,1)',
      }}
    >
      {children}
    </Tag>
  );
}
