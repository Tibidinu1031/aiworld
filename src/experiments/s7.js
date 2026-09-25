import { h } from '../ui/dom.js';
import { btn, card, bubble, layout, canvasBox, slider, seg } from './kit.js';
import { C, text, dot, line, seeded, gauss } from '../ui/draw.js';
import { MLP } from './mlp.js';

function makeData(kind, seed = 5) {
  const R = seeded(seed);
  const pts = [];
  const N = 200;
  if (kind === 'blobs') {
    for (let i = 0; i < N; i++) {
      const c = i % 2;
      pts.push({ x: (c ? 0.45 : -0.45) + gauss(R) * 0.2, y: (c ? 0.4 : -0.35) + gauss(R) * 0.2, c });
    }
  } else if (kind === 'circle') {
    for (let i = 0; i < N; i++) {
      const c = i % 2;
      const r = c ? R() * 0.42 : 0.62 + R() * 0.33;
      const a = R() * Math.PI * 2;
      pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, c });
    }
  } else if (kind === 'xor') {
    for (let i = 0; i < N; i++) {
      let x = R() * 2 - 1;
      let y = R() * 2 - 1;
      x += Math.sign(x) * 0.08;
      y += Math.sign(y) * 0.08;
      pts.push({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)), c: x * y > 0 ? 1 : 0 });
    }
  } else {
    for (let i = 0; i < N; i++) {
      const c = i % 2;
      const t = (Math.floor(i / 2) / (N / 2)) * 3.2 + 0.25;
      const r = t / 3.6;
      const a = t * 2.1 + (c ? Math.PI : 0);
      pts.push({ x: Math.cos(a) * r + gauss(R) * 0.03, y: Math.sin(a) * r + gauss(R) * 0.03, c });
    }
  }
  return pts;
}

export const networkPlayground = {
  icon: '🕸️',
  title: { en: 'Neural Network Playground', ro: 'Locul de joacă al rețelei neuronale' },
  desc: { en: 'Build a real neural network, train it live, and watch it learn to separate tricky shapes.', ro: 'Construiește o rețea neuronală adevărată, antreneaz-o pe loc și privește cum învață să despartă forme dificile.' },
  mount(root, api) {
    const T = api.T;
    const W = 440;
    const H = 440;
    const main = canvasBox(W, H, { maxWidth: 480 });
    const netc = canvasBox(460, 240, { maxWidth: 480 });
    const lossc = canvasBox(460, 90, { maxWidth: 480 });
    let dataset = 'blobs';
    let layers = 0;
    let width = 4;
    let lr = 0.3;
    let act = 'tanh';
    let data = makeData(dataset);
    let net;
    let epoch = 0;
    let running = false;
    let losses = [];
    let seed = 3;
    let frame = 0;
    let lastAcc = 0;
    const accEl = h('div', { class: 'bigstat' });
    const epochEl = h('div', { class: 'note' });
    const paramsEl = h('div', { class: 'note' });
    const missions = api.missions([
      { id: 'blobs0', t: { en: 'Solve "Two groups" with NO hidden layer (95%+)', ro: 'Rezolvă „Două grupuri” FĂRĂ strat ascuns (95%+)' } },
      { id: 'circle0', t: { en: 'Try "Circle" with no hidden layer and see it fail (train 300+ epochs)', ro: 'Încearcă „Cerc” fără strat ascuns și vezi cum eșuează (antrenează 300+ epoci)' } },
      { id: 'circle1', t: { en: 'Add a hidden layer and solve "Circle" (95%+)', ro: 'Adaugă un strat ascuns și rezolvă „Cerc” (95%+)' } },
      { id: 'xor', t: { en: 'Solve "XOR" (95%+)', ro: 'Rezolvă „XOR” (95%+)' }, level: 2 },
      { id: 'spiral', t: { en: 'Solve the "Spiral" (85%+). Hint: 2 hidden layers, more neurons', ro: 'Rezolvă „Spirala” (85%+). Indiciu: 2 straturi ascunse, mai mulți neuroni' }, level: 3 },
    ]);
    const say = bubble('ada', T({ en: 'Pick a dataset, build a network, then press Train. The background shows what the network thinks.', ro: 'Alege un set de date, construiește o rețea, apoi apasă Antrenează. Fundalul arată ce crede rețeaua.' }));

    const rebuild = () => {
      const sizes = [2, ...Array(layers).fill(width), 1];
      net = new MLP(sizes, act, seed++);
      epoch = 0;
      losses = [];
      paramsEl.textContent = T({ en: `Parameters (weights + biases): ${net.paramCount}`, ro: `Parametri (ponderi + bias-uri): ${net.paramCount}` });
      drawAll(true);
    };
    const accuracy = () => data.filter((p) => (net.predict([p.x, p.y]) > 0.5 ? 1 : 0) === p.c).length / data.length;
    const lossNow = () => data.reduce((s, p) => {
      const q = net.predict([p.x, p.y]);
      return s - (p.c * Math.log(q + 1e-9) + (1 - p.c) * Math.log(1 - q + 1e-9));
    }, 0) / data.length;

    function trainEpoch() {
      const order = data.map((_, i) => i).sort(() => Math.random() - 0.5);
      for (let b = 0; b < order.length; b += 10) {
        const idx = order.slice(b, b + 10);
        net.trainBatch(idx.map((i) => [data[i].x, data[i].y]), idx.map((i) => data[i].c), lr);
      }
      epoch++;
    }

    function checkMissions(acc) {
      if (dataset === 'blobs' && layers === 0 && acc >= 0.95) {
        if (missions.check('blobs0')) say.set(T({ en: 'One single neuron is enough here: one straight line separates the two groups!', ro: 'Un singur neuron ajunge aici: o linie dreaptă desparte cele două grupuri!' }), 'happy');
      }
      if (dataset === 'circle' && layers === 0 && epoch >= 300 && acc < 0.8) {
        if (missions.check('circle0')) say.set(T({ en: 'See? A single neuron can only draw a straight line, and no line can wrap around a circle. Add a hidden layer!', ro: 'Vezi? Un singur neuron poate desena doar o linie dreaptă, și nicio linie nu poate înconjura un cerc. Adaugă un strat ascuns!' }));
      }
      if (dataset === 'circle' && layers >= 1 && acc >= 0.95) {
        if (missions.check('circle1')) say.set(T({ en: 'The hidden neurons each drew a line, and together they made a closed shape around the circle!', ro: 'Neuronii ascunși au desenat fiecare câte o linie, iar împreună au făcut o formă închisă în jurul cercului!' }), 'happy');
      }
      if (dataset === 'xor' && acc >= 0.95) {
        if (missions.check('xor')) say.set(T({ en: 'XOR solved! That is exactly what a single neuron could never do.', ro: 'XOR rezolvat! Exact ce un singur neuron nu putea face niciodată.' }), 'happy');
      }
      if (dataset === 'spiral' && acc >= 0.85) {
        if (missions.check('spiral')) say.set(T({ en: 'Wow, the spiral! Deeper networks can learn really twisty boundaries.', ro: 'Uau, spirala! Rețelele mai adânci pot învăța frontiere foarte răsucite.' }), 'happy');
      }
    }

    function drawMain() {
      const g = main.g;
      const cell = 11;
      for (let py = 0; py < H; py += cell) {
        for (let px = 0; px < W; px += cell) {
          const x = ((px + cell / 2) / W) * 2 - 1;
          const y = 1 - ((py + cell / 2) / H) * 2;
          const p = net.predict([x, y]);
          const r = Math.round(242 + (42 - 242) * p);
          const gg = Math.round(70 + (157 - 70) * p);
          const b = Math.round(75 + (244 - 75) * p);
          g.fillStyle = `rgba(${r},${gg},${b},${0.18 + Math.abs(p - 0.5) * 0.5})`;
          g.clearRect(px, py, cell, cell);
          g.fillStyle = '#fff';
          g.fillRect(px, py, cell, cell);
          g.fillStyle = `rgba(${r},${gg},${b},${0.15 + Math.abs(p - 0.5) * 0.55})`;
          g.fillRect(px, py, cell, cell);
        }
      }
      for (const p of data) dot(g, ((p.x + 1) / 2) * W, ((1 - p.y) / 2) * H, 4.5, p.c ? C.blue : C.red, '#fff', 1.5);
    }

    function drawNet() {
      const g = netc.g;
      const NW = 460;
      const NH = 240;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, NW, NH);
      const sizes = net.sizes;
      const pos = sizes.map((n, l) => {
        const x = 40 + ((NW - 80) * l) / (sizes.length - 1);
        return Array.from({ length: n }, (_, k) => ({ x, y: n === 1 ? NH / 2 : 30 + ((NH - 60) * k) / (n - 1) }));
      });
      for (let l = 0; l < net.W.length; l++) {
        net.W[l].forEach((row, j) => row.forEach((wv, i) => {
          const a = pos[l][i];
          const b = pos[l + 1][j];
          line(g, a.x, a.y, b.x, b.y, wv > 0 ? 'rgba(42,157,244,0.8)' : 'rgba(255,138,31,0.8)', Math.min(6, 0.5 + Math.abs(wv) * 1.2));
        }));
      }
      // Each hidden neuron shows a tiny map of what it responds to.
      pos.forEach((layer, l) => layer.forEach((n, k) => {
        if (l > 0 && l < sizes.length - 1 && api.level >= 2) {
          const s = 26;
          const res = 8;
          for (let yy = 0; yy < res; yy++) {
            for (let xx = 0; xx < res; xx++) {
              const acts = net.forward([(xx / (res - 1)) * 2 - 1, 1 - (yy / (res - 1)) * 2]);
              const v = acts[l][k];
              const t = act === 'tanh' ? (v + 1) / 2 : act === 'relu' ? Math.min(1, v) : v;
              g.fillStyle = `rgb(${Math.round(255 - 200 * t)},${Math.round(180 + 20 * t)},${Math.round(120 + 120 * t)})`;
              g.fillRect(n.x - s / 2 + (xx * s) / res, n.y - s / 2 + (yy * s) / res, s / res + 0.5, s / res + 0.5);
            }
          }
          g.strokeStyle = C.ink;
          g.lineWidth = 2;
          g.strokeRect(n.x - s / 2, n.y - s / 2, s, s);
        } else dot(g, n.x, n.y, 12, l === 0 ? '#d7f6ff' : l === sizes.length - 1 ? '#fff4d6' : '#ecdfff');
      }));
      text(g, 'x, y', 40, NH - 10, { size: 12, color: C.muted });
      text(g, T({ en: 'answer', ro: 'răspuns' }), NW - 40, NH - 10, { size: 12, color: C.muted });
    }

    function drawLoss() {
      const g = lossc.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, 460, 90);
      text(g, T({ en: 'Loss', ro: 'Eroare' }), 10, 12, { size: 12, align: 'left', color: C.ink2 });
      if (losses.length < 2) return;
      const mx = Math.max(...losses, 0.7);
      g.strokeStyle = C.accent;
      g.lineWidth = 2.5;
      g.beginPath();
      losses.forEach((v, i) => {
        const x = 10 + (i / Math.max(losses.length - 1, 1)) * 440;
        const y = 84 - (v / mx) * 64;
        i ? g.lineTo(x, y) : g.moveTo(x, y);
      });
      g.stroke();
    }

    function drawAll(full) {
      drawMain();
      if (full || frame % 6 === 0) drawNet();
      drawLoss();
      lastAcc = accuracy();
      accEl.textContent = Math.round(lastAcc * 100) + '%';
      epochEl.textContent = T({ en: 'Epochs trained: ', ro: 'Epoci de antrenare: ' }) + epoch;
    }

    api.raf(() => {
      if (!running) return;
      frame++;
      const t0 = performance.now();
      let n = 0;
      while (performance.now() - t0 < 10 && n < 20) {
        trainEpoch();
        n++;
      }
      if (frame % 3 === 0) {
        losses.push(lossNow());
        if (losses.length > 200) losses = losses.filter((_, i) => i % 2 === 0);
        drawAll(false);
        checkMissions(lastAcc);
      }
    });

    const playBtn = btn('▶ ' + T({ en: 'Train', ro: 'Antrenează' }), () => {
      running = !running;
      playBtn.textContent = running ? '⏸ ' + T({ en: 'Pause', ro: 'Pauză' }) : '▶ ' + T({ en: 'Train', ro: 'Antrenează' });
    }, 'primary');
    const resetBtn = btn('🔁 ' + T({ en: 'New weights', ro: 'Ponderi noi' }), () => rebuild(), 'small');
    const dataSeg = seg(
      [
        { v: 'blobs', label: T({ en: 'Two groups', ro: 'Două grupuri' }) },
        { v: 'circle', label: T({ en: 'Circle', ro: 'Cerc' }) },
        ...(api.level >= 2 ? [{ v: 'xor', label: 'XOR' }] : []),
        ...(api.level >= 3 ? [{ v: 'spiral', label: T({ en: 'Spiral', ro: 'Spirală' }) }] : []),
      ],
      dataset,
      (v) => {
        dataset = v;
        data = makeData(v);
        rebuild();
      },
    );
    const layerSeg = seg([0, 1, 2].map((v) => ({ v, label: String(v) })), layers, (v) => {
      layers = v;
      rebuild();
    });
    const sWidth = slider({ label: T({ en: 'Neurons per hidden layer', ro: 'Neuroni pe strat ascuns' }), min: 1, max: 8, step: 1, value: width, onInput: (v) => { width = v; rebuild(); } });
    const lrs = [0.01, 0.03, 0.1, 0.3, 1, 3];
    const sLr = slider({ label: T({ en: 'Learning rate', ro: 'Rata de învățare' }), min: 0, max: 5, step: 1, value: 3, fmt: (v) => String(lrs[v]), onInput: (v) => (lr = lrs[v]) });
    if (api.level < 2) sLr.el.hidden = true;
    const actSeg = seg([{ v: 'tanh', label: 'tanh' }, { v: 'relu', label: 'ReLU' }, { v: 'sigmoid', label: 'sigmoid' }], act, (v) => {
      act = v;
      rebuild();
    });
    const actBox = h('div', { class: 'ctl' }, h('div', { class: 'lab' }, T({ en: 'Activation', ro: 'Activare' })), actSeg.el);
    if (api.level < 3) actBox.hidden = true;

    layout(root, {
      intro: T({ en: 'Red and blue dots must be separated. Blue background = the network says blue, red = it says red. Watch the network learn in real time!', ro: 'Punctele roșii și albastre trebuie despărțite. Fundal albastru = rețeaua spune albastru, roșu = spune roșu. Privește rețeaua învățând în timp real!' }),
      stage: [main.wrap, card(T({ en: 'The network', ro: 'Rețeaua' }), netc.wrap, paramsEl), lossc.wrap],
      side: [
        card(null, h('div', { class: 'row-btns' }, playBtn, resetBtn), h('div', { class: 'row-btns', style: { marginTop: '8px', alignItems: 'baseline' } }, accEl, h('span', { class: 'note' }, T({ en: 'correct', ro: 'corecte' }))), epochEl),
        card(
          T({ en: 'Build it', ro: 'Construiește' }),
          h('div', { class: 'ctl' }, h('div', { class: 'lab' }, T({ en: 'Dataset', ro: 'Set de date' })), dataSeg.el),
          h('div', { class: 'ctl', style: { marginTop: '8px' } }, h('div', { class: 'lab' }, T({ en: 'Hidden layers', ro: 'Straturi ascunse' })), layerSeg.el),
          sWidth.el,
          sLr.el,
          actBox,
        ),
        say.el,
        missions.el,
      ],
    });
    rebuild();
  },
};
