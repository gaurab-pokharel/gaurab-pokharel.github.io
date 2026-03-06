export function initParticles() {
  const canvas = document.getElementById("bg");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let w = 0, h = 0;
  function resize() {
    w = canvas.width = Math.floor(window.innerWidth * DPR);
    h = canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  }
  window.addEventListener("resize", resize);
  resize();

const area = window.innerWidth * window.innerHeight;
// roughly: 60 on small screens, 140–220 on desktops, capped
const N = Math.max(
  60,
  Math.min(220, Math.floor(area / 7000))
);

  const pts = Array.from({ length: N }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.18 * DPR,
    vy: (Math.random() - 0.5) * 0.18 * DPR,
    r: (Math.random() * 1.6 + 0.7) * DPR
  }));

  const mouse = { x: -1e9, y: -1e9, active: false };
  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX * DPR;
    mouse.y = e.clientY * DPR;
    mouse.active = true;
  });
  window.addEventListener("mouseleave", () => (mouse.active = false));

  function frame() {
    // don’t clear the CSS gradient; just draw particles on top
    ctx.clearRect(0, 0, w, h);

    if (!reduceMotion) {
      for (const p of pts) {
        p.x = (p.x + p.vx + w) % w;
        p.y = (p.y + p.vy + h) % h;

        if (mouse.active) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          const R = 140 * DPR;
          if (d2 < R * R) {
            const d = Math.sqrt(d2) + 1e-6;
            const f = (R - d) / R;
            p.vx += (dx / d) * f * 0.012;
            p.vy += (dy / d) * f * 0.012;
          }
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
      }
    }

    // connections
    ctx.lineWidth = 1 * DPR;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        const MAX = (150 * DPR) ** 2;
        if (d2 < MAX) {
          const t = 1 - d2 / MAX;
          ctx.strokeStyle = `rgba(255,255,255,${0.14 * t})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // points
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  frame();
}