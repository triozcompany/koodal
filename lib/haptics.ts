export function haptic() {
  try { navigator.vibrate?.(5); } catch {}
}
