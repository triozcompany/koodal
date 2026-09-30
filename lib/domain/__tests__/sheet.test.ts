import { describe, it, expect } from 'vitest';
import { sheetOrigin, listDragBounds, settleListDrag, SHEET_EXPANDED_TOP } from '../sheet';

// 844px-tall phone: initial (mid) = round(844 * 0.3) = 253, peek = 844 - 230 = 614
const H = 844, MID = 253, PEEK = 614;

describe('sheetOrigin', () => {
  it('maps a top to the nearest snap', () => {
    expect(sheetOrigin(96, MID, PEEK)).toBe('expanded');
    expect(sheetOrigin(110, MID, PEEK)).toBe('expanded');
    expect(sheetOrigin(253, MID, PEEK)).toBe('mid');
    expect(sheetOrigin(600, MID, PEEK)).toBe('peek');
  });
});

describe('listDragBounds', () => {
  it('stops an expanded sheet at the initial height so one swipe is one step', () => {
    expect(listDragBounds('expanded', MID, PEEK, H)).toEqual({ min: SHEET_EXPANDED_TOP, max: MID });
  });
  it('lets the initial and peek positions travel down to hiding', () => {
    expect(listDragBounds('mid', MID, PEEK, H)).toEqual({ min: MID, max: H - 60 });
    expect(listDragBounds('peek', MID, PEEK, H)).toEqual({ min: PEEK, max: H - 60 });
  });
});

describe('settleListDrag', () => {
  const s = (origin: 'expanded' | 'mid' | 'peek', top: number, velocity = 0) =>
    settleListDrag({ origin, top, velocity, mid: MID, peek: PEEK });

  it('expanded: commits to the initial height past ~35% of the travel, else springs back', () => {
    expect(s('expanded', 96 + 20)).toBe('expanded');
    expect(s('expanded', 96 + 80)).toBe('mid');
    expect(s('expanded', MID)).toBe('mid');
  });
  it('expanded: a downward fling commits even after a short drag, but never hides', () => {
    expect(s('expanded', 96 + 30, 0.9)).toBe('mid');
    expect(s('expanded', MID, 2)).toBe('mid');
  });
  it('mid: hides past ~70px or on a fling, else springs back', () => {
    expect(s('mid', MID + 30)).toBe('mid');
    expect(s('mid', MID + 90)).toBe('hide');
    expect(s('mid', MID + 30, 0.9)).toBe('hide');
  });
  it('mid: a tap-sized movement never hides, even with velocity', () => {
    expect(s('mid', MID + 4, 2)).toBe('mid');
  });
  it('peek: hides past ~40px or on a fling, else stays at peek', () => {
    expect(s('peek', PEEK + 20)).toBe('peek');
    expect(s('peek', PEEK + 60)).toBe('hide');
    expect(s('peek', PEEK + 20, 0.9)).toBe('hide');
  });
});
