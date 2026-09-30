/**
 * Mobile Nearby bottom-sheet geometry. `top` is the sheet's distance from the top of the
 * viewport in px, so a larger number means a lower (more minimized) sheet.
 */

export const SHEET_EXPANDED_TOP = 96;
/** Lowest position a drag may reach; matches the handle drag in HomeScreen. */
export const SHEET_DRAG_FLOOR_GAP = 60;

export type SheetOrigin = 'expanded' | 'mid' | 'peek';
export type SheetSettle = SheetOrigin | 'hide';

/** Which resting position a sheet top belongs to (nearest snap). */
export function sheetOrigin(top: number, mid: number, peek: number): SheetOrigin {
  const d = (snap: number) => Math.abs(top - snap);
  const near = Math.min(d(SHEET_EXPANDED_TOP), d(mid), d(peek));
  if (near === d(SHEET_EXPANDED_TOP)) return 'expanded';
  return near === d(mid) ? 'mid' : 'peek';
}

/**
 * Range the sheet may travel while a swipe at the top of the list drags it. From the expanded
 * position it can go no lower than the initial height, so one swipe is one step; from the
 * initial/peek positions it can go all the way down to hiding.
 */
export function listDragBounds(origin: SheetOrigin, mid: number, peek: number, viewportH: number) {
  const floor = viewportH - SHEET_DRAG_FLOOR_GAP;
  if (origin === 'expanded') return { min: SHEET_EXPANDED_TOP, max: mid };
  if (origin === 'mid') return { min: mid, max: floor };
  return { min: peek, max: floor };
}

const FLING_PX_PER_MS = 0.5;
const MID_HIDE_PX = 70;
const PEEK_HIDE_PX = 40;
const EXPANDED_COMMIT = 0.35;

/** Where a list-initiated drag lands on release. `velocity` is px/ms, positive = moving down. */
export function settleListDrag(o: { origin: SheetOrigin; top: number; velocity: number; mid: number; peek: number }): SheetSettle {
  const { origin, top, velocity, mid, peek } = o;
  const fling = velocity > FLING_PX_PER_MS;
  if (origin === 'expanded') {
    const moved = top - SHEET_EXPANDED_TOP;
    return moved > (mid - SHEET_EXPANDED_TOP) * EXPANDED_COMMIT || (fling && moved > 8) ? 'mid' : 'expanded';
  }
  if (origin === 'mid') {
    const moved = top - mid;
    return moved > MID_HIDE_PX || (fling && moved > 12) ? 'hide' : 'mid';
  }
  const moved = top - peek;
  return moved > PEEK_HIDE_PX || (fling && moved > 8) ? 'hide' : 'peek';
}
