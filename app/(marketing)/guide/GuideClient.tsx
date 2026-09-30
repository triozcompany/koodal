'use client';
import { useEffect, useRef, useState } from 'react';

/** Contents rail: highlights the section in view (a chip row under 1100px). */
export function GuideToc({ items }: { items: { id: string; nav: string }[] }) {
  const [on, setOn] = useState(items[0]?.id);
  const navRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((es) => {
      const hit = es.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (hit) setOn(hit.target.id);
    }, { rootMargin: '-20% 0px -65% 0px' });
    items.forEach((i) => { const el = document.getElementById(i.id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, [items]);
  // Keep the active chip visible in the horizontal row on narrow screens.
  useEffect(() => {
    const a = navRef.current?.querySelector<HTMLElement>(`a[href="#${on}"]`);
    const row = a?.parentElement?.parentElement;
    if (a && row && row.scrollWidth > row.clientWidth) row.scrollTo({ left: a.parentElement!.offsetLeft - 16, behavior: 'smooth' });
  }, [on]);
  return (
    <nav ref={navRef} className="kd-guide-toc" aria-label="Guide contents">
      <span className="kd-guide-toc-label">On this page</span>
      <ol>
        {items.map((i) => (
          <li key={i.id}><a href={`#${i.id}`} className={on === i.id ? 'on' : undefined} aria-current={on === i.id ? 'true' : undefined}>{i.nav}</a></li>
        ))}
      </ol>
    </nav>
  );
}

/** Click any screenshot (button[data-zoom]) to see it full size; Esc or click closes. */
export function GuideLightbox() {
  const [img, setImg] = useState<{ src: string; alt: string } | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>('[data-zoom]');
      if (!b) return;
      opener.current = b;
      setImg({ src: b.dataset.zoom!, alt: b.getAttribute('aria-label') ?? '' });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  useEffect(() => {
    if (!img) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [img]);
  const close = () => { setImg(null); opener.current?.focus(); };
  if (!img) return null;
  return (
    <div className="kd-guide-lb" role="dialog" aria-modal="true" aria-label={img.alt} onClick={close}>
      <button ref={closeRef} className="kd-guide-lb-x" aria-label="Close" onClick={close}><i className="ph-bold ph-x" /></button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img.src} alt={img.alt} />
    </div>
  );
}
