// Canvas helpers shared by lesson visuals and experiments.
export const FONT = '"Fredoka", "Segoe UI", system-ui, sans-serif';
export const BODY = '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif';
export const EMOJI = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

export const C = {
  ink: '#1d2340',
  ink2: '#3b4266',
  muted: '#8a92b5',
  paper: '#f6f9ff',
  paper2: '#e8eefc',
  line: '#c3cdea',
  grid: '#e3e9f8',
  accent: '#ff6b3d',
  sun: '#ffd23f',
  mint: '#1fbfa2',
  grape: '#7b5cff',
  rose: '#f2464b',
  sky: '#2a9df4',
  red: '#f2464b',
  blue: '#2a9df4',
  yellow: '#ffc21a',
  green: '#43b05c',
  orange: '#ff8a1f',
  pink: '#ff4d9d',
  white: '#ffffff',
};

// Size a canvas for crisp drawing at a fixed logical size.
export function setupCanvas(canvas, W, H) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(H * dpr);
  const g = canvas.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return g;
}

// Pointer position in the canvas's logical coordinates.
export function toLogical(canvas, e, W, H) {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}

export function rr(g, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function box(g, x, y, w, h, { fill = '#fff', stroke = C.ink, lw = 3, r = 12, shadow = true } = {}) {
  if (shadow) {
    rr(g, x, y + 3, w, h, r);
    g.fillStyle = stroke;
    g.fill();
  }
  rr(g, x, y, w, h, r);
  g.fillStyle = fill;
  g.fill();
  if (lw) {
    g.lineWidth = lw;
    g.strokeStyle = stroke;
    g.stroke();
  }
}

export function text(g, str, x, y, { size = 20, weight = 600, color = C.ink, align = 'center', base = 'middle', font = FONT, max } = {}) {
  g.font = `${weight} ${size}px ${font}`;
  g.fillStyle = color;
  g.textAlign = align;
  g.textBaseline = base;
  if (max) {
    let s = size;
    while (g.measureText(str).width > max && s > 9) {
      s -= 1;
      g.font = `${weight} ${s}px ${font}`;
    }
  }
  g.fillText(str, x, y);
}

// Wrapped text; returns the height used.
export function para(g, str, x, y, maxW, { size = 18, lh = 1.35, color = C.ink2, align = 'left', weight = 500, font = FONT } = {}) {
  g.font = `${weight} ${size}px ${font}`;
  g.fillStyle = color;
  g.textAlign = align;
  g.textBaseline = 'top';
  const words = String(str).split(' ');
  let line = '';
  let yy = y;
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) {
      g.fillText(line, x, yy);
      line = w;
      yy += size * lh;
    } else line = test;
  }
  if (line) g.fillText(line, x, yy);
  return yy + size * lh - y;
}

export function emoji(g, e, x, y, size = 40) {
  g.font = `${size}px ${EMOJI}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#000';
  g.fillText(e, x, y + size * 0.05);
}

export function arrow(g, x1, y1, x2, y2, { color = C.ink, width = 4, head = 12, dash = null } = {}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  g.strokeStyle = color;
  g.fillStyle = color;
  g.lineWidth = width;
  g.lineCap = 'round';
  if (dash) g.setLineDash(dash);
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2 - Math.cos(a) * head * 0.8, y2 - Math.sin(a) * head * 0.8);
  g.stroke();
  g.setLineDash([]);
  g.beginPath();
  g.moveTo(x2, y2);
  g.lineTo(x2 - Math.cos(a - 0.45) * head, y2 - Math.sin(a - 0.45) * head);
  g.lineTo(x2 - Math.cos(a + 0.45) * head, y2 - Math.sin(a + 0.45) * head);
  g.closePath();
  g.fill();
}

export function dot(g, x, y, r, fill, stroke = C.ink, lw = 2.5) {
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fillStyle = fill;
  g.fill();
  if (stroke) {
    g.lineWidth = lw;
    g.strokeStyle = stroke;
    g.stroke();
  }
}

export function line(g, x1, y1, x2, y2, color = C.ink, width = 2, dash = null) {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.lineCap = 'round';
  if (dash) g.setLineDash(dash);
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
  g.stroke();
  g.setLineDash([]);
}

// Plot frame with axes; returns mapping functions.
export function plotFrame(g, { x, y, w, h, xmin, xmax, ymin, ymax, xlabel, ylabel, grid = true, ticks = 5 }) {
  const X = (v) => x + ((v - xmin) / (xmax - xmin)) * w;
  const Y = (v) => y + h - ((v - ymin) / (ymax - ymin)) * h;
  g.fillStyle = '#fff';
  g.fillRect(x, y, w, h);
  if (grid) {
    g.strokeStyle = C.grid;
    g.lineWidth = 1;
    for (let i = 0; i <= ticks; i++) {
      const gx = x + (w * i) / ticks;
      const gy = y + (h * i) / ticks;
      g.beginPath();
      g.moveTo(gx, y);
      g.lineTo(gx, y + h);
      g.moveTo(x, gy);
      g.lineTo(x + w, gy);
      g.stroke();
    }
  }
  g.strokeStyle = C.ink;
  g.lineWidth = 2.5;
  g.beginPath();
  g.moveTo(x, y);
  g.lineTo(x, y + h);
  g.lineTo(x + w, y + h);
  g.stroke();
  if (xlabel) text(g, xlabel, x + w / 2, y + h + 22, { size: 15, weight: 600, color: C.ink2 });
  if (ylabel) {
    g.save();
    g.translate(x - 22, y + h / 2);
    g.rotate(-Math.PI / 2);
    text(g, ylabel, 0, 0, { size: 15, weight: 600, color: C.ink2 });
    g.restore();
  }
  return { X, Y, ix: (px) => xmin + ((px - x) / w) * (xmax - xmin), iy: (py) => ymin + ((y + h - py) / h) * (ymax - ymin) };
}

export function clearBg(g, W, H, color = '#fff') {
  g.fillStyle = color;
  g.fillRect(0, 0, W, H);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function ease(t) {
  t = Math.max(0, Math.min(1, t));
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function seeded(seed) {
  let s = seed || 1;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

export function gauss(rnd) {
  const u = Math.max(1e-9, rnd());
  const v = rnd();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
