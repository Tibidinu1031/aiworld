import { h, clear } from '../ui/dom.js';
import { btn, card, bubble, layout, canvasBox, seg, slider } from './kit.js';
import { C, text } from '../ui/draw.js';

// ---------- Pixel Painter ----------
export const pixelPainter = {
  icon: '🎨',
  title: { en: 'Pixel Painter', ro: 'Pictorul de pixeli' },
  desc: { en: 'Paint a picture, then see the numbers a computer actually stores.', ro: 'Pictează o imagine, apoi vezi numerele pe care le păstrează de fapt calculatorul.' },
  mount(root, api) {
    const T = api.T;
    const N = 10;
    const S = 48;
    const cb = canvasBox(N * S, N * S, { maxWidth: 520 });
    let px = [];
    let showNums = false;
    let color = false;
    let brush = [0, 0, 0];
    let hover = null;
    let painting = false;
    const missions = api.missions([
      { id: 'paint', t: { en: 'Paint at least 15 pixels', ro: 'Pictează cel puțin 15 pixeli' } },
      { id: 'nums', t: { en: 'Switch on "Show numbers" to see what the computer sees', ro: 'Pornește „Arată numerele” ca să vezi ce vede calculatorul' } },
      { id: 'invert', t: { en: 'Press "Invert": every number becomes 255 minus itself', ro: 'Apasă „Inversează”: fiecare număr devine 255 minus el însuși' }, level: 2 },
      { id: 'yellow', t: { en: 'In color mode, paint a yellow pixel (255, 255, 0)', ro: 'În modul color, pictează un pixel galben (255, 255, 0)' }, level: 3 },
    ]);
    const say = bubble('bip', T({ en: 'Click and drag on the grid to paint!', ro: 'Apasă și trage pe grilă ca să pictezi!' }));
    const readout = h('div', { class: 'note' });
    const rowOut = h('code', { style: { display: 'block', whiteSpace: 'pre-wrap', fontSize: '13px', padding: '8px', marginTop: '6px' } });

    const clearAll = () => {
      px = Array.from({ length: N * N }, () => [255, 255, 255]);
      draw();
    };
    const count = () => px.filter((p) => !(p[0] === 255 && p[1] === 255 && p[2] === 255)).length;

    function draw() {
      const g = cb.g;
      g.clearRect(0, 0, N * S, N * S);
      for (let i = 0; i < N * N; i++) {
        const x = (i % N) * S;
        const y = Math.floor(i / N) * S;
        const [r, gg, b] = px[i];
        g.fillStyle = `rgb(${r},${gg},${b})`;
        g.fillRect(x, y, S, S);
        g.strokeStyle = '#c9d2ea';
        g.lineWidth = 1;
        g.strokeRect(x + 0.5, y + 0.5, S - 1, S - 1);
        if (showNums) {
          const light = (r + gg + b) / 3 > 140;
          const ink = light ? C.ink : '#ffffff';
          if (color) {
            text(g, String(r), x + S / 2, y + 12, { size: 11, color: ink, weight: 700 });
            text(g, String(gg), x + S / 2, y + 24, { size: 11, color: ink, weight: 700 });
            text(g, String(b), x + S / 2, y + 36, { size: 11, color: ink, weight: 700 });
          } else text(g, String(r), x + S / 2, y + S / 2, { size: 14, color: ink, weight: 700 });
        }
      }
      if (hover != null) {
        g.strokeStyle = C.accent;
        g.lineWidth = 3;
        g.strokeRect((hover % N) * S + 1.5, Math.floor(hover / N) * S + 1.5, S - 3, S - 3);
        const v = px[hover];
        readout.textContent = color
          ? T({ en: `This pixel: R=${v[0]}, G=${v[1]}, B=${v[2]}`, ro: `Acest pixel: R=${v[0]}, G=${v[1]}, B=${v[2]}` })
          : T({ en: `This pixel = ${v[0]}`, ro: `Acest pixel = ${v[0]}` });
        const row = Math.floor(hover / N);
        const vals = [];
        for (let x = 0; x < N; x++) {
          const p = px[row * N + x];
          vals.push(color ? `(${p.join(',')})` : String(p[0]));
        }
        rowOut.textContent = T({ en: `Row ${row + 1}: `, ro: `Rândul ${row + 1}: ` }) + '[' + vals.join(', ') + ']';
      }
    }

    const paintAt = (e) => {
      const p = cb.pos(e);
      const x = Math.floor(p.x / S);
      const y = Math.floor(p.y / S);
      if (x < 0 || y < 0 || x >= N || y >= N) return;
      const i = y * N + x;
      hover = i;
      if (painting) {
        px[i] = brush.slice();
        if (count() >= 15) missions.check('paint');
        if (color && px.some((q) => q[0] === 255 && q[1] === 255 && q[2] === 0)) missions.check('yellow');
      }
      draw();
    };
    cb.canvas.addEventListener('pointerdown', (e) => {
      painting = true;
      cb.canvas.setPointerCapture(e.pointerId);
      paintAt(e);
    });
    cb.canvas.addEventListener('pointermove', paintAt);
    cb.canvas.addEventListener('pointerup', () => (painting = false));
    cb.canvas.addEventListener('pointercancel', () => (painting = false));
    cb.canvas.addEventListener('pointerleave', () => {
      hover = null;
      draw();
    });

    const grayBrushes = seg(
      [
        { v: 0, label: '⬛ 0' },
        { v: 128, label: '◼ 128' },
        { v: 200, label: '◻ 200' },
        { v: 255, label: '⬜ 255' },
      ],
      0,
      (v) => (brush = [v, v, v]),
    );
    const colorBrushes = seg(
      [
        { v: '255,0,0', label: '🟥' },
        { v: '0,200,0', label: '🟩' },
        { v: '0,0,255', label: '🟦' },
        { v: '255,255,0', label: '🟨' },
        { v: '0,0,0', label: '⬛' },
        { v: '255,255,255', label: '⬜' },
      ],
      '255,0,0',
      (v) => {
        brush = v.split(',').map(Number);
        rgb.forEach((s, k) => s.set(brush[k]));
      },
    );
    const rgb = ['R', 'G', 'B'].map((c, k) =>
      slider({ label: c, min: 0, max: 255, step: 1, value: k === 0 ? 255 : 0, onInput: () => (brush = rgb.map((s) => s.get())) }),
    );
    const colorBox = h('div', { class: 'ctl', hidden: true }, colorBrushes.el, ...rgb.map((s) => s.el));
    const grayBox = h('div', { class: 'ctl' }, grayBrushes.el);

    const numsBtn = btn('🔢 ' + T({ en: 'Show numbers', ro: 'Arată numerele' }), () => {
      showNums = !showNums;
      numsBtn.classList.toggle('sun', showNums);
      if (showNums) {
        missions.check('nums');
        say.set(T({ en: 'This is how I see pictures: just numbers! 0 is black, 255 is white.', ro: 'Așa văd eu pozele: doar numere! 0 e negru, 255 e alb.' }), 'happy');
      }
      draw();
    });
    const invBtn = btn('🔄 ' + T({ en: 'Invert', ro: 'Inversează' }), () => {
      px = px.map((p) => p.map((v) => 255 - v));
      missions.check('invert');
      say.set(T({ en: 'Invert did simple math on every number: new = 255 − old. Photo filters work like this!', ro: 'Inversarea a făcut un calcul simplu cu fiecare număr: nou = 255 − vechi. Filtrele foto funcționează așa!' }));
      draw();
    });
    const modeBtn = btn('🌈 ' + T({ en: 'Color mode', ro: 'Mod color' }), () => {
      color = !color;
      colorBox.hidden = !color;
      grayBox.hidden = color;
      modeBtn.classList.toggle('sun', color);
      brush = color ? [255, 0, 0] : [0, 0, 0];
      colorBrushes.set('255,0,0');
      rgb.forEach((sl, k) => sl.set(brush[k]));
      grayBrushes.set(0);
      if (color) say.set(T({ en: 'In color, each pixel has 3 numbers: Red, Green, Blue. Mix them!', ro: 'În color, fiecare pixel are 3 numere: roșu, verde, albastru. Amestecă-le!' }));
      else if (px.some((p) => p[0] !== p[1] || p[1] !== p[2])) {
        // Back to black and white: each pixel's 3 numbers become one brightness number.
        px = px.map((p) => {
          const v = Math.round(0.299 * p[0] + 0.587 * p[1] + 0.114 * p[2]);
          return [v, v, v];
        });
        say.set(T({ en: "Back to black and white: each pixel's 3 color numbers became 1 brightness number. Green counts the most, because our eyes are most sensitive to green!", ro: 'Înapoi la alb-negru: cele 3 numere de culoare ale fiecărui pixel au devenit 1 număr pentru luminozitate. Verdele contează cel mai mult, pentru că ochii noștri sunt cei mai sensibili la verde!' }));
      }
      draw();
    });
    if (api.level < 2) invBtn.hidden = true;
    if (api.level < 3) modeBtn.hidden = true;
    const smiley = btn('🙂 ' + T({ en: 'Smiley', ro: 'Zâmbăreț' }), () => {
      const pat = ['..........', '..######..', '.#......#.', '#..#..#..#', '#........#', '#.#....#.#', '#..####..#', '.#......#.', '..######..', '..........'];
      px = pat.join('').split('').map((c) => (c === '#' ? [0, 0, 0] : [255, 255, 255]));
      missions.check('paint');
      draw();
    });

    layout(root, {
      intro: T({ en: 'Paint on the grid. Then switch on the numbers to see the picture the way a computer stores it.', ro: 'Pictează pe grilă. Apoi pornește numerele ca să vezi poza așa cum o păstrează un calculator.' }),
      stage: [cb.wrap, card(null, readout, rowOut)],
      side: [
        say.el,
        card(T({ en: 'Brush', ro: 'Pensulă' }), grayBox, colorBox),
        card(null, h('div', { class: 'row-btns' }, numsBtn, invBtn, modeBtn, smiley, btn('🧽 ' + T({ en: 'Clear', ro: 'Șterge' }), clearAll, 'small'))),
        missions.el,
      ],
    });
    readout.textContent = T({ en: 'Hover over a pixel to read its value.', ro: 'Ține mouse-ul pe un pixel ca să-i citești valoarea.' });
    clearAll();
  },
};

// ---------- Label Factory ----------
const KINDS = {
  apple: { e: ['🍎', '🍏'], n: { en: 'apple', ro: 'măr' }, color: '#f2464b' },
  banana: { e: ['🍌'], n: { en: 'banana', ro: 'banană' }, color: '#ffc21a' },
  orange: { e: ['🍊'], n: { en: 'orange', ro: 'portocală' }, color: '#ff8a1f' },
};
const ORDER = ['apple', 'banana', 'orange'];

// Features the AI measures: [color hue, length, roundness].
function features(kind, sub, j) {
  const wob = (k) => Math.sin(j * 12.9898 + k * 78.233) * 0.5;
  if (kind === 'apple') return sub === 1 ? [0.35 + wob(1) * 0.1, 1 + wob(2) * 0.1, 0.9 + wob(3) * 0.05] : [0.0 + wob(1) * 0.08, 1 + wob(2) * 0.1, 0.9 + wob(3) * 0.05];
  if (kind === 'banana') return [0.17 + wob(1) * 0.05, 3 + wob(2) * 0.3, 0.2 + wob(3) * 0.1];
  return [0.09 + wob(1) * 0.03, 1.05 + wob(2) * 0.08, 1 + wob(3) * 0.03];
}

export const labelFactory = {
  icon: '🏷️',
  title: { en: 'The Label Factory', ro: 'Fabrica de etichete' },
  desc: { en: 'Label fruit for an AI, then find the sneaky wrong labels that make it fail.', ro: 'Etichetează fructe pentru o IA, apoi găsește etichetele greșite care o încurcă.' },
  mount(root, api) {
    const T = api.T;
    const missions = api.missions([
      { id: 'label', t: { en: 'Label 8 fruits on the conveyor belt', ro: 'Etichetează 8 fructe de pe banda rulantă' } },
      { id: 'fix', t: { en: 'Find and fix all 4 wrong labels in the dataset', ro: 'Găsește și corectează toate cele 4 etichete greșite din setul de date' } },
    ]);
    const say = bubble('ada', T({ en: 'Part 1: you are the labeler. What is each fruit?', ro: 'Partea 1: tu ești cel care pune etichete. Ce fruct este fiecare?' }));

    // Part 1: conveyor labeling.
    const belt = h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '120px', fontSize: '84px' } });
    const labelBtns = h('div', { class: 'row-btns', style: { justifyContent: 'center' } });
    const beltInfo = h('div', { class: 'note', style: { textAlign: 'center' } });
    let labeled = 0;
    let cur = null;
    const nextFruit = () => {
      const kinds = ['apple', 'apple', 'banana', 'orange'];
      const k = kinds[Math.floor(Math.random() * kinds.length)];
      const e = KINDS[k].e[Math.floor(Math.random() * KINDS[k].e.length)];
      cur = { k, e };
      belt.textContent = e;
      belt.animate([{ transform: 'translateX(120px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 300, easing: 'ease-out' });
      beltInfo.textContent = T({ en: `Labeled: ${labeled} / 8`, ro: `Etichetate: ${labeled} / 8` });
    };
    for (const k of ORDER) {
      const b = btn('🏷️ ' + T(KINDS[k].n), () => {
        if (!cur) return;
        if (k === cur.k) {
          labeled++;
          api.sfx('good');
          if (labeled >= 8) {
            missions.check('label');
            say.set(T({ en: 'Great labeling! Now Part 2: someone else labeled this dataset and made 4 mistakes. Click a card to change its label.', ro: 'Ai etichetat excelent! Acum Partea 2: altcineva a etichetat acest set de date și a greșit de 4 ori. Apasă pe un cartonaș ca să-i schimbi eticheta.' }));
          }
        } else {
          api.sfx('bad');
          say.set(T({ en: 'Careful! A wrong label teaches the AI something wrong.', ro: 'Atenție! O etichetă greșită învață IA ceva greșit.' }));
        }
        nextFruit();
      }, 'small');
      labelBtns.appendChild(b);
    }

    // Part 2: fix the dataset. 18 training fruits, 4 mislabeled.
    const train = [];
    let j = 0;
    for (const [kind, sub, n] of [['apple', 0, 4], ['apple', 1, 2], ['banana', 0, 6], ['orange', 0, 6]]) {
      for (let i = 0; i < n; i++) train.push({ kind, sub, e: KINDS[kind].e[sub], f: features(kind, sub, j++), label: kind });
    }
    const wrong = [[8, 'apple'], [14, 'banana'], [1, 'orange'], [5, 'banana']];
    for (const [i, lab] of wrong) train[i].label = lab;
    // Test fruits: close copies of some training fruits (including the mislabeled ones).
    const testIdx = [0, 1, 4, 5, 6, 8, 9, 12, 13, 14, 15, 16];
    const test = testIdx.map((i) => ({ kind: train[i].kind, f: train[i].f.map((v, k) => v + Math.sin(i * 3.1 + k) * 0.01) }));
    const scale = [1 / 0.35, 1 / 2, 1 / 0.8];
    const predict = (f) => {
      let best = null;
      let bd = Infinity;
      for (const t of train) {
        const d = t.f.reduce((s, v, k) => s + ((v - f[k]) * scale[k]) ** 2, 0);
        if (d < bd) {
          bd = d;
          best = t;
        }
      }
      return best.label;
    };
    const grid = h('div', { class: 'cards' });
    const acc = h('div', { class: 'bigstat' });
    const meter = h('div', { class: 'meter' }, h('i'));
    const renderSet = () => {
      clear(grid);
      train.forEach((t) => {
        const c = h(
          'button',
          { class: 'pick', type: 'button', style: { minWidth: '88px' } },
          h('span', { class: 'e' }, t.e),
          h('span', { style: { background: KINDS[t.label].color, color: '#1d2340', borderRadius: '8px', padding: '0 6px', border: '2px solid #1d2340' } }, T(KINDS[t.label].n)),
        );
        c.addEventListener('click', () => {
          t.label = ORDER[(ORDER.indexOf(t.label) + 1) % 3];
          api.sfx('click');
          renderSet();
        });
        grid.appendChild(c);
      });
      const right = test.filter((t) => predict(t.f) === t.kind).length;
      const pct = Math.round((right / test.length) * 100);
      acc.textContent = pct + '%';
      meter.className = 'meter' + (pct < 70 ? ' bad' : pct < 100 ? ' warn' : '');
      meter.firstChild.style.width = pct + '%';
      const allFixed = train.every((t) => t.label === t.kind);
      if (allFixed) {
        missions.check('fix');
        say.set(T({ en: 'All labels fixed: 100%! Same AI, same fruits. Only the data changed. Good data matters!', ro: 'Toate etichetele sunt corecte: 100%! Aceeași IA, aceleași fructe. S-au schimbat doar datele. Datele bune contează!' }), 'happy');
      }
    };

    layout(root, {
      intro: T({ en: 'An AI learns from labeled examples. Part 1: label fruit. Part 2: fix a messy dataset and watch the AI get smarter.', ro: 'O IA învață din exemple etichetate. Partea 1: etichetează fructe. Partea 2: repară un set de date greșit și privește cum IA devine mai deșteaptă.' }),
      stage: [
        card(T({ en: 'Part 1 · Conveyor belt', ro: 'Partea 1 · Banda rulantă' }), belt, labelBtns, beltInfo),
        card(T({ en: 'Part 2 · The training dataset (click to change a label)', ro: 'Partea 2 · Setul de date de antrenare (apasă ca să schimbi o etichetă)' }), grid),
      ],
      side: [
        say.el,
        card(T({ en: 'AI accuracy on 12 new fruits', ro: 'Precizia IA pe 12 fructe noi' }), acc, meter, h('p', { class: 'note', style: { marginTop: '8px' } }, T({ en: 'The AI answers by finding the most similar fruit in the dataset and copying its label.', ro: 'IA răspunde găsind cel mai asemănător fruct din setul de date și copiindu-i eticheta.' }))),
        missions.el,
      ],
    });
    nextFruit();
    renderSet();
    void slider;
  },
};
