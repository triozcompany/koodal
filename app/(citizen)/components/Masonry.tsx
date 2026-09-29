'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const ESTIMATE = 420; // height guess for a card before it has been measured

function Cell({ id, heights, children }: { id: string; heights: Map<string, number>; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current!;
    const ro = new ResizeObserver(() => heights.set(id, el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [id, heights]);
  return <div ref={ref}>{children}</div>;
}

interface Props<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  hasMore: boolean;
  onLoadMore: () => void;
  minColumnWidth?: number;
  gap?: number;
}

export function Masonry<T>({ items, getKey, renderItem, hasMore, onLoadMore, minColumnWidth = 360, gap = 16 }: Props<T>) {
  const box = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(1);
  const heights = useRef(new Map<string, number>()).current;
  const lanes = useRef({ cols: 0, of: new Map<string, number>() }).current;

  useEffect(() => {
    const el = box.current!;
    const ro = new ResizeObserver(() => setCols(Math.max(1, Math.floor((el.clientWidth + gap) / (minColumnWidth + gap)))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [minColumnWidth, gap]);

  // Re-created after every batch so a sentinel that is still in view keeps loading.
  useEffect(() => {
    if (!hasMore) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); onLoadMore(); } }, { rootMargin: '400px' });
    io.observe(sentinel.current!);
    return () => io.disconnect();
  }, [hasMore, onLoadMore, items.length]);

  // Each card goes to the currently shortest column once and then stays put, so
  // cards don't hop columns when an image finishes loading. Only a column-count change reflows.
  if (lanes.cols !== cols) { lanes.cols = cols; lanes.of.clear(); }
  const load = Array<number>(cols).fill(0);
  const columns: T[][] = Array.from({ length: cols }, () => []);
  for (const item of items) {
    const k = getKey(item);
    let lane = lanes.of.get(k);
    if (lane === undefined) { lane = load.indexOf(Math.min(...load)); lanes.of.set(k, lane); }
    load[lane] += (heights.get(k) ?? ESTIMATE) + gap;
    columns[lane].push(item);
  }

  return (
    <>
      <div ref={box} style={{ display: 'flex', gap, alignItems: 'flex-start' }}>
        {columns.map((col, c) => (
          <div key={c} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap }}>
            {col.map(i => <Cell key={getKey(i)} id={getKey(i)} heights={heights}>{renderItem(i)}</Cell>)}
          </div>
        ))}
      </div>
      <div ref={sentinel} style={{ height: 1 }} />
    </>
  );
}
