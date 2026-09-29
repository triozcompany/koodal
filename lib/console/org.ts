// Single-org seam: the Console is fixed to Greater Chennai Corporation. When multi-org
// lands, replace this constant with a context provider exposing the same shape.
export const currentOrg = {
  id: 'gcc',
  name: 'Greater Chennai Corporation',
  short: 'Greater Chennai Corp.',
  city: 'Chennai',
  code: 'CHN',
} as const;
