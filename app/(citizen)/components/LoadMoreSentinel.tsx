'use client';
import { useEffect, useRef } from 'react';

interface Props {
  hasMore: boolean;
  onLoadMore: () => void;
}

/** A 1px marker that triggers `onLoadMore` once it scrolls into view — same
 * sentinel + IntersectionObserver pattern Masonry.tsx uses internally, factored
 * out for lists (like Search's results) that don't need Masonry's column layout. */
export function LoadMoreSentinel({ hasMore, onLoadMore }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); onLoadMore(); } }, { rootMargin: '400px' });
    io.observe(ref.current!);
    return () => io.disconnect();
  }, [hasMore, onLoadMore]);

  return <div ref={ref} style={{ height: 1 }} />;
}
