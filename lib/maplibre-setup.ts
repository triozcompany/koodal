'use client';
import * as maplibregl from 'maplibre-gl';

let configured = false;

/** maplibre-gl computes its worker's URL relative to its own bundled
 * module's `import.meta.url` at runtime. That assumption only holds when the
 * package is served as-is (e.g. straight from node_modules over a CDN) — once
 * Turbopack/webpack bundles `maplibre-gl.mjs` into the app, `import.meta.url`
 * no longer points at a location with a `maplibre-gl-worker.mjs` sibling
 * actually being served there, so `new Worker(...)` fails with "Worker
 * failed to load." Pointing it at a real, stably-served copy of that same
 * worker file (copied into `public/`) fixes it. Must run before any Map is
 * constructed — call this at the top of every component that creates one. */
export function ensureMaplibreWorker() {
  if (configured) return;
  configured = true;
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}
