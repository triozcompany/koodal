/** Rough Greater Chennai metro bounding box — covers the area all seeded/demo
 * issues already live in. `CssMap.tsx` has no real geographic reference of its
 * own (it just places pins at 0-100% coordinates on a decorative grid), so
 * this is a linear approximation, not a real map projection: real lat/lng
 * outside this box just clamps to the nearest edge instead of erroring. */
const LAT_MIN = 12.85;
const LAT_MAX = 13.25;
const LNG_MIN = 80.10;
const LNG_MAX = 80.30;

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

/** Projects a real GPS coordinate onto the existing fake map's 0-100 x/y
 * space, so a real-location report still renders sensibly alongside older
 * scene-fixed-coordinate seed data on the same fake-map-percent scale. */
export function projectToFakeMap(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 100;
  // Latitude increases northward but the map's y grows downward, so it's inverted.
  const y = (1 - (lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;
  return { x: clamp(x, 2, 98), y: clamp(y, 2, 98) };
}

/** The inverse of projectToFakeMap — gives older issues that only ever got a
 * fake x/y (no real lat/lng) an approximate real position, so they still
 * show up sensibly on the real map (`NearbyMap.tsx`) instead of disappearing. */
export function approximateLatLngFromFakeXY(x: number, y: number): { lat: number; lng: number } {
  const lng = LNG_MIN + (x / 100) * (LNG_MAX - LNG_MIN);
  const lat = LAT_MIN + (1 - y / 100) * (LAT_MAX - LAT_MIN);
  return { lat, lng };
}
