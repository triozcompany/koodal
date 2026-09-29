'use client';
import { useCallback, useRef, useState } from 'react';

interface UseSwipeOpts {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeDown?: () => void;
  /** px of travel required to count as a swipe; under this, callers should spring back. */
  threshold?: number;
  disabled?: boolean;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, onSwipeDown, threshold = 50, disabled = false }: UseSwipeOpts) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const dyRef = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    dyRef.current = 0;
    setDragging(true);
    setDragX(0);
  }, [disabled]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    dyRef.current = e.clientY - startY.current;
    setDragX(e.clientX - startX.current);
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const dx = dragX;
    const dy = dyRef.current;
    if (Math.abs(dy) > Math.abs(dx) && dy > threshold && onSwipeDown) {
      onSwipeDown();
    } else if (Math.abs(dx) > threshold) {
      if (dx < 0) onSwipeLeft?.(); else onSwipeRight?.();
    }
    setDragX(0);
  }, [dragging, dragX, threshold, onSwipeLeft, onSwipeRight, onSwipeDown]);

  return { dragX, dragging, onPointerDown, onPointerMove, onPointerUp };
}
