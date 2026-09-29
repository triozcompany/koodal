export interface MapCamera { center: [number, number]; zoom: number; pitch: number; bearing: number }

// What the Console map remembers while you open a case and come back (the citizen Nearby flow
// keeps the same things in AppProvider context). Held in a ref inside ConsoleProvider so writes
// never re-render anything; the map page copies its state in on unmount and reads it on mount.
export interface MapState {
  camera: MapCamera | null;
  sel: string | null;
  listOpen: boolean;
  full: boolean;
  layers: { cases: boolean; hotspots: boolean; emerging: boolean };
  mSt: string[]; mArea: string[]; mDept: string[]; mCat: string[];
  q: string;
  listScroll: number;
}

export const emptyMapState = (): MapState => ({
  camera: null, sel: null, listOpen: true, full: false,
  layers: { cases: true, hotspots: true, emerging: true },
  mSt: [], mArea: [], mDept: [], mCat: [], q: '', listScroll: 0,
});
