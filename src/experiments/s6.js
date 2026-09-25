import { h, clear } from '../ui/dom.js';
import { btn, card, bubble, layout, canvasBox, slider, seg } from './kit.js';
import { C, text, emoji, dot, line, arrow, plotFrame, seeded } from '../ui/draw.js';

// ---------- Neuron Lab: should Bip go to the park? ----------
const INPUTS = [
  { e: '☀️', t: { en: 'Sunny', ro: 'Soare' } },
  { e: '📚', t: { en: 'Homework done', ro: 'Teme gata' } },
  { e: '🧑‍🤝‍🧑', t: { en: 'Friend free', ro: 'Prieten liber' } },
];
const CHALLENGES = [
  { id: 'sunny', level: 1, t: { en: 'YES only when it is sunny (the other two don\'t matter)', ro: 'DA doar când e soare (celelalte două nu contează)' }, f: (s) => s[0] === 1 },
  { id: 'and', level: 1, t: { en: 'YES only if it is sunny AND the homework is done', ro: 'DA doar dacă e soare ȘI temele sunt gata' }, f: (s) => s[0] === 1 && s[1] === 1 },
  { id: 'or', level: 2, t: { en: 'YES if it is sunny OR a friend is free (or both)', ro: 'DA dacă e soare SAU e liber un prieten (sau amândouă)' }, f: (s) => s[0] === 1 || s[2] === 1 },
  { id: 'major', level: 3, t: { en: 'YES if at least 2 of the 3 are true', ro: 'DA dacă cel puțin 2 din cele 3 sunt adevărate' }, f: (s) => s[0] + s[1] + s[2] >= 2 },
];
const COMBOS = [];
for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 2; c++) COMBOS.push([a, b, c]);

export const neuronLab = {
  icon: '⚡',
  title: { en: 'Neuron Lab: Park or Home?', ro: 'Laboratorul neuronului: parc sau acasă?' },
  desc: { en: 'Tune the weights and bias of a real neuron to solve logic puzzles.', ro: 'Reglează ponderile și bias-ul unui neuron adevărat ca să rezolvi puzzle-uri de logică.' },
  mount(root, api) {
    const T = api.T;
    const W = 600;
    const H = 360;
    const cb = canvasBox(W, H, { maxWidth: 640 });
    const x = [1, 0, 1];
    const w = [0, 0, 0];
    let b = 0;
    const list = CHALLENGES.filter((c) => c.level <= api.level);
    let ci = 0;
    const missions = api.missions(CHALLENGES.map((c) => ({ id: c.id, t: c.t, level: c.level })));
    const say = bubble('ada', '');
    const table = h('div');
    const chTitle = h('div', { class: 'intro', style: { fontWeight: 700 } });
    const toggles = h('div', { class: 'row-btns' });
    const sliders = [0, 1, 2].map((i) =>
      slider({ label: INPUTS[i].e + ' ' + T({ en: 'weight', ro: 'pondere' }), min: -3, max: 3, step: 0.5, value: 0, fmt: (v) => v.toFixed(1), onInput: (v) => { w[i] = v; update(); } }),
    );
    const sBias = slider({ label: '⚖️ ' + T({ en: 'bias', ro: 'bias' }), min: -5, max: 5, step: 0.5, value: 0, fmt: (v) => v.toFixed(1), onInput: (v) => { b = v; update(); } });
    const chSeg = seg(list.map((c, i) => ({ v: i, label: T({ en: 'Puzzle ', ro: 'Puzzle ' }) + (i + 1) })), 0, (v) => {
      ci = v;
      update();
    });
    INPUTS.forEach((inp, i) => {
      const t = h('button', { class: 'pick' + (x[i] ? ' sel' : ''), type: 'button' }, h('span', { class: 'e' }, inp.e), T(inp.t), h('b', null, String(x[i])));
      t.addEventListener('click', () => {
        x[i] = 1 - x[i];
        t.classList.toggle('sel', !!x[i]);
        t.querySelector('b').textContent = String(x[i]);
        api.sfx('click');
        update();
      });
      toggles.appendChild(t);
    });
    const out = (s) => w[0] * s[0] + w[1] * s[1] + w[2] * s[2] + b;

    function draw() {
      const g = cb.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, W, H);
      const nx = 360;
      const ny = H / 2;
      const sum = out(x);
      INPUTS.forEach((inp, i) => {
        const y = 60 + i * 120;
        const col = w[i] >= 0 ? C.mint : C.rose;
        line(g, 100, y, nx - 50, ny, w[i] === 0 ? '#d5dbec' : col, 2 + Math.abs(w[i]) * 2.2);
        dot(g, 70, y, 32, x[i] ? '#fff4d6' : '#eef1f8');
        emoji(g, inp.e, 70, y - 2, 30);
        text(g, String(x[i]), 22, y, { size: 22, color: C.ink2 });
        text(g, '× ' + w[i].toFixed(1), 190, y + (ny - y) * 0.35 - 14, { size: 16, color: w[i] === 0 ? C.muted : col });
      });
      const fire = sum > 0;
      dot(g, nx, ny, 52, fire ? '#ffe36b' : '#e4e9f7');
      text(g, 'Σ = ' + sum.toFixed(1), nx, ny - 8, { size: 20 });
      text(g, T({ en: 'bias ', ro: 'bias ' }) + b.toFixed(1), nx, ny + 18, { size: 14, color: C.grape });
      arrow(g, nx + 54, ny, 500, ny, { width: 5 });
      emoji(g, fire ? '🌳' : '🏠', 545, ny - 10, 52);
      text(g, fire ? T({ en: 'PARK!', ro: 'PARC!' }) : T({ en: 'HOME', ro: 'ACASĂ' }), 545, ny + 40, { size: 18, color: fire ? C.mint : C.rose });
      if (api.level >= 3) {
        const p = 1 / (1 + Math.exp(-sum * 1.5));
        text(g, T({ en: 'sigmoid: ', ro: 'sigmoidă: ' }) + Math.round(p * 100) + '%', 545, ny + 66, { size: 14, color: C.ink2 });
      }
    }

    function update() {
      const ch = list[ci];
      chTitle.textContent = '🎯 ' + T(ch.t);
      clear(table);
      const tbl = h('table', { style: { width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--display)', fontSize: '15px', textAlign: 'center' } });
      tbl.appendChild(h('tr', null, ...INPUTS.map((i) => h('th', null, i.e)), h('th', null, T({ en: 'Neuron', ro: 'Neuron' })), h('th', null, T({ en: 'Wanted', ro: 'Dorit' })), h('th', null, '')));
      let ok = 0;
      for (const s of COMBOS) {
        const got = out(s) > 0;
        const want = ch.f(s);
        if (got === want) ok++;
        tbl.appendChild(
          h(
            'tr',
            { style: { background: got === want ? '#e4f8ef' : '#ffe9e6' } },
            ...s.map((v) => h('td', null, String(v))),
            h('td', null, got ? T({ en: 'YES', ro: 'DA' }) : T({ en: 'NO', ro: 'NU' })),
            h('td', null, want ? T({ en: 'YES', ro: 'DA' }) : T({ en: 'NO', ro: 'NU' })),
            h('td', null, got === want ? '✅' : '❌'),
          ),
        );
      }
      table.appendChild(tbl);
      if (ok === 8) {
        if (missions.check(ch.id)) {
          say.set(T({ en: 'All 8 situations correct! 🎉 Your weights and bias solve this puzzle.', ro: 'Toate cele 8 situații sunt corecte! 🎉 Ponderile și bias-ul tău rezolvă acest puzzle.' }), 'happy');
          const nextIdx = list.findIndex((c, i) => i > ci && !missions.isDone(c.id));
          if (nextIdx >= 0) api.timeout(() => { chSeg.set(nextIdx); ci = nextIdx; update(); }, 1600);
        }
      } else {
        say.set(T({ en: `${ok} of 8 situations are right. Change the weights and bias to fix the red rows. Hint: the bias sets how much is "enough".`, ro: `${ok} din 8 situații sunt corecte. Schimbă ponderile și bias-ul ca să repari rândurile roșii. Indiciu: bias-ul stabilește cât e „destul”.` }));
      }
      draw();
    }

    layout(root, {
      intro: T({ en: 'The neuron decides: park or home? Tap the inputs to switch them between 0 and 1. The table checks all 8 possible situations at once.', ro: 'Neuronul decide: parc sau acasă? Apasă pe intrări ca să le schimbi între 0 și 1. Tabelul verifică deodată toate cele 8 situații posibile.' }),
      stage: [cb.wrap, card(T({ en: 'Inputs right now', ro: 'Intrările acum' }), toggles), card(null, chTitle, table)],
      side: [card(null, chSeg.el), card(T({ en: 'Weights and bias', ro: 'Ponderi și bias' }), ...sliders.map((s) => s.el), sBias.el), say.el, missions.el],
    });
    update();
  },
};

// ---------- Perceptron Trainer ----------
export const perceptronTrainer = {
  icon: '📐',
  title: { en: 'Watch a Neuron Learn', ro: 'Privește un neuron cum învață' },
  desc: { en: 'A perceptron adjusts its line after every mistake until it separates the two groups.', ro: 'Un perceptron își ajustează linia după fiecare greșeală până desparte cele două grupuri.' },
  mount(root, api) {
    const T = api.T;
    const W = 560;
    const H = 460;
    const cb = canvasBox(W, H, { maxWidth: 600 });
    let pts = [];
    let wv = [0, 0];
    let bias = 0;
    let cursor = 0;
    let running = false;
    let epochs = 0;
    let lastPt = null;
    let xor = false;
    let rounds = 0;
    let dataId = 0;
    let solvedId = -1;
    const missions = api.missions([
      { id: 'zero', t: { en: 'Train until the neuron makes 0 mistakes', ro: 'Antrenează până când neuronul face 0 greșeli' } },
      { id: 'again', t: { en: 'Press "New data" and train again from scratch', ro: 'Apasă „Date noi” și antrenează din nou de la zero' } },
      { id: 'xor', t: { en: 'Try the XOR data and see one neuron fail', ro: 'Încearcă datele XOR și vezi cum eșuează un singur neuron' }, level: 3 },
    ]);
    const say = bubble('ada', T({ en: 'Press "Train one step". The neuron checks one point. If it is on the wrong side, the line moves!', ro: 'Apasă „Antrenează un pas”. Neuronul verifică un punct. Dacă e pe partea greșită, linia se mută!' }));
    const stats = h('div', { class: 'note' });
    const newData = (isXor) => {
      xor = isXor;
      const R = seeded(Math.floor(Math.random() * 1e6) + 1);
      pts = [];
      if (xor) {
        for (let i = 0; i < 40; i++) {
          const x = R() * 2 - 1;
          const y = R() * 2 - 1;
          if (Math.abs(x) < 0.12 || Math.abs(y) < 0.12) continue;
          pts.push({ x, y, c: x * y > 0 ? 1 : 0 });
        }
      } else {
        const a = R() * Math.PI;
        const nx = Math.cos(a);
        const ny = Math.sin(a);
        const off = (R() - 0.5) * 0.4;
        while (pts.length < 34) {
          const x = R() * 2 - 1;
          const y = R() * 2 - 1;
          const d = x * nx + y * ny - off;
          if (Math.abs(d) < 0.12) continue;
          pts.push({ x, y, c: d > 0 ? 1 : 0 });
        }
      }
      dataId++;
      wv = [0.2, -0.6];
      bias = 0.1;
      cursor = 0;
      epochs = 0;
      running = false;
      runBtn.textContent = '▶ ' + T({ en: 'Train until done', ro: 'Antrenează până la capăt' });
      draw();
    };
    const pred = (p) => (wv[0] * p.x + wv[1] * p.y + bias > 0 ? 1 : 0);
    const mistakes = () => pts.filter((p) => pred(p) !== p.c).length;
    function step() {
      // Find the next misclassified point, starting from the cursor.
      for (let k = 0; k < pts.length; k++) {
        const i = (cursor + k) % pts.length;
        if (i === 0 && k > 0) epochs++;
        const p = pts[i];
        if (pred(p) !== p.c) {
          const t = p.c - pred(p);
          const lr = 0.15;
          wv[0] += lr * t * p.x;
          wv[1] += lr * t * p.y;
          bias += lr * t;
          lastPt = p;
          cursor = (i + 1) % pts.length;
          api.sfx('blip');
          draw();
          return true;
        }
      }
      lastPt = null;
      draw();
      return false;
    }
    function check() {
      const m = mistakes();
      if (m === 0) {
        running = false;
        runBtn.textContent = '▶ ' + T({ en: 'Train until done', ro: 'Antrenează până la capăt' });
        missions.check('zero');
        if (solvedId !== dataId) {
          solvedId = dataId;
          rounds++;
        }
        if (rounds >= 2) missions.check('again');
        say.set(T({ en: '0 mistakes! The neuron found a line that separates the two groups.', ro: '0 greșeli! Neuronul a găsit o linie care desparte cele două grupuri.' }), 'happy');
      } else if (xor && epochs >= 25) {
        running = false;
        runBtn.textContent = '▶ ' + T({ en: 'Train until done', ro: 'Antrenează până la capăt' });
        missions.check('xor');
        say.set(T({ en: `After ${epochs} rounds there are still ${m} mistakes. The line keeps jumping around. One straight line can never separate XOR. We need layers of neurons!`, ro: `După ${epochs} runde încă sunt ${m} greșeli. Linia tot sare de colo-colo. O singură linie dreaptă nu poate despărți niciodată XOR. Avem nevoie de straturi de neuroni!` }));
      }
    }
    const stepBtn = btn('👣 ' + T({ en: 'Train one step', ro: 'Antrenează un pas' }), () => {
      step();
      check();
    }, 'primary');
    const runBtn = btn('▶ ' + T({ en: 'Train until done', ro: 'Antrenează până la capăt' }), () => {
      running = !running;
      runBtn.textContent = running ? '⏸ ' + T({ en: 'Pause', ro: 'Pauză' }) : '▶ ' + T({ en: 'Train until done', ro: 'Antrenează până la capăt' });
    });
    const dataBtn = btn('🎲 ' + T({ en: 'New data', ro: 'Date noi' }), () => newData(false), 'small');
    const xorBtn = btn('✖️ ' + T({ en: 'XOR data', ro: 'Date XOR' }), () => {
      newData(true);
      say.set(T({ en: 'XOR: blue in two opposite corners, red in the other two. Can one line split them?', ro: 'XOR: albastru în două colțuri opuse, roșu în celelalte două. Poate o singură linie să le despartă?' }));
    }, 'small');
    if (api.level < 3) xorBtn.hidden = true;
    let acc = 0;
    api.raf((dt) => {
      if (!running) return;
      acc += dt;
      if (acc > 0.12) {
        acc = 0;
        step();
        check();
      }
    });
    function draw() {
      const g = cb.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, W, H);
      const f = plotFrame(g, { x: 20, y: 20, w: W - 40, h: H - 40, xmin: -1.1, xmax: 1.1, ymin: -1.1, ymax: 1.1, grid: false });
      // Shade both sides of the neuron's line.
      const cell = 14;
      for (let py = 20; py < H - 20; py += cell) {
        for (let px = 20; px < W - 20; px += cell) {
          const x = -1.1 + ((px + cell / 2 - 20) / (W - 40)) * 2.2;
          const y = 1.1 - ((py + cell / 2 - 20) / (H - 40)) * 2.2;
          g.fillStyle = wv[0] * x + wv[1] * y + bias > 0 ? 'rgba(42,157,244,0.13)' : 'rgba(242,70,75,0.13)';
          g.fillRect(px, py, cell, cell);
        }
      }
      // The line w0 x + w1 y + b = 0.
      if (Math.abs(wv[1]) > 1e-6 || Math.abs(wv[0]) > 1e-6) {
        let a;
        let bb;
        if (Math.abs(wv[1]) > Math.abs(wv[0])) {
          a = [-1.1, (-bias - wv[0] * -1.1) / wv[1]];
          bb = [1.1, (-bias - wv[0] * 1.1) / wv[1]];
        } else {
          a = [(-bias - wv[1] * -1.1) / wv[0], -1.1];
          bb = [(-bias - wv[1] * 1.1) / wv[0], 1.1];
        }
        line(g, f.X(a[0]), f.Y(a[1]), f.X(bb[0]), f.Y(bb[1]), C.accent, 5);
      }
      for (const p of pts) {
        const wrong = pred(p) !== p.c;
        dot(g, f.X(p.x), f.Y(p.y), 9, p.c ? C.blue : C.red, wrong ? '#000' : C.ink, wrong ? 3.5 : 2);
      }
      if (lastPt) {
        g.strokeStyle = C.grape;
        g.lineWidth = 3;
        g.beginPath();
        g.arc(f.X(lastPt.x), f.Y(lastPt.y), 18, 0, Math.PI * 2);
        g.stroke();
      }
      stats.innerHTML = '';
      stats.append(
        h('div', null, T({ en: 'Mistakes: ', ro: 'Greșeli: ' }), h('b', null, String(mistakes())), ' / ' + pts.length),
        h('div', null, T({ en: 'Rounds through the data: ', ro: 'Runde prin date: ' }), h('b', null, String(epochs))),
        h('div', null, `w₁ = ${wv[0].toFixed(2)}, w₂ = ${wv[1].toFixed(2)}, b = ${bias.toFixed(2)}`),
      );
    }
    layout(root, {
      intro: T({ en: 'Blue and red points are examples. The orange line is the neuron\'s decision. Points with a thick black ring are on the wrong side.', ro: 'Punctele albastre și roșii sunt exemple. Linia portocalie e decizia neuronului. Punctele cu cerc negru gros sunt pe partea greșită.' }),
      stage: [cb.wrap],
      side: [card(null, h('div', { class: 'row-btns' }, stepBtn, runBtn, dataBtn, xorBtn)), card(null, stats), say.el, missions.el],
    });
    newData(false);
  },
};
