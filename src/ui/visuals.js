import { h } from './dom.js';
import { L } from '../i18n.js';
import { setupCanvas, C, rr, text, emoji, arrow, box, para, ease } from './draw.js';

export const VW = 640;
export const VH = 480;

// Render a lesson visual into a .visual container. Returns a cleanup function.
export function renderVisual(container, spec) {
  if (!spec) return () => {};
  if (typeof spec === 'function') spec = { type: 'canvas', draw: spec };
  const draw = BUILDERS[spec.type] ? BUILDERS[spec.type](spec) : spec.draw;
  if (spec.type === 'dom') {
    const el = h('div', { class: 'vis-dom' });
    spec.build(el);
    container.appendChild(el);
    return () => {};
  }
  const canvas = h('canvas', { role: 'img', 'aria-label': L(spec.alt) || '' });
  container.appendChild(canvas);
  const g = setupCanvas(canvas, VW, VH);
  let raf = 0;
  let alive = true;
  const t0 = performance.now();
  const state = {};
  const frame = () => {
    if (!alive) return;
    const t = (performance.now() - t0) / 1000;
    g.save();
    g.clearRect(0, 0, VW, VH);
    g.fillStyle = spec.bg || '#ffffff';
    g.fillRect(0, 0, VW, VH);
    try {
      draw(g, t, VW, VH, L, state);
    } catch (err) {
      console.error(err);
      alive = false;
    }
    g.restore();
    if (spec.static) return;
    raf = requestAnimationFrame(frame);
  };
  frame();
  // Pointer info for interactive visuals.
  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    state.mx = ((e.clientX - r.left) / r.width) * VW;
    state.my = ((e.clientY - r.top) / r.height) * VH;
  });
  canvas.addEventListener('pointerdown', (e) => {
    const r = canvas.getBoundingClientRect();
    state.click = { x: ((e.clientX - r.left) / r.width) * VW, y: ((e.clientY - r.top) / r.height) * VH, t: performance.now() };
  });
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
  };
}

// ---------- generic builders ----------
export const BUILDERS = {
  // A row (or grid) of big emoji with captions that pop in one by one.
  emoji(spec) {
    return (g, t, W, H, T) => {
      const items = spec.items;
      const n = items.length;
      const cols = spec.cols || Math.min(n, n > 4 ? Math.ceil(n / 2) : n);
      const rows = Math.ceil(n / cols);
      const cw = W / cols;
      const ch = (H - (spec.title ? 50 : 0)) / rows;
      const top = spec.title ? 50 : 0;
      if (spec.title) text(g, T(spec.title), W / 2, 30, { size: 24, max: W - 40 });
      items.forEach((it, i) => {
        const c = i % cols;
        const r = Math.floor(i / cols);
        const cx = c * cw + cw / 2;
        const cy = top + r * ch + ch / 2 - 14;
        const k = ease((t - i * 0.25) * 2.5);
        const s = Math.min(cw, ch) * 0.42 * (0.5 + 0.5 * k);
        g.globalAlpha = Math.max(0, Math.min(1, k * 1.5));
        const bob = Math.sin(t * 2 + i) * 3;
        box(g, cx - cw * 0.42, cy - ch * 0.38 + bob, cw * 0.84, ch * 0.78, { fill: it.bg || '#f6f9ff', r: 18 });
        emoji(g, it.e, cx, cy - 12 + bob, s);
        if (it.t) text(g, T(it.t), cx, cy + ch * 0.26 + bob, { size: Math.min(20, cw / 8), max: cw * 0.78 });
        g.globalAlpha = 1;
        if (spec.arrows && i < n - 1 && c < cols - 1) arrow(g, cx + cw * 0.43, cy + bob, cx + cw * 0.57, cy + bob, { width: 4, head: 11 });
      });
    };
  },

  // Steps connected by arrows, with a moving highlight.
  flow(spec) {
    return (g, t, W, H, T) => {
      const steps = spec.steps;
      const n = steps.length;
      const vertical = spec.vertical;
      const pad = 22;
      const active = Math.floor((t * 0.8) % (n + (spec.loop ? 0 : 1)));
      if (spec.title) text(g, T(spec.title), W / 2, 28, { size: 24, max: W - 40 });
      const top = spec.title ? 56 : 20;
      const avail = vertical ? H - top - pad : W - pad * 2;
      const gap = 36;
      const size = (avail - gap * (n - 1)) / n;
      steps.forEach((s, i) => {
        const x = vertical ? W / 2 - 170 : pad + i * (size + gap);
        const y = vertical ? top + i * (size + gap) : top + (H - top) / 2 - 90;
        const w = vertical ? 340 : size;
        const hh = vertical ? size : 180;
        const on = spec.loop ? i === Math.floor((t * 0.8) % n) : i <= active;
        box(g, x, y, w, hh, { fill: on ? s.color || '#fff4d6' : '#ffffff', r: 16 });
        if (vertical) {
          emoji(g, s.e, x + 40, y + hh / 2, Math.min(44, hh * 0.6));
          text(g, T(s.t), x + 78, y + hh / 2, { size: 19, align: 'left', max: w - 90 });
        } else {
          emoji(g, s.e, x + w / 2, y + 62, Math.min(58, w * 0.45));
          const lines = T(s.t).split('\n');
          lines.forEach((ln, k) => text(g, ln, x + w / 2, y + 130 + k * 22, { size: Math.min(19, w / 6.5), max: w - 12 }));
        }
        if (i < n - 1) {
          if (vertical) arrow(g, W / 2, y + hh + 4, W / 2, y + hh + gap - 4, { width: 4, head: 11 });
          else arrow(g, x + w + 5, y + hh / 2, x + w + gap - 5, y + hh / 2, { width: 4, head: 11 });
        }
      });
      if (spec.loop && !vertical) {
        const y = top + (H - top) / 2 + 105;
        g.strokeStyle = C.accent;
        g.lineWidth = 4;
        g.setLineDash([8, 8]);
        g.lineDashOffset = -t * 30;
        g.beginPath();
        g.moveTo(W - pad - size / 2, y);
        g.bezierCurveTo(W - pad - size / 2, y + 60, pad + size / 2, y + 60, pad + size / 2, y + 6);
        g.stroke();
        g.setLineDash([]);
        arrow(g, pad + size / 2, y + 30, pad + size / 2, y + 2, { color: C.accent, width: 4, head: 12 });
        if (spec.loopLabel) text(g, T(spec.loopLabel), W / 2, y + 58, { size: 16, color: C.accent });
      }
    };
  },

  // Two columns: left vs right.
  vs(spec) {
    return (g, t, W, H, T) => {
      const cols = [spec.left, spec.right];
      cols.forEach((col, i) => {
        const x = 18 + i * (W / 2);
        const w = W / 2 - 36;
        const k = ease((t - i * 0.6) * 2);
        g.globalAlpha = Math.max(0.15, k);
        box(g, x, 18, w, H - 40, { fill: col.bg || '#fff', r: 20 });
        emoji(g, col.e, x + w / 2, 78, 64);
        text(g, T(col.title), x + w / 2, 142, { size: 24, max: w - 20 });
        let y = 176;
        for (const it of col.items || []) {
          const used = para(g, '• ' + T(it), x + 18, y, w - 36, { size: 17, color: C.ink2 });
          y += used + 6;
        }
        g.globalAlpha = 1;
      });
      if (spec.mid) {
        box(g, W / 2 - 34, H / 2 - 24, 68, 48, { fill: C.sun, r: 14 });
        text(g, T(spec.mid), W / 2, H / 2, { size: 22 });
      }
    };
  },

  // Horizontal timeline.
  timeline(spec) {
    return (g, t, W, H, T) => {
      const ev = spec.events;
      const y = H / 2;
      g.strokeStyle = C.ink;
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(24, y);
      g.lineTo(W - 24, y);
      g.stroke();
      ev.forEach((e, i) => {
        const x = 50 + (i * (W - 100)) / (ev.length - 1);
        const up = i % 2 === 0;
        const k = ease((t - i * 0.35) * 2);
        g.globalAlpha = Math.max(0, Math.min(1, k));
        g.beginPath();
        g.arc(x, y, 10, 0, Math.PI * 2);
        g.fillStyle = C.accent;
        g.fill();
        g.lineWidth = 3;
        g.stroke();
        const by = up ? y - 190 : y + 30;
        box(g, x - 58, by, 116, 160, { fill: '#fff', r: 14 });
        text(g, e.y, x, by + 24, { size: 22, color: C.accent });
        emoji(g, e.e, x, by + 66, 38);
        const lines = T(e.t).split('\n');
        lines.forEach((ln, k2) => text(g, ln, x, by + 108 + k2 * 19, { size: 15, max: 108 }));
        g.globalAlpha = 1;
      });
    };
  },

  // One big emoji with a caption.
  big(spec) {
    return (g, t, W, H, T) => {
      const s = 1 + Math.sin(t * 2) * 0.04;
      g.save();
      g.translate(W / 2, H / 2 - 30);
      g.scale(s, s);
      emoji(g, spec.e, 0, 0, 170);
      g.restore();
      if (spec.t) {
        rr(g, 40, H - 110, W - 80, 76, 18);
        g.fillStyle = C.paper2;
        g.fill();
        text(g, T(spec.t), W / 2, H - 72, { size: 24, max: W - 110 });
      }
    };
  },
};
