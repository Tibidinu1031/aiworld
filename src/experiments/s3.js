import { h } from '../ui/dom.js';
import { btn, card, bubble, layout, canvasBox } from './kit.js';
import { C, text, plotFrame, emoji, seeded, gauss } from '../ui/draw.js';

// ---------- Feature Explorer ----------
const FEATS = [
  { id: 'weight', t: { en: '⚖️ Weight (g)', ro: '⚖️ Greutate (g)' }, min: 60, max: 240 },
  { id: 'length', t: { en: '📏 Length (cm)', ro: '📏 Lungime (cm)' }, min: 4, max: 26 },
  { id: 'red', t: { en: '🎨 Redness (0–1)', ro: '🎨 Cât de roșu (0–1)' }, min: 0, max: 1 },
  { id: 'round', t: { en: '⚪ Roundness (0–1)', ro: '⚪ Cât de rotund (0–1)' }, min: 0, max: 1.1 },
  { id: 'day', t: { en: '📅 Day picked (1–7)', ro: '📅 Ziua culesului (1–7)' }, min: 0.5, max: 7.5 },
  { id: 'sticker', t: { en: '🏷️ Sticker number', ro: '🏷️ Numărul etichetei' }, min: 0, max: 100 },
];

function makeData() {
  const R = seeded(71);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const data = [];
  for (let i = 0; i < 22; i++) {
    const green = i % 5 === 0;
    data.push({ k: 'apple', e: green ? '🍏' : '🍎', weight: 170 + gauss(R) * 22, length: 8 + gauss(R) * 0.8, red: clamp(green ? 0.2 + gauss(R) * 0.06 : 0.8 + gauss(R) * 0.08, 0, 1), round: clamp(0.88 + gauss(R) * 0.05, 0, 1.05), day: 1 + Math.floor(R() * 7), sticker: Math.floor(R() * 100) });
  }
  for (let i = 0; i < 22; i++) {
    data.push({ k: 'banana', e: '🍌', weight: 120 + gauss(R) * 14, length: 19 + gauss(R) * 1.8, red: clamp(0.07 + gauss(R) * 0.04, 0, 1), round: clamp(0.2 + gauss(R) * 0.05, 0, 1), day: 1 + Math.floor(R() * 7), sticker: Math.floor(R() * 100) });
  }
  for (let i = 0; i < 18; i++) {
    data.push({ k: 'orange', e: '🍊', weight: 150 + gauss(R) * 18, length: 7.5 + gauss(R) * 0.6, red: clamp(0.47 + gauss(R) * 0.05, 0, 1), round: clamp(0.97 + gauss(R) * 0.03, 0, 1.05), day: 1 + Math.floor(R() * 7), sticker: Math.floor(R() * 100) });
  }
  // Day and sticker get a small jitter so dots don't sit exactly on top of each other.
  data.forEach((d) => {
    d.day += (R() - 0.5) * 0.5;
  });
  return data;
}

// Leave-one-out nearest-neighbor accuracy: how well an AI could separate the fruit.
// With `only`, just those kinds are scored (their neighbors can still be any fruit).
function separation(data, fx, fy, only) {
  const sx = FEATS.find((f) => f.id === fx);
  const sy = FEATS.find((f) => f.id === fy);
  const nx = (v) => (v - sx.min) / (sx.max - sx.min);
  const ny = (v) => (v - sy.min) / (sy.max - sy.min);
  let right = 0;
  let n = 0;
  for (const a of data) {
    if (only && !only.includes(a.k)) continue;
    n++;
    let best = null;
    let bd = Infinity;
    for (const b of data) {
      if (a === b) continue;
      const d = (nx(a[fx]) - nx(b[fx])) ** 2 + (ny(a[fy]) - ny(b[fy])) ** 2;
      if (d < bd) {
        bd = d;
        best = b;
      }
    }
    if (best.k === a.k) right++;
  }
  return Math.round((right / n) * 100);
}

export const featurePlot = {
  icon: '📊',
  title: { en: 'Feature Explorer', ro: 'Exploratorul de trăsături' },
  desc: { en: 'Choose which features to plot and discover which ones help an AI tell fruits apart.', ro: 'Alege ce trăsături pui pe grafic și descoperă care ajută o IA să deosebească fructele.' },
  mount(root, api) {
    const T = api.T;
    const all = makeData();
    let fx = 'weight';
    let fy = 'day';
    let interacted = false;
    let oranges = false;
    const tried = new Set();
    const W = 600;
    const H = 460;
    const cb = canvasBox(W, H, { maxWidth: 640 });
    const missions = api.missions([
      { id: 'good', t: { en: 'Find two features that separate apples and bananas with a score of 95% or more', ro: 'Găsește două trăsături care despart merele de banane cu un scor de 95% sau mai mult' } },
      { id: 'bad', t: { en: 'Find a useless pair: score below 70%', ro: 'Găsește o pereche inutilă: scor sub 70%' } },
      { id: 'three', t: { en: 'Turn on oranges 🍊 and separate all three fruits with 90% or more', ro: 'Pornește portocalele 🍊 și desparte toate cele trei fructe cu 90% sau mai mult' }, level: 2 },
      { id: 'confuse', t: { en: 'With oranges on, find two size or shape features that mix up apples and oranges', ro: 'Cu portocalele pornite, găsește două trăsături de mărime sau formă care amestecă merele cu portocalele' }, level: 3 },
    ]);
    const say = bubble('ada', '');
    const scoreEl = h('div', { class: 'bigstat' });
    const meter = h('div', { class: 'meter' }, h('i'));
    const mkSelect = (val, on) => {
      const s = h('select', null, ...FEATS.map((f) => h('option', { value: f.id, selected: f.id === val ? true : null }, T(f.t))));
      s.value = val;
      s.addEventListener('change', () => on(s.value));
      return s;
    };
    const selX = mkSelect(fx, (v) => {
      fx = v;
      interacted = true;
      update();
    });
    const selY = mkSelect(fy, (v) => {
      fy = v;
      interacted = true;
      update();
    });
    const orangeBtn = btn('🍊 ' + T({ en: 'Add oranges', ro: 'Adaugă portocale' }), () => {
      oranges = !oranges;
      interacted = true;
      orangeBtn.classList.toggle('sun', oranges);
      update();
    }, 'small');
    if (api.level < 2) orangeBtn.hidden = true;

    function update() {
      const data = all.filter((d) => oranges || d.k !== 'orange');
      const sx = FEATS.find((f) => f.id === fx);
      const sy = FEATS.find((f) => f.id === fy);
      const g = cb.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, W, H);
      const f = plotFrame(g, { x: 70, y: 20, w: W - 100, h: H - 90, xmin: sx.min, xmax: sx.max, ymin: sy.min, ymax: sy.max, xlabel: T(sx.t), ylabel: T(sy.t) });
      for (let i = 0; i <= 4; i++) {
        const vx = sx.min + ((sx.max - sx.min) * i) / 4;
        const vy = sy.min + ((sy.max - sy.min) * i) / 4;
        text(g, fmt(vx), f.X(vx), H - 58, { size: 13, color: C.ink2 });
        text(g, fmt(vy), 48, f.Y(vy), { size: 13, color: C.ink2 });
      }
      for (const d of data) emoji(g, d.e, f.X(d[fx]), f.Y(d[fy]), 20);
      if (fx === fy) {
        scoreEl.textContent = '—';
        say.set(T({ en: 'Pick two different features!', ro: 'Alege două trăsături diferite!' }));
        return;
      }
      const s = separation(data, fx, fy);
      tried.add(fx + fy);
      scoreEl.textContent = s + '%';
      meter.className = 'meter' + (s < 70 ? ' bad' : s < 90 ? ' warn' : '');
      meter.firstChild.style.width = s + '%';
      if (!interacted) {
        say.set(T({ en: `Score: ${s}%. Change the features on the axes and watch the dots move!`, ro: `Scor: ${s}%. Schimbă trăsăturile de pe axe și privește cum se mută punctele!` }));
        return;
      }
      if (!oranges) {
        if (s >= 95) {
          missions.check('good');
          say.set(T({ en: `${s}%! With these features, apples and bananas sit in different places. An AI can easily tell them apart.`, ro: `${s}%! Cu aceste trăsături, merele și bananele stau în locuri diferite. O IA le poate deosebi ușor.` }), 'happy');
        } else if (s < 70) {
          missions.check('bad');
          say.set(T({ en: `Only ${s}%. The fruits are all mixed up: these features say nothing about the kind of fruit.`, ro: `Doar ${s}%. Fructele sunt amestecate: aceste trăsături nu spun nimic despre felul fructului.` }));
        } else say.set(T({ en: `${s}%. Not bad, but some fruits overlap. Can you find better features?`, ro: `${s}%. Nu e rău, dar unele fructe se suprapun. Poți găsi trăsături mai bune?` }));
      } else {
        const useless = ['day', 'sticker'].includes(fx) || ['day', 'sticker'].includes(fy);
        const appleOrange = separation(data, fx, fy, ['apple', 'orange']);
        if (s >= 90) {
          missions.check('three');
          say.set(T({ en: `${s}% with three fruits! Color helps tell apples from oranges.`, ro: `${s}% cu trei fructe! Culoarea ajută la deosebirea merelor de portocale.` }), 'happy');
        } else if (useless) {
          say.set(T({ en: `${s}%. The day it was picked and the sticker number say nothing about the fruit, so the dots get mixed up.`, ro: `${s}%. Ziua culesului și numărul etichetei nu spun nimic despre fruct, așa că punctele se amestecă.` }));
        } else if (appleOrange < 80) {
          missions.check('confuse');
          say.set(T({ en: `${s}%. The bananas are still easy, but apples and oranges are both round and about the same size and weight, so these features mix them up. Features must fit the question! Which feature IS different for apples and oranges?`, ro: `${s}%. Bananele sunt tot ușor de găsit, dar merele și portocalele sunt amândouă rotunde și cam de aceeași mărime și greutate, așa că aceste trăsături le amestecă. Trăsăturile trebuie să se potrivească întrebării! Ce trăsătură ESTE diferită la mere și portocale?` }));
        } else say.set(T({ en: `${s}%. Close! Which feature is different for apples and oranges?`, ro: `${s}%. Aproape! Ce trăsătură este diferită la mere și portocale?` }));
      }
    }
    function fmt(v) {
      return Math.abs(v) >= 10 ? String(Math.round(v)) : v.toFixed(1);
    }
    layout(root, {
      intro: T({ en: 'Each fruit is a dot. Pick the features for the two axes. The score shows how well an AI could tell the fruits apart using only those two features.', ro: 'Fiecare fruct e un punct. Alege trăsăturile pentru cele două axe. Scorul arată cât de bine ar putea o IA să deosebească fructele folosind doar aceste două trăsături.' }),
      stage: [cb.wrap],
      side: [
        card(T({ en: 'Axes', ro: 'Axe' }), h('div', { class: 'ctl' }, h('div', { class: 'lab' }, T({ en: 'Across →', ro: 'Pe orizontală →' })), selX), h('div', { class: 'ctl', style: { marginTop: '8px' } }, h('div', { class: 'lab' }, T({ en: 'Up ↑', ro: 'Pe verticală ↑' })), selY), h('div', { style: { marginTop: '10px' } }, orangeBtn)),
        card(T({ en: 'Separation score', ro: 'Scor de separare' }), scoreEl, meter),
        say.el,
        missions.el,
      ],
    });
    update();
  },
};
