export function attachRipple(el: HTMLButtonElement) {
  el.addEventListener('pointerdown', (e) => {
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    const rip = document.createElement('span');
    rip.className = 'cp-rip';
    rip.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    el.appendChild(rip);
    rip.addEventListener('animationend', () => rip.remove());
  });
}
