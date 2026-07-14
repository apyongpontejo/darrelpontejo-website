export function initNetworkBg(canvas, opts = {}) {
  const ctx = canvas.getContext('2d');
  const colors = opts.colors || ['#4fd8ff', '#7fe89a', '#c8e83a'];
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let particles = [];
  let raf;
  let w, h;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    w = canvas.width = Math.max(1, rect.width * dpr);
    h = canvas.height = Math.max(1, rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    const count = opts.count || Math.max(14, Math.floor((rect.width * rect.height) / 26000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3 * dpr, vy: (Math.random() - 0.5) * 0.3 * dpr,
      r: (Math.random() * 2 + 1.5) * dpr,
      c: colors[Math.floor(Math.random() * colors.length)]
    }));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    const linkDist = (opts.linkDist || 130) * dpr;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < linkDist) {
          ctx.strokeStyle = a.c;
          ctx.globalAlpha = (1 - d / linkDist) * 0.32;
          ctx.lineWidth = dpr;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1;
    for (const p of particles) {
      ctx.beginPath();
      ctx.fillStyle = p.c;
      ctx.shadowColor = p.c;
      ctx.shadowBlur = 7 * dpr;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    raf = requestAnimationFrame(step);
  }

  resize();
  step();
  const onResize = () => resize();
  window.addEventListener('resize', onResize);
  return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); };
}
