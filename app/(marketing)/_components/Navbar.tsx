'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { s } from './s';
import { NAV_SECTIONS } from './data';

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 96, behavior: 'smooth' });
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <header style={s('position:sticky;top:14px;z-index:60;padding:0 16px;margin-top:14px')}>
      <div style={{
        ...s('max-width:1120px;margin:0 auto;display:flex;align-items:center;gap:14px;height:64px;padding:0 10px 0 18px;box-sizing:border-box;border-radius:20px;backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%);transition:background .3s,box-shadow .3s,border-color .3s'),
        background: scrolled ? 'rgb(255 255 255 / .82)' : 'rgb(255 255 255 / .55)',
        border: `1px solid ${scrolled ? '#efe7df' : 'rgb(255 255 255 / .6)'}`,
        boxShadow: scrolled ? '0 16px 40px -24px rgb(0 0 0 / .3)' : 'none',
      }}>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={s('display:flex;align-items:center;gap:10px;flex:1;min-width:0;padding:0;border:none;background:none;cursor:pointer;color:#0f0f0f')}>
          <span style={s('width:34px;height:34px;border-radius:50%;background:#0f0f0f;display:grid;place-items:center;flex:none')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/koodal-mark.png" alt="Koodal" style={s('width:24px;height:24px;object-fit:contain;filter:invert(1)')} />
          </span>
          <span style={s('font:700 16px/1 Outfit,sans-serif;letter-spacing:.06em')}>KOODAL</span>
        </button>

        <nav className="kd-nav-links">
          {NAV_SECTIONS.map(([l, id]) => (
            <button key={id} className="kd-navlink" onClick={() => scrollToSection(id)}>{l}</button>
          ))}
        </nav>

        <Link href="/nearby" className="kd-btn nav light">
          <i className="ph-bold ph-user" /><span className="kd-desk-only">Koodal App</span><span className="kd-mob-only">App</span>
        </Link>
        <Link href="/get-started" className="kd-btn nav">
          <i className="ph-bold ph-identification-badge" /><span className="kd-desk-only">Koodal Console</span><span className="kd-mob-only">Console</span>
        </Link>
      </div>
    </header>
  );
}
