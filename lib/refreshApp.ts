// Clears the service worker and its caches before reloading, so a broken cached shell can't survive the refresh.
export async function refreshApp() {
  try {
    const regs = await navigator.serviceWorker?.getRegistrations();
    await Promise.all((regs ?? []).map(r => r.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('koodal-')).map(k => caches.delete(k)));
  } catch {}
  location.reload();
}
