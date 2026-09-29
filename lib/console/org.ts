// Single-org seam: the Console is fixed to Greater Chennai Corporation. When multi-org
// lands, replace this constant with a context provider exposing the same shape.
export const currentOrg = {
  id: 'gcc',
  name: 'Greater Chennai Corporation',
  short: 'Greater Chennai Corp.',
  city: 'Chennai',
  code: 'CHN',
  // Chennai metro (wider than the city limit) so real GPS reports from Guduvancheri, Tambaram,
  // Chromepet etc. are not dropped when the geocoder names a neighbouring town.
  bounds: { latMin: 12.7, latMax: 13.3, lngMin: 79.95, lngMax: 80.35 },
} as const;

/** A report belongs to this Console if it is in Chennai by name, or its real GPS falls inside the metro box. */
export function inJurisdiction(i: { city?: string; lat?: number; lng?: number }): boolean {
  if (i.city === currentOrg.city) return true;
  const b = currentOrg.bounds;
  return typeof i.lat === 'number' && typeof i.lng === 'number' && i.lat >= b.latMin && i.lat <= b.latMax && i.lng >= b.lngMin && i.lng <= b.lngMax;
}
