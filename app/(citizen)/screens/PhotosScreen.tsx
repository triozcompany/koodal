'use client';
import { useEffect, useRef, useState } from 'react';
import type { Issue } from '@/lib/domain/types';
import { ago } from '@/lib/domain/rules';
import { AVB } from '@/lib/domain/stage-style';
import { ME } from '@/lib/domain/constants';
import { IssueTopBar } from '../components/IssueTopBar';

const ANGLES = ['135deg', '45deg', '90deg', '120deg', '60deg', '30deg', '150deg', '75deg', '100deg'];
const PAGE_SIZE = 12;

function nameHash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase();
}

interface Props {
  issue: Issue;
  mob: boolean;
  backLabel?: string;
  onBack: () => void;
  onDeleteEvidence?: (evidenceId: string) => void;
}

export function PhotosScreen({ issue: d, mob, backLabel = 'Nearby', onBack, onDeleteEvidence }: Props) {
  const photos = d.evidence ?? [];
  const photoN = photos.length;
  const contribN = Math.max(1, new Set(photos.map(e => e.uid || e.by)).size);
  const place = `${d.street}, ${d.area}, ${d.city}`;
  const caseOrId = d.caseId || d.id;

  const [visibleCount, setVisibleCount] = useState(Math.min(PAGE_SIZE, photoN));
  const [loadingMore, setLoadingMore] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting && !loadingMore && visibleCount < photoN) {
        setLoadingMore(true);
        setTimeout(() => {
          setVisibleCount(v => Math.min(photoN, v + PAGE_SIZE));
          setLoadingMore(false);
        }, reducedMotion ? 0 : 500);
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [loadingMore, visibleCount, photoN, reducedMotion]);

  const visiblePhotos = photos.slice(0, visibleCount);
  const skeletonCount = loadingMore ? Math.min(PAGE_SIZE, photoN - visibleCount) : 0;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', background: 'var(--cp-bg)', animation: 'cp-in .32s cubic-bezier(.2,.9,.25,1.1) both', zIndex: 50 }}>
      <IssueTopBar
        backLabel={backLabel}
        caseOrId={caseOrId}
        shares={d.shares ?? 0}
        onBack={onBack}
        showComment={false}
      />

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ maxWidth: mob ? '100%' : 960, margin: '0 auto', padding: mob ? '16px 20px 40px' : '20px 32px 64px', boxSizing: 'border-box' }}>

          <div style={{ font: "400 28px/1 'DM Serif Display',serif", letterSpacing: '-.02em', marginBottom: 6 }}>Photos</div>
          <div style={{ font: '500 13px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)', marginBottom: 20 }}>
            {photoN} photos from {contribN} {contribN === 1 ? 'person' : 'people'} · {place}
          </div>

          {photoN === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center', paddingTop: 60 }}>
              <i className="ph-bold ph-image" style={{ fontSize: 40, color: 'var(--cp-ink-3)' }} />
              <span style={{ font: '500 13px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>No photos yet</span>
            </div>
          )}

          {photoN > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(2,minmax(0,1fr))' : 'repeat(3,minmax(0,1fr))', gap: 10 }}>
              {visiblePhotos.map((e, k) => {
                const isHero = mob && k === 0;
                return (
                  <div
                    key={k}
                    style={{
                      gridColumn: isHero ? '1 / span 2' : undefined,
                      position: 'relative',
                      aspectRatio: isHero ? '16/9' : '4/3',
                      borderRadius: 16,
                      overflow: 'hidden',
                      background: `repeating-linear-gradient(${ANGLES[k % ANGLES.length]},var(--cp-ph-a) 0 12px,var(--cp-ph-b) 12px 24px)`,
                      animation: `cp-row .3s ${Math.min(k, PAGE_SIZE) * 0.04}s both`,
                    }}
                  >
                    <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', font: '500 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)', background: 'var(--cp-surface)', padding: '6px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                      photo {k + 1}
                    </span>
                    <div style={{ position: 'absolute', left: 10, bottom: 10, display: 'flex', alignItems: 'center', gap: 5, height: 26, padding: '0 8px', borderRadius: 8, background: 'rgb(0 0 0 / .62)', color: '#fff' }}>
                      <span style={{ width: 18, height: 18, borderRadius: 5, background: AVB[nameHash(e.by) % AVB.length], display: 'grid', placeItems: 'center', font: '700 8px/1 Outfit,sans-serif', color: 'var(--cp-ink)', flexShrink: 0 }}>
                        {initials(e.by).slice(0, 1)}
                      </span>
                      <span style={{ font: '600 11px/1 Outfit,sans-serif' }}>{initials(e.by)} · {ago(e.ts)}</span>
                    </div>
                    {e.uid === ME.uid && e.id && onDeleteEvidence && (
                      <button
                        onClick={() => onDeleteEvidence(e.id!)}
                        aria-label="Delete this photo"
                        style={{ position: 'absolute', right: 8, top: 8, width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'rgb(0 0 0 / .55)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 13 }}
                      >
                        <i className="ph-bold ph-trash" />
                      </button>
                    )}
                  </div>
                );
              })}
              {Array.from({ length: skeletonCount }).map((_, k) => (
                <div
                  key={`skeleton-${k}`}
                  style={{
                    aspectRatio: '4/3',
                    borderRadius: 16,
                    background: 'var(--cp-surface-2)',
                    animation: reducedMotion ? 'none' : 'cp-glow 1.1s ease-in-out infinite',
                  }}
                />
              ))}
            </div>
          )}

          {visibleCount < photoN && <div ref={sentinelRef} style={{ height: 1 }} />}
        </div>
      </div>
    </div>
  );
}
