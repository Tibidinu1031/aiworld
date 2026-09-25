import * as THREE from 'three';

const DISPLAY = '"Fredoka", "Segoe UI", system-ui, sans-serif';

function roundRect(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function wrap(g, text, maxW) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

// A board with a title and optional body text, drawn to a canvas texture.
// Returns a mesh whose texture can be redrawn with .redraw(spec).
export function makeBoard(spec, width = 2.4, height = 1.2) {
  const W = 512;
  const H = Math.round((W * height) / width);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  const redraw = (s) => {
    drawBoard(canvas, s);
    tex.needsUpdate = true;
  };
  redraw(spec);
  mesh.userData.redraw = redraw;
  return mesh;
}

export function drawBoard(canvas, s) {
  const g = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  g.clearRect(0, 0, W, H);
  const bg = s.bg || '#f6f9ff';
  const ink = s.ink || '#1d2340';
  const accent = s.accent || '#ff6b3d';
  roundRect(g, 6, 6, W - 12, H - 12, 28);
  g.fillStyle = bg;
  g.fill();
  g.lineWidth = 10;
  g.strokeStyle = ink;
  g.stroke();
  let y = 22;
  if (s.badge) {
    g.fillStyle = accent;
    roundRect(g, 26, 26, 86, 86, 22);
    g.fill();
    g.fillStyle = '#fff';
    g.font = `700 54px ${DISPLAY}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(s.badge, 69, 71);
  }
  if (s.eyebrow) {
    g.fillStyle = accent;
    g.font = `600 30px ${DISPLAY}`;
    g.textAlign = s.badge ? 'left' : 'center';
    g.textBaseline = 'top';
    g.fillText(s.eyebrow.toUpperCase(), s.badge ? 130 : W / 2, 30);
    y = 64;
  }
  if (s.title) {
    g.fillStyle = ink;
    const size = s.titleSize || 52;
    g.font = `700 ${size}px ${DISPLAY}`;
    g.textAlign = s.badge ? 'left' : 'center';
    g.textBaseline = 'top';
    const maxW = s.badge ? W - 160 : W - 60;
    const lines = wrap(g, s.title, maxW);
    for (const line of lines.slice(0, 2)) {
      g.fillText(line, s.badge ? 130 : W / 2, y + 8);
      y += size * 1.1;
    }
    y += 14;
  }
  if (s.body) {
    g.fillStyle = s.bodyInk || '#3b4266';
    const size = s.bodySize || 30;
    g.font = `500 ${size}px ${DISPLAY}`;
    g.textAlign = 'center';
    g.textBaseline = 'top';
    const lines = wrap(g, s.body, W - 70);
    y = Math.max(y, s.badge ? 124 : y);
    for (const line of lines) {
      if (y + size > H - 20) break;
      g.fillText(line, W / 2, y);
      y += size * 1.25;
    }
  }
  if (s.big) {
    g.fillStyle = s.bigInk || ink;
    g.font = `700 ${s.bigSize || 150}px ${DISPLAY}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(s.big, W / 2, H / 2 + (s.bigOffset || 0));
  }
}

// A simple word tile texture (for the language station).
export function wordTexture(text, bg, ink = '#1d2340') {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, 256, 128);
  g.strokeStyle = ink;
  g.lineWidth = 10;
  g.strokeRect(5, 5, 246, 118);
  g.fillStyle = ink;
  let size = 64;
  g.font = `700 ${size}px ${DISPLAY}`;
  while (g.measureText(text).width > 220 && size > 24) {
    size -= 4;
    g.font = `700 ${size}px ${DISPLAY}`;
  }
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 128, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
