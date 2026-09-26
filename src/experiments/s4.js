import { h } from '../ui/dom.js';
import { btn, card, bubble, layout, canvasBox, seg } from './kit.js';
import { C, text, dot, line, seeded, gauss } from '../ui/draw.js';

const COLS = [C.red, C.blue];

function knn(pts, x, y, k) {
  const near = pts.map((p) => ({ p, d: Math.hypot(p.x - x, p.y - y) })).sort((a, b) => a.d - b.d).slice(0, k);
  const votes = [0, 0];
  near.forEach((n) => votes[n.p.c]++);
  return { near, votes, c: votes[1] > votes[0] ? 1 : 0 };
}

export const knnPlayground = {
  icon: '🎯',
  title: { en: 'Nearest Neighbors Playground', ro: 'Locul de joacă al vecinilor' },
  desc: { en: 'Drag the mystery star around and watch its nearest neighbors vote on its class.', ro: 'Mută steaua misterioasă și privește cum votează vecinii ei cei mai apropiați.' },
  mount(root, api) {
    const T = api.T;
    const W = 600;
    const H = 450;
    const cb = canvasBox(W, H, { maxWidth: 640 });
    const base = () => {
      const R = seeded(12);
      const pts = [];
      for (let i = 0; i < 13; i++) pts.push({ x: 0.3 + gauss(R) * 0.11, y: 0.35 + gauss(R) * 0.11, c: 0 });
      for (let i = 0; i < 13; i++) pts.push({ x: 0.68 + gauss(R) * 0.11, y: 0.66 + gauss(R) * 0.11, c: 1 });
      return pts;
    };
    let pts = base();
    let star = { x: 0.28, y: 0.42 };
    let k = 3;
    let mode = 'move';
    let mapOn = false;
    let dragging = false;
    const kTried = new Set([3]);
    const outliers = [];
    let sawIsland = false; // saw the red island of an outlier on the map with k = 1
    let mapCache = null;
    const missions = api.missions([
      { id: 'blue', t: { en: 'Drag the star ⭐ until the AI says BLUE', ro: 'Mută steaua ⭐ până când IA spune ALBASTRU' } },
      { id: 'ks', t: { en: 'Try k = 1 and k = 7', ro: 'Încearcă k = 1 și k = 7' } },
      { id: 'disagree', t: { en: 'Find a spot where k = 1 and k = 7 give different answers', ro: 'Găsește un loc unde k = 1 și k = 7 dau răspunsuri diferite' }, level: 2 },
      { id: 'outlier', t: { en: 'Turn on the map, then add a red point deep inside the blue area', ro: 'Pornește harta, apoi adaugă un punct roșu adânc în zona albastră' }, level: 2 },
      { id: 'smooth', t: { en: 'Make the map ignore your outlier by choosing a bigger k', ro: 'Fă harta să ignore excepția ta alegând un k mai mare' }, level: 3 },
    ]);
    const say = bubble('ada', T({ en: 'Drag the yellow star. Lines show its k nearest neighbors. They vote!', ro: 'Mută steaua galbenă. Liniile arată cei mai apropiați k vecini ai ei. Ei votează!' }));
    const voteEl = h('div', { class: 'bigstat' });
    const kSeg = seg([1, 3, 5, 7].map((v) => ({ v, label: 'k = ' + v })), k, (v) => {
      k = v;
      kTried.add(v);
      mapCache = null;
      if (kTried.has(1) && kTried.has(7)) missions.check('ks');
      check();
      draw();
    });
    const modeSeg = seg(
      [
        { v: 'move', label: '⭐ ' + T({ en: 'Move star', ro: 'Mută steaua' }) },
        { v: 0, label: '🔴 ' + T({ en: 'Add red', ro: 'Adaugă roșu' }) },
        { v: 1, label: '🔵 ' + T({ en: 'Add blue', ro: 'Adaugă albastru' }) },
        { v: 'del', label: '🧽 ' + T({ en: 'Erase', ro: 'Șterge' }) },
      ],
      mode,
      (v) => (mode = v),
    );
    const mapBtn = btn('🗺️ ' + T({ en: 'Show map', ro: 'Arată harta' }), () => {
      mapOn = !mapOn;
      mapBtn.classList.toggle('sun', mapOn);
      check();
      draw();
    }, 'small');
    if (api.level < 2) mapBtn.hidden = true;
    const resetBtn = btn('🔁 ' + T({ en: 'Reset', ro: 'Resetează' }), () => {
      pts = base();
      outliers.length = 0;
      mapCache = null;
      draw();
    }, 'small');

    const X = (v) => v * W;
    const Y = (v) => (1 - v) * H;
    const IX = (px) => px / W;
    const IY = (py) => 1 - py / H;

    function draw() {
      const g = cb.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, W, H);
      g.strokeStyle = '#eef2fb';
      g.lineWidth = 1;
      for (let i = 1; i < 10; i++) {
        g.beginPath();
        g.moveTo((i * W) / 10, 0);
        g.lineTo((i * W) / 10, H);
        g.moveTo(0, (i * H) / 10);
        g.lineTo(W, (i * H) / 10);
        g.stroke();
      }
      if (mapOn) {
        if (!mapCache) {
          mapCache = [];
          const cell = 10;
          for (let yy = 0; yy < H; yy += cell) for (let xx = 0; xx < W; xx += cell) mapCache.push([xx, yy, knn(pts, IX(xx + cell / 2), IY(yy + cell / 2), k).c]);
        }
        for (const [xx, yy, c] of mapCache) {
          g.fillStyle = c ? 'rgba(42,157,244,0.2)' : 'rgba(242,70,75,0.2)';
          g.fillRect(xx, yy, 10, 10);
        }
      }
      const r = knn(pts, star.x, star.y, k);
      const far = r.near[r.near.length - 1];
      if (far) {
        g.strokeStyle = 'rgba(29,35,64,0.35)';
        g.setLineDash([6, 6]);
        g.lineWidth = 2;
        g.beginPath();
        g.arc(X(star.x), Y(star.y), Math.hypot(X(far.p.x) - X(star.x), Y(far.p.y) - Y(star.y)), 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
      }
      for (const n of r.near) line(g, X(star.x), Y(star.y), X(n.p.x), Y(n.p.y), COLS[n.p.c], 4);
      for (const p of pts) dot(g, X(p.x), Y(p.y), 9, COLS[p.c], outliers.includes(p) ? '#000' : C.ink, outliers.includes(p) ? 3.5 : 2);
      // Star.
      g.save();
      g.translate(X(star.x), Y(star.y));
      g.beginPath();
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
        const rr = i % 2 ? 8 : 18;
        g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      g.closePath();
      g.fillStyle = '#ffd23f';
      g.fill();
      g.strokeStyle = C.ink;
      g.lineWidth = 2.5;
      g.stroke();
      g.restore();
      const lab = r.c ? T({ en: 'BLUE', ro: 'ALBASTRU' }) : T({ en: 'RED', ro: 'ROȘU' });
      text(g, lab, X(star.x), Y(star.y) - 30, { size: 18, color: COLS[r.c] });
      voteEl.innerHTML = '';
      voteEl.append(
        h('span', { style: { color: C.red } }, '🔴 ' + r.votes[0]),
        '  ',
        h('span', { style: { color: C.blue } }, '🔵 ' + r.votes[1]),
        h('div', { class: 'note', style: { marginTop: '6px' } }, T({ en: 'Answer: ', ro: 'Răspuns: ' }) + lab),
      );
    }

    function check() {
      const r = knn(pts, star.x, star.y, k);
      if (r.c === 1) missions.check('blue');
      if (knn(pts, star.x, star.y, 1).c !== knn(pts, star.x, star.y, 7).c) {
        if (missions.check('disagree')) say.set(T({ en: 'Here k = 1 and k = 7 disagree! Near the border, how many neighbors you ask really matters.', ro: 'Aici k = 1 și k = 7 nu sunt de acord! Lângă frontieră contează mult câți vecini întrebi.' }));
      }
      if (mapOn && k === 1 && outliers.some((o) => o.c === 0)) sawIsland = true;
      // With k >= 3 the lonely red point (which counts itself) is outvoted by its blue neighbors.
      if (sawIsland && mapOn && k >= 3 && outliers.some((o) => o.c === 0 && knn(pts, o.x, o.y, k).c === 1)) {
        if (missions.check('smooth')) say.set(T({ en: 'With a bigger k, the lonely red point gets outvoted by its blue neighbors. The map is smooth again!', ro: 'Cu un k mai mare, punctul roșu singuratic pierde la vot în fața vecinilor albaștri. Harta e din nou netedă!' }), 'happy');
      }
    }

    cb.canvas.addEventListener('pointerdown', (e) => {
      const p = cb.pos(e);
      const nx = IX(p.x);
      const ny = IY(p.y);
      if (mode === 'move' || Math.hypot(X(star.x) - p.x, Y(star.y) - p.y) < 22) {
        dragging = true;
        cb.canvas.setPointerCapture(e.pointerId);
        star = { x: nx, y: ny };
      } else if (mode === 'del') {
        let best = -1;
        let bd = 20;
        pts.forEach((q, i) => {
          const d = Math.hypot(X(q.x) - p.x, Y(q.y) - p.y);
          if (d < bd) {
            bd = d;
            best = i;
          }
        });
        if (best >= 0) {
          const q = pts[best];
          pts.splice(best, 1);
          const oi = outliers.indexOf(q);
          if (oi >= 0) outliers.splice(oi, 1);
          api.sfx('pop');
        }
      } else {
        const np = { x: nx, y: ny, c: mode };
        // Is it an outlier? Its neighbors (before adding it) vote for the other class.
        const before = knn(pts, nx, ny, 5);
        pts.push(np);
        api.sfx('click');
        if (before.c !== np.c && before.votes[np.c] === 0) {
          outliers.push(np);
          if (mapOn && np.c === 0) {
            if (missions.check('outlier')) {
              if (k === 1) say.set(T({ en: 'See the little red island on the map? With k = 1, one odd point changes the answers all around it.', ro: 'Vezi insulița roșie de pe hartă? Cu k = 1, un singur punct ciudat schimbă răspunsurile din jurul lui.' }));
              else say.set(T({ en: `You added an outlier! With k = ${k} its blue neighbors outvote it. Now choose k = 1 and watch the map: a little red island appears around it.`, ro: `Ai adăugat o excepție! Cu k = ${k}, vecinii albaștri o înving la vot. Acum alege k = 1 și privește harta: apare o insuliță roșie în jurul ei.` }));
            }
          }
        }
      }
      mapCache = null;
      check();
      draw();
    });
    cb.canvas.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const p = cb.pos(e);
      star = { x: Math.max(0, Math.min(1, IX(p.x))), y: Math.max(0, Math.min(1, IY(p.y))) };
      check();
      draw();
    });
    cb.canvas.addEventListener('pointerup', () => (dragging = false));
    cb.canvas.addEventListener('pointercancel', () => (dragging = false));

    layout(root, {
      intro: T({ en: 'Red and blue dots are known examples. The star is a new example. Its k nearest neighbors vote to decide its class.', ro: 'Punctele roșii și albastre sunt exemple cunoscute. Steaua e un exemplu nou. Cei mai apropiați k vecini votează ca să-i decidă clasa.' }),
      stage: [cb.wrap, card(null, h('div', { class: 'row-btns' }, modeSeg.el))],
      side: [card(T({ en: 'Neighbors to ask', ro: 'Câți vecini întrebi' }), kSeg.el, h('div', { class: 'row-btns', style: { marginTop: '10px' } }, mapBtn, resetBtn)), card(T({ en: 'The vote', ro: 'Votul' }), voteEl), say.el, missions.el],
    });
    draw();
  },
};
