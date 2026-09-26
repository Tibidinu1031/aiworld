import { h, clear } from '../ui/dom.js';
import { btn, card, bubble, layout, canvasBox, seg } from './kit.js';
import { C, text } from '../ui/draw.js';

// ---------- Teach the AI to see ----------
const CLASSES = [
  { id: 'circle', e: '⭕', t: { en: 'Circle', ro: 'Cerc' } },
  { id: 'cross', e: '❌', t: { en: 'Cross', ro: 'X' } },
  { id: 'tri', e: '🔺', t: { en: 'Triangle', ro: 'Triunghi' } },
];
const G = 16;

// Crop the drawing to its ink, scale to 16x16 and blur a little. This is the AI's "eye".
function toVector(canvas) {
  const w = canvas.width;
  const hh = canvas.height;
  const d = canvas.getContext('2d').getImageData(0, 0, w, hh).data;
  let minX = w;
  let minY = hh;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < hh; y += 2) {
    for (let x = 0; x < w; x += 2) {
      if (d[(y * w + x) * 4] < 128) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;
  const size = Math.max(maxX - minX, maxY - minY) + 24;
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const small = document.createElement('canvas');
  small.width = small.height = G;
  const sg = small.getContext('2d');
  sg.fillStyle = '#fff';
  sg.fillRect(0, 0, G, G);
  sg.imageSmoothingEnabled = true;
  sg.imageSmoothingQuality = 'high';
  sg.filter = 'blur(0.6px)';
  sg.drawImage(canvas, cx - size / 2, cy - size / 2, size, size, 0, 0, G, G);
  const sd = sg.getImageData(0, 0, G, G).data;
  const v = new Float32Array(G * G);
  let norm = 0;
  for (let i = 0; i < G * G; i++) {
    v[i] = 1 - sd[i * 4] / 255;
    norm += v[i] * v[i];
  }
  norm = Math.sqrt(norm) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= norm;
  return v;
}

export const teachShapes = {
  icon: '✏️',
  title: { en: 'Teach the AI to See', ro: 'Învață IA să vadă' },
  desc: { en: 'Draw examples of shapes to train your own vision AI, then test it with new drawings.', ro: 'Desenează exemple de forme ca să-ți antrenezi propria IA de vedere, apoi test-o cu desene noi.' },
  mount(root, api) {
    const T = api.T;
    const S = 280;
    const cb = canvasBox(S, S, { maxWidth: 360 });
    const g = cb.g;
    const examples = [];
    let mode = 'teach';
    let cls = 'circle';
    let drawing = false;
    let last = null;
    let hasInk = false;
    let lastGuess = null;
    let correct = 0;
    let showEye = false;
    const raw = document.createElement('canvas');
    raw.width = raw.height = S;
    const rg = raw.getContext('2d');
    const missions = api.missions([
      { id: 'teach', t: { en: 'Teach at least 3 examples of each shape', ro: 'Învață-o cel puțin 3 exemple din fiecare formă' } },
      { id: 'test', t: { en: 'Test mode: get 3 correct guesses (press 👍 when it is right)', ro: 'Modul test: obține 3 ghiciri corecte (apasă 👍 când are dreptate)' } },
      { id: 'other', t: { en: 'Draw something that is none of the 3 shapes and see what it says', ro: 'Desenează ceva ce nu e niciuna din cele 3 forme și vezi ce spune' }, level: 2 },
      { id: 'eye', t: { en: 'Turn on "What the AI sees" to look through its 16 × 16 eye', ro: 'Pornește „Ce vede IA” ca să te uiți prin ochiul ei de 16 × 16' }, level: 3 },
    ]);
    const say = bubble('bip', T({ en: 'Teach me! Pick a shape, draw it big in the box, then press "Add example".', ro: 'Învață-mă! Alege o formă, deseneaz-o mare în pătrat, apoi apasă „Adaugă exemplu”.' }));
    const shelf = h('div');
    const result = h('div');
    const eyeC = canvasBox(G * 10, G * 10, { maxWidth: 170 });
    eyeC.wrap.hidden = true;

    const clearPad = () => {
      rg.fillStyle = '#fff';
      rg.fillRect(0, 0, S, S);
      hasInk = false;
      paint();
    };
    const paint = () => {
      g.drawImage(raw, 0, 0, S, S);
      g.strokeStyle = '#e3e9f8';
      g.lineWidth = 2;
      g.strokeRect(10, 10, S - 20, S - 20);
      if (!hasInk) text(g, mode === 'teach' ? T({ en: 'Draw a ', ro: 'Desenează: ' }) + CLASSES.find((c) => c.id === cls).e : T({ en: 'Draw anything!', ro: 'Desenează orice!' }), S / 2, S / 2, { size: 20, color: C.muted });
    };
    const stroke = (p) => {
      rg.strokeStyle = '#1d2340';
      rg.lineWidth = 14;
      rg.lineCap = 'round';
      rg.lineJoin = 'round';
      rg.beginPath();
      rg.moveTo(last.x, last.y);
      rg.lineTo(p.x, p.y);
      rg.stroke();
      last = p;
      hasInk = true;
      paint();
    };
    cb.canvas.addEventListener('pointerdown', (e) => {
      drawing = true;
      cb.canvas.setPointerCapture(e.pointerId);
      last = cb.pos(e);
      stroke({ x: last.x + 0.1, y: last.y });
    });
    cb.canvas.addEventListener('pointermove', (e) => drawing && stroke(cb.pos(e)));
    cb.canvas.addEventListener('pointerup', () => {
      drawing = false;
      if (mode === 'test' && hasInk) guess();
    });
    cb.canvas.addEventListener('pointercancel', () => (drawing = false));

    const thumb = (vec) => {
      const c = document.createElement('canvas');
      c.width = c.height = G;
      c.style.cssText = 'width:40px;height:40px;image-rendering:pixelated;border:2px solid #1d2340;border-radius:6px;background:#fff';
      const x = c.getContext('2d');
      const img = x.createImageData(G, G);
      let mx = 0;
      for (const v of vec) mx = Math.max(mx, v);
      for (let i = 0; i < G * G; i++) {
        const val = 255 - Math.round((vec[i] / (mx || 1)) * 255);
        img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = val;
        img.data[i * 4 + 3] = 255;
      }
      x.putImageData(img, 0, 0);
      return c;
    };
    const renderShelf = () => {
      clear(shelf);
      for (const c of CLASSES) {
        const ex = examples.filter((e) => e.c === c.id);
        shelf.appendChild(h('div', { style: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' } }, h('b', { style: { minWidth: '92px', fontFamily: 'var(--display)' } }, c.e + ' ' + T(c.t) + ` (${ex.length})`), ...ex.slice(-8).map((e) => thumb(e.v))));
      }
      if (CLASSES.every((c) => examples.filter((e) => e.c === c.id).length >= 3)) {
        if (missions.check('teach')) say.set(T({ en: 'I have learned from your examples! Switch to "Test" and draw a new shape for me.', ro: 'Am învățat din exemplele tale! Treci pe „Test” și desenează-mi o formă nouă.' }), 'happy');
      }
    };
    const guess = () => {
      const v = toVector(raw);
      if (!v) return;
      if (showEye) drawEye(v);
      if (examples.length < 3) {
        say.set(T({ en: 'Teach me some examples first!', ro: 'Mai întâi învață-mă câteva exemple!' }));
        return;
      }
      const dists = examples.map((e) => {
        let d = 0;
        for (let i = 0; i < v.length; i++) d += (v[i] - e.v[i]) ** 2;
        return { e, d };
      }).sort((a, b) => a.d - b.d);
      const k = Math.min(3, dists.length);
      const votes = {};
      dists.slice(0, k).forEach((x) => (votes[x.e.c] = (votes[x.e.c] || 0) + 1));
      const best = Object.entries(votes).sort((a, b) => b[1] - a[1])[0];
      const c = CLASSES.find((cc) => cc.id === best[0]);
      lastGuess = { c: c.id, used: false };
      clear(result);
      const yes = btn('👍 ' + T({ en: 'Right!', ro: 'Corect!' }), () => feedback(true), 'good small');
      const no = btn('👎 ' + T({ en: 'Wrong', ro: 'Greșit' }), () => feedback(false), 'small');
      const other = btn('🤷 ' + T({ en: "It's something else!", ro: 'E altceva!' }), () => {
        missions.check('other');
        say.set(T({ en: 'I only know circles, crosses and triangles, so I ALWAYS pick one of them, even for a star or a cat. An AI only knows the classes it was taught!', ro: 'Știu doar cercuri, X-uri și triunghiuri, așa că aleg MEREU una dintre ele, chiar și pentru o stea sau o pisică. O IA știe doar clasele pe care le-a învățat!' }));
      }, 'small');
      if (api.level < 2) other.hidden = true;
      result.append(
        h('div', { class: 'bigstat' }, c.e + ' ' + T(c.t) + '?'),
        h('div', { class: 'note', style: { margin: '6px 0' } }, T({ en: `Confidence: ${Math.round((best[1] / k) * 100)}% (${best[1]} of ${k} nearest examples). Most similar example:`, ro: `Încredere: ${Math.round((best[1] / k) * 100)}% (${best[1]} din ${k} exemple apropiate). Cel mai asemănător exemplu:` })),
        thumb(dists[0].e.v),
        h('div', { class: 'row-btns', style: { marginTop: '8px' } }, yes, no, other),
      );
    };
    const feedback = (ok) => {
      if (!lastGuess || lastGuess.used) return;
      lastGuess.used = true;
      if (ok) {
        correct++;
        api.sfx('good');
        say.set(T({ en: `Yay! ${correct} correct so far.`, ro: `Ura! ${correct} corecte până acum.` }), 'happy');
        if (correct >= 3) missions.check('test');
      } else {
        api.sfx('bad');
        say.set(T({ en: 'Oops! Teach me more examples of that shape, drawn in different ways. More varied data helps!', ro: 'Hopa! Învață-mă mai multe exemple din forma aceea, desenate în feluri diferite. Datele variate ajută!' }));
      }
      clearPad();
    };
    const drawEye = (v) => {
      const eg = eyeC.g;
      let mx = 0;
      for (const x of v) mx = Math.max(mx, x);
      for (let i = 0; i < G * G; i++) {
        const val = 255 - Math.round((v[i] / (mx || 1)) * 255);
        eg.fillStyle = `rgb(${val},${val},${val})`;
        eg.fillRect((i % G) * 10, Math.floor(i / G) * 10, 10, 10);
      }
    };

    const classSeg = seg(CLASSES.map((c) => ({ v: c.id, label: c.e + ' ' + T(c.t) })), cls, (v) => {
      cls = v;
      clearPad();
    });
    const addBtn = btn('➕ ' + T({ en: 'Add example', ro: 'Adaugă exemplu' }), () => {
      const v = toVector(raw);
      if (!v) {
        say.set(T({ en: 'Draw something first!', ro: 'Mai întâi desenează ceva!' }));
        return;
      }
      examples.push({ c: cls, v });
      api.sfx('pop');
      if (showEye) drawEye(v);
      clearPad();
      renderShelf();
    }, 'primary');
    const teachBox = h('div', { class: 'ctl' }, classSeg.el, h('div', { class: 'row-btns' }, addBtn));
    const modeSeg = seg(
      [
        { v: 'teach', label: '🎓 ' + T({ en: 'Teach', ro: 'Învață' }) },
        { v: 'test', label: '🧪 ' + T({ en: 'Test', ro: 'Test' }) },
      ],
      mode,
      (v) => {
        mode = v;
        teachBox.hidden = v !== 'teach';
        clear(result);
        clearPad();
        if (v === 'test') say.set(T({ en: 'Draw a shape. When you lift your finger or mouse, I will guess!', ro: 'Desenează o formă. Când ridici degetul sau mouse-ul, ghicesc!' }));
      },
    );
    const eyeBtn = btn('👁️ ' + T({ en: 'What the AI sees', ro: 'Ce vede IA' }), () => {
      showEye = !showEye;
      eyeC.wrap.hidden = !showEye;
      eyeBtn.classList.toggle('sun', showEye);
      if (showEye) {
        missions.check('eye');
        say.set(T({ en: 'This is my eye: I crop your drawing and shrink it to 16 × 16 = 256 numbers. Then I compare those numbers with my examples.', ro: 'Acesta e ochiul meu: decupez desenul tău și îl micșorez la 16 × 16 = 256 de numere. Apoi compar numerele cu exemplele mele.' }));
      }
    }, 'small');
    if (api.level < 3) eyeBtn.hidden = true;

    layout(root, {
      intro: T({ en: 'You are the teacher! In Teach mode, draw examples of each shape. In Test mode, draw a new one and the AI guesses by finding the most similar examples.', ro: 'Tu ești profesorul! În modul Învață, desenează exemple din fiecare formă. În modul Test, desenează una nouă, iar IA ghicește găsind exemplele cele mai asemănătoare.' }),
      stage: [card(null, h('div', { class: 'row-btns', style: { marginBottom: '10px' } }, modeSeg.el, btn('🧽 ' + T({ en: 'Clear', ro: 'Șterge' }), clearPad, 'small'), eyeBtn), h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start' } }, cb.wrap, eyeC.wrap)), card(T({ en: "The AI's examples", ro: 'Exemplele IA' }), shelf)],
      side: [card(null, teachBox, result), say.el, missions.el],
    });
    clearPad();
    renderShelf();
  },
};

// ---------- Filter Lab ----------
const N = 24;
function makeImage(kind) {
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const x = c.getContext('2d');
  x.fillStyle = '#000';
  x.fillRect(0, 0, N, N);
  x.fillStyle = '#fff';
  x.strokeStyle = '#fff';
  if (kind === 'house') {
    x.fillRect(5, 11, 14, 10);
    x.beginPath();
    x.moveTo(3, 12);
    x.lineTo(12, 3);
    x.lineTo(21, 12);
    x.closePath();
    x.fill();
    x.fillStyle = '#000';
    x.fillRect(10, 15, 4, 6);
    x.fillRect(6, 13, 3, 3);
  } else if (kind === 'cat') {
    x.beginPath();
    x.arc(12, 14, 8, 0, Math.PI * 2);
    x.fill();
    x.beginPath();
    x.moveTo(5, 9);
    x.lineTo(6, 2);
    x.lineTo(11, 7);
    x.fill();
    x.beginPath();
    x.moveTo(19, 9);
    x.lineTo(18, 2);
    x.lineTo(13, 7);
    x.fill();
    x.fillStyle = '#000';
    x.fillRect(8, 12, 2, 3);
    x.fillRect(14, 12, 2, 3);
    x.fillRect(11, 16, 2, 1);
  } else {
    x.lineWidth = 3;
    x.beginPath();
    x.moveTo(5, 21);
    x.lineTo(12, 3);
    x.lineTo(19, 21);
    x.moveTo(8, 14);
    x.lineTo(16, 14);
    x.stroke();
  }
  const d = x.getImageData(0, 0, N, N).data;
  const img = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) img[i] = +(d[i * 4] / 255).toFixed(2);
  return img;
}
const KERNELS = {
  vert: { t: { en: 'Vertical edges', ro: 'Margini verticale' }, k: [-1, 0, 1, -2, 0, 2, -1, 0, 1] },
  horiz: { t: { en: 'Horizontal edges', ro: 'Margini orizontale' }, k: [-1, -2, -1, 0, 0, 0, 1, 2, 1] },
  blur: { t: { en: 'Blur', ro: 'Estompare' }, k: [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9] },
  sharp: { t: { en: 'Sharpen', ro: 'Claritate' }, k: [0, -1, 0, -1, 5, -1, 0, -1, 0] },
};

export const filterLab = {
  icon: '🔍',
  title: { en: 'Filter Lab', ro: 'Laboratorul de filtre' },
  desc: { en: 'Slide 3 × 3 filters over pictures and see how vision AIs find edges.', ro: 'Plimbă filtre 3 × 3 peste poze și vezi cum găsesc IA de vedere marginile.' },
  mount(root, api) {
    const T = api.T;
    const S = 12;
    const inC = canvasBox(N * S, N * S, { maxWidth: 300 });
    const outC = canvasBox(N * S, N * S, { maxWidth: 300 });
    let img = makeImage('house');
    let kname = 'vert';
    let kernel = KERNELS.vert.k.slice();
    let out = new Float32Array(N * N);
    let sel = null;
    let sliding = -1;
    const usedFilters = new Set();
    const missions = api.missions([
      { id: 'all4', t: { en: 'Try all 4 filters', ro: 'Încearcă toate cele 4 filtre' } },
      { id: 'click', t: { en: 'Click a pixel in the result to see the multiply-and-add', ro: 'Apasă pe un pixel din rezultat ca să vezi înmulțirea și adunarea' } },
      { id: 'slide', t: { en: 'Press "Slide" and watch the filter scan the picture', ro: 'Apasă „Plimbă” și privește filtrul cum scanează poza' } },
      { id: 'custom', t: { en: 'Invent your own filter in the custom grid', ro: 'Inventează-ți propriul filtru în grila personalizată' }, level: 3 },
    ]);
    const say = bubble('ada', T({ en: 'Pick a filter. The right picture is the feature map: bright where the filter found what it looks for.', ro: 'Alege un filtru. Poza din dreapta e harta de trăsături: luminoasă acolo unde filtrul a găsit ce caută.' }));
    const mathBox = h('div', { class: 'note' });
    const at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 0 : img[y * N + x]);
    const convAt = (x, y) => {
      let s = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += at(x + i, y + j) * kernel[(j + 1) * 3 + (i + 1)];
      return s;
    };
    const compute = () => {
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) out[y * N + x] = convAt(x, y);
    };
    const draw = () => {
      const g = inC.g;
      for (let i = 0; i < N * N; i++) {
        const v = Math.round(img[i] * 255);
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.fillRect((i % N) * S, Math.floor(i / N) * S, S, S);
      }
      const o = outC.g;
      const signed = kname === 'vert' || kname === 'horiz' || kname === 'custom';
      const limit = sliding >= 0 ? sliding : N * N;
      for (let i = 0; i < N * N; i++) {
        const x = (i % N) * S;
        const y = Math.floor(i / N) * S;
        if (i > limit) {
          o.fillStyle = '#f1f4fb';
          o.fillRect(x, y, S, S);
          continue;
        }
        const v = out[i];
        if (signed) {
          const m = Math.min(1, Math.abs(v) / 3);
          o.fillStyle = v >= 0 ? `rgb(${Math.round(20 + 30 * m)},${Math.round(25 + 200 * m)},${Math.round(50 + 205 * m)})` : `rgb(${Math.round(20 + 235 * m)},${Math.round(25 + 110 * m)},${Math.round(50 + 10 * m)})`;
        } else {
          const m = Math.round(Math.max(0, Math.min(1, v)) * 255);
          o.fillStyle = `rgb(${m},${m},${m})`;
        }
        o.fillRect(x, y, S, S);
      }
      const box = sel ?? (sliding >= 0 ? { x: sliding % N, y: Math.floor(sliding / N) } : null);
      if (box) {
        g.strokeStyle = C.accent;
        g.lineWidth = 2.5;
        g.strokeRect((box.x - 1) * S, (box.y - 1) * S, S * 3, S * 3);
        o.strokeStyle = C.accent;
        o.lineWidth = 2.5;
        o.strokeRect(box.x * S, box.y * S, S, S);
      }
    };
    const explain = (x, y) => {
      clear(mathBox);
      const tbl = h('table', { style: { borderCollapse: 'collapse', fontFamily: 'var(--display)', fontSize: '14px' } });
      let sum = 0;
      for (let j = -1; j <= 1; j++) {
        const tr = h('tr');
        for (let i = -1; i <= 1; i++) {
          const p = at(x + i, y + j);
          const k = kernel[(j + 1) * 3 + (i + 1)];
          sum += p * k;
          tr.appendChild(h('td', { style: { border: '2px solid #c3cdea', padding: '3px 6px', textAlign: 'center' } }, `${p.toFixed(1)} × ${fmtK(k)}`));
        }
        tbl.appendChild(tr);
      }
      mathBox.append(h('div', null, T({ en: '9 pixels × 9 filter numbers, all added up:', ro: '9 pixeli × 9 numere ale filtrului, toate adunate:' })), tbl, h('div', { class: 'bigstat', style: { fontSize: '22px', marginTop: '6px' } }, '= ' + sum.toFixed(2)));
    };
    const fmtK = (k) => (Math.abs(k - 1 / 9) < 1e-6 ? '1/9' : String(+k.toFixed(2)));
    outC.canvas.addEventListener('pointerdown', (e) => {
      const p = outC.pos(e);
      sel = { x: Math.floor(p.x / S), y: Math.floor(p.y / S) };
      explain(sel.x, sel.y);
      missions.check('click');
      draw();
    });

    const imgSeg = seg(
      [
        { v: 'house', label: '🏠' },
        { v: 'cat', label: '🐱' },
        { v: 'A', label: 'A' },
      ],
      'house',
      (v) => {
        img = makeImage(v);
        compute();
        draw();
        if (sel) explain(sel.x, sel.y);
      },
    );
    const kSeg = seg(
      [...Object.entries(KERNELS).map(([id, k]) => ({ v: id, label: T(k.t) })), ...(api.level >= 3 ? [{ v: 'custom', label: '✨ ' + T({ en: 'Custom', ro: 'Al meu' }) }] : [])],
      kname,
      (v) => {
        kname = v;
        if (v !== 'custom') {
          kernel = KERNELS[v].k.slice();
          usedFilters.add(v);
          if (usedFilters.size >= 4) missions.check('all4');
        } else kernel = customInputs.map((c) => parseFloat(c.value.replace(',', '.')) || 0);
        customBox.hidden = v !== 'custom';
        renderKernel();
        compute();
        draw();
        if (sel) explain(sel.x, sel.y);
        const tips = {
          vert: { en: 'Vertical edges light up: blue where it gets brighter to the right, orange where it gets darker.', ro: 'Marginile verticale se aprind: albastru unde devine mai luminos spre dreapta, portocaliu unde devine mai întunecat.' },
          horiz: { en: 'Now horizontal edges light up: the roof, the floor, the top of the door.', ro: 'Acum se aprind marginile orizontale: acoperișul, podeaua, partea de sus a ușii.' },
          blur: { en: 'Blur averages each pixel with its 8 neighbors. Soft and fuzzy!', ro: 'Estomparea face media fiecărui pixel cu cei 8 vecini. Moale și încețoșat!' },
          sharp: { en: 'Sharpen boosts the center pixel and subtracts the neighbors, so edges pop out.', ro: 'Claritatea întărește pixelul din centru și scade vecinii, așa că marginile ies în evidență.' },
          custom: { en: 'Type your own numbers. Try all 1s, or a -1 on the left and 1 on the right!', ro: 'Scrie-ți propriile numere. Încearcă doar 1, sau -1 în stânga și 1 în dreapta!' },
        };
        say.set(T(tips[v]));
      },
    );
    usedFilters.add('vert');
    const kernelView = h('div');
    const renderKernel = () => {
      clear(kernelView);
      const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, 56px)', gap: '4px' } });
      kernel.forEach((k) => grid.appendChild(h('div', { style: { border: '2.5px solid #1d2340', borderRadius: '8px', textAlign: 'center', padding: '6px 0', fontFamily: 'var(--display)', fontWeight: 600, background: k > 0 ? '#d7f6ff' : k < 0 ? '#ffe7d6' : '#fff' } }, fmtK(k))));
      kernelView.appendChild(grid);
    };
    const customInputs = Array.from({ length: 9 }, (_, i) => {
      const inp = h('input', { type: 'text', inputmode: 'decimal', value: i === 4 ? '1' : '0', style: { width: '56px', fontSize: '16px', padding: '6px', textAlign: 'center' } });
      inp.addEventListener('input', () => {
        kernel = customInputs.map((c) => parseFloat(c.value.replace(',', '.')) || 0);
        renderKernel();
        compute();
        draw();
        if (sel) explain(sel.x, sel.y);
        const plain = kernel.every((k, j) => (j === 4 ? k === 1 : k === 0));
        if (!plain) missions.check('custom');
      });
      return inp;
    });
    const customBox = h('div', { hidden: true, style: { display: 'grid', gridTemplateColumns: 'repeat(3, 56px)', gap: '4px', marginTop: '8px' } }, ...customInputs);
    const slideBtn = btn('▶ ' + T({ en: 'Slide', ro: 'Plimbă' }), () => {
      sliding = 0;
      sel = null;
      missions.check('slide');
    });
    let acc = 0;
    api.raf((dt) => {
      if (sliding < 0) return;
      acc += dt;
      while (acc > 0.012 && sliding >= 0) {
        acc -= 0.012;
        sliding++;
        if (sliding >= N * N) sliding = -1;
      }
      draw();
      if (sliding >= 0) explain(sliding % N, Math.floor(sliding / N));
    });

    layout(root, {
      intro: T({ en: 'A filter is a 3 × 3 grid of numbers. It slides over the picture, multiplies and adds, and makes a new picture: the feature map.', ro: 'Un filtru e o grilă 3 × 3 de numere. Alunecă peste poză, înmulțește și adună, și face o poză nouă: harta de trăsături.' }),
      stage: [
        card(null, h('div', { class: 'row-btns', style: { marginBottom: '8px' } }, imgSeg.el, slideBtn), h('div', { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' } }, inC.wrap, h('span', { style: { fontSize: '30px' } }, '➜'), outC.wrap)),
        card(T({ en: 'The math at one pixel', ro: 'Calculul la un pixel' }), mathBox),
      ],
      side: [card(T({ en: 'Filter', ro: 'Filtru' }), kSeg.el, h('div', { style: { marginTop: '10px' } }, kernelView), customBox), say.el, missions.el],
    });
    renderKernel();
    compute();
    draw();
    mathBox.textContent = T({ en: 'Click any pixel of the right picture.', ro: 'Apasă pe orice pixel din poza din dreapta.' });
  },
};
