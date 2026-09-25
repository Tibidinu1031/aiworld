import { h } from '../ui/dom.js';
import { btn, card, bubble, layout, canvasBox, slider, seg } from './kit.js';
import { C, text, plotFrame, dot, line, emoji, seeded, gauss, arrow } from '../ui/draw.js';

// ---------- Train the Ice Cream Predictor ----------
export const lineFit = {
  icon: '🍦',
  title: { en: 'Train the Ice Cream Predictor', ro: 'Antrenează predictorul de înghețată' },
  desc: { en: 'Fit a line by hand, then watch an AI train it with gradient descent.', ro: 'Potrivește o linie de mână, apoi privește cum o antrenează o IA prin coborâre pe gradient.' },
  mount(root, api) {
    const T = api.T;
    const R = seeded(7);
    const xs = Array.from({ length: 16 }, (_, i) => 13 + i * 1.35 + R() * 1.1);
    const ys = xs.map((x) => 3 * x - 22 + gauss(R) * 5);
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length);
    let slope = 0.5;
    let icpt = 40;
    let training = false;
    let lr = 0.1;
    let history = [];
    let squares = false;
    const W = 600;
    const H = 420;
    const cb = canvasBox(W, H, { maxWidth: 640 });
    const hist = canvasBox(600, 110, { maxWidth: 640 });
    const mse = (m, b) => xs.reduce((s, x, i) => s + (m * x + b - ys[i]) ** 2, 0) / xs.length;
    const missions = api.missions([
      { id: 'hand', t: { en: 'Move the sliders until the error is below 60', ro: 'Mută glisoarele până când eroarea scade sub 60' } },
      { id: 'train', t: { en: 'Press "Let the AI train" and watch it find the line by itself', ro: 'Apasă „Lasă IA să se antreneze” și privește cum găsește singură linia' } },
      { id: 'wild', t: { en: 'Set the learning speed very high and watch training go wild', ro: 'Pune viteza de învățare foarte mare și privește cum antrenarea o ia razna' }, level: 2 },
      { id: 'sq', t: { en: 'Turn on "Show squares" to see the squared errors', ro: 'Pornește „Arată pătratele” ca să vezi erorile la pătrat' }, level: 3 },
    ]);
    const say = bubble('ada', T({ en: 'Move the two knobs so the orange line goes through the middle of the ice creams.', ro: 'Mută cele două butoane ca linia portocalie să treacă prin mijlocul înghețatelor.' }));
    const errEl = h('div', { class: 'bigstat' });
    const face = h('span', { style: { fontSize: '40px' } });
    const sSlope = slider({ label: T({ en: 'Slope (steepness)', ro: 'Panta (înclinarea)' }), min: -1, max: 6, step: 0.05, value: slope, fmt: (v) => v.toFixed(2), onInput: (v) => { slope = v; stop(); onManual(); } });
    const sIcpt = slider({ label: T({ en: 'Intercept (start height)', ro: 'Ordonata (înălțimea de start)' }), min: -80, max: 80, step: 1, value: icpt, fmt: (v) => v.toFixed(0), onInput: (v) => { icpt = v; stop(); onManual(); } });
    const lrMap = (s) => [0.02, 0.05, 0.1, 0.2, 0.4, 0.7, 0.95, 1.05, 1.3][s];
    const sLr = slider({ label: T({ en: 'Learning speed', ro: 'Viteza de învățare' }), min: 0, max: 8, step: 1, value: 2, fmt: (v) => lrMap(v).toFixed(2), onInput: (v) => (lr = lrMap(v)) });
    if (api.level < 2) sLr.el.hidden = true;
    const trainBtn = btn('🤖 ' + T({ en: 'Let the AI train', ro: 'Lasă IA să se antreneze' }), () => (training ? stop() : start()), 'primary');
    const shuffleBtn = btn('🎲 ' + T({ en: 'Random start', ro: 'Start aleatoriu' }), () => {
      stop();
      slope = -0.5 + Math.random() * 5;
      icpt = -60 + Math.random() * 120;
      history = [];
      sync();
    }, 'small');
    const sqBtn = btn('⬛ ' + T({ en: 'Show squares', ro: 'Arată pătratele' }), () => {
      squares = !squares;
      sqBtn.classList.toggle('sun', squares);
      if (squares) {
        missions.check('sq');
        say.set(T({ en: 'Each square\'s area is one error squared. The loss is the average area. Big mistakes make HUGE squares!', ro: 'Aria fiecărui pătrat e o eroare la pătrat. Eroarea totală e media ariilor. Greșelile mari fac pătrate URIAȘE!' }));
      }
      draw();
    }, 'small');
    if (api.level < 3) sqBtn.hidden = true;

    function start() {
      training = true;
      trainBtn.textContent = '⏸ ' + T({ en: 'Pause', ro: 'Pauză' });
      history = [mse(slope, icpt)];
      say.set(T({ en: 'Training! Each step: measure the error, find which way is downhill, nudge both knobs a little.', ro: 'Antrenare! La fiecare pas: măsoară eroarea, află încotro e la vale, împinge puțin ambele butoane.' }));
    }
    function stop() {
      training = false;
      trainBtn.textContent = '🤖 ' + T({ en: 'Let the AI train', ro: 'Lasă IA să se antreneze' });
    }
    function onManual() {
      const e = mse(slope, icpt);
      if (e < 60) {
        if (missions.check('hand')) say.set(T({ en: 'Great fit! You just did by hand what training does automatically.', ro: 'Potrivire excelentă! Tocmai ai făcut de mână ce face antrenarea automat.' }), 'happy');
      }
      draw();
    }
    function sync() {
      sSlope.set(Math.max(-1, Math.min(6, slope)));
      sIcpt.set(Math.max(-80, Math.min(80, icpt)));
      draw();
    }
    // One gradient descent step on the normalized model y = a * z + b, z = (x - mean) / sd.
    function stepGD() {
      let a = slope * sd;
      let b = icpt + slope * mean;
      let ga = 0;
      let gb = 0;
      xs.forEach((x, i) => {
        const z = (x - mean) / sd;
        const err = a * z + b - ys[i];
        ga += (2 * err * z) / xs.length;
        gb += (2 * err) / xs.length;
      });
      a -= lr * ga;
      b -= lr * gb;
      slope = a / sd;
      icpt = b - (a * mean) / sd;
      const e = mse(slope, icpt);
      history.push(e);
      if (!isFinite(e) || e > history[0] * 8 || Math.abs(slope) > 1e4) {
        stop();
        slope = Math.max(-1, Math.min(6, slope || 0));
        icpt = Math.max(-80, Math.min(80, icpt || 0));
        if (missions.check('wild') || true) say.set(T({ en: 'Whoa! The steps were so big that the AI jumped over the valley again and again, and the error exploded. That is a learning rate that is too high!', ro: 'Uau! Pașii au fost atât de mari încât IA a sărit peste vale iar și iar, iar eroarea a explodat. Asta e o rată de învățare prea mare!' }));
      } else if (history.length > 3 && Math.abs(history[history.length - 2] - e) < 0.01) {
        stop();
        missions.check('train');
        say.set(T({ en: `Done in ${history.length - 1} steps! The error stopped shrinking: we reached the bottom of the valley.`, ro: `Gata în ${history.length - 1} pași! Eroarea nu mai scade: am ajuns pe fundul văii.` }), 'happy');
      } else if (history.length > 400) {
        stop();
        missions.check('train');
      }
      sync();
    }
    let acc = 0;
    api.raf((dt) => {
      if (!training) return;
      acc += dt;
      if (acc > 0.09) {
        acc = 0;
        stepGD();
      }
    });

    function draw() {
      const g = cb.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, W, H);
      const f = plotFrame(g, { x: 70, y: 20, w: W - 100, h: H - 80, xmin: 10, xmax: 36, ymin: -10, ymax: 100, xlabel: T({ en: 'Temperature (°C)', ro: 'Temperatura (°C)' }), ylabel: T({ en: 'Ice creams sold', ro: 'Înghețate vândute' }) });
      [10, 15, 20, 25, 30, 35].forEach((v) => text(g, v + '°', f.X(v), H - 48, { size: 13, color: C.ink2 }));
      [0, 25, 50, 75, 100].forEach((v) => text(g, String(v), 50, f.Y(v), { size: 13, color: C.ink2 }));
      g.save();
      g.beginPath();
      g.rect(70, 20, W - 100, H - 80);
      g.clip();
      xs.forEach((x, i) => {
        const p = slope * x + icpt;
        if (squares) {
          const side = Math.abs(f.Y(p) - f.Y(ys[i]));
          g.fillStyle = 'rgba(242,70,75,0.14)';
          g.fillRect(f.X(x), Math.min(f.Y(p), f.Y(ys[i])), side, side);
        }
        line(g, f.X(x), f.Y(p), f.X(x), f.Y(ys[i]), C.rose, 2, [4, 4]);
      });
      line(g, f.X(10), f.Y(slope * 10 + icpt), f.X(36), f.Y(slope * 36 + icpt), C.accent, 5);
      g.restore();
      xs.forEach((x, i) => emoji(g, '🍦', f.X(x), f.Y(ys[i]), 22));
      const e = mse(slope, icpt);
      errEl.textContent = isFinite(e) ? e.toFixed(0) : '∞';
      face.textContent = e < 60 ? '😄' : e < 300 ? '🙂' : e < 1500 ? '😐' : '😵';
      // Loss history.
      const hg = hist.g;
      hg.fillStyle = '#fff';
      hg.fillRect(0, 0, 600, 110);
      text(hg, T({ en: 'Error during training', ro: 'Eroarea în timpul antrenării' }), 12, 14, { size: 13, align: 'left', color: C.ink2 });
      if (history.length > 1) {
        const mx = Math.max(...history.slice(0, 60).filter(isFinite), 1);
        hg.strokeStyle = C.accent;
        hg.lineWidth = 3;
        hg.beginPath();
        history.slice(0, 120).forEach((v, i) => {
          const x = 12 + (i / Math.max(20, Math.min(120, history.length))) * 576;
          const y = 100 - Math.min(1, v / mx) * 76;
          i ? hg.lineTo(x, y) : hg.moveTo(x, y);
        });
        hg.stroke();
      }
    }
    layout(root, {
      intro: T({ en: 'Each ice cream is one day: temperature and sales. The dashed red lines are the mistakes. Make the error as small as you can!', ro: 'Fiecare înghețată e o zi: temperatura și vânzările. Liniile roșii punctate sunt greșelile. Fă eroarea cât mai mică!' }),
      stage: [cb.wrap, hist.wrap],
      side: [
        card(T({ en: 'Error (loss)', ro: 'Eroarea' }), h('div', { class: 'row-btns' }, errEl, face)),
        card(T({ en: 'The two knobs', ro: 'Cele două butoane' }), sSlope.el, sIcpt.el, sLr.el, h('div', { class: 'row-btns', style: { marginTop: '8px' } }, trainBtn, shuffleBtn, sqBtn)),
        say.el,
        missions.el,
      ],
    });
    draw();
    void dot;
  },
};

// ---------- Foggy Hill: gradient descent step by step ----------
const bowl = (x) => 0.25 * (x - 1) ** 2 + 0.5;
const bumpy = (x) => 0.12 * (x - 3) ** 2 - 2 * Math.exp(-((x + 2.5) ** 2) / 0.6) + 1;
const deriv = (f, x) => (f(x + 1e-4) - f(x - 1e-4)) / 2e-4;

export const hillDescent = {
  icon: '⛰️',
  title: { en: 'The Foggy Hill', ro: 'Dealul cu ceață' },
  desc: { en: 'Walk down the loss hill step by step. Choose the step size, and try not to overshoot!', ro: 'Coboară dealul erorii pas cu pas. Alege mărimea pasului și încearcă să nu sari peste!' },
  mount(root, api) {
    const T = api.T;
    const W = 600;
    const H = 400;
    const cb = canvasBox(W, H, { maxWidth: 640 });
    let bumpyMode = false;
    let f = bowl;
    let x = -4;
    let v = 0;
    let lr = 0.5;
    let momentum = false;
    let steps = 0;
    let trail = [];
    let auto = false;
    const missions = api.missions([
      { id: 'fast', t: { en: 'Reach the bottom (error below 0.55) in 10 steps or fewer', ro: 'Ajunge jos (eroare sub 0,55) în cel mult 10 pași' } },
      { id: 'over', t: { en: 'Make the ball overshoot to the other side of the valley', ro: 'Fă bila să sară pe partea cealaltă a văii' } },
      { id: 'boom', t: { en: 'Make the steps so big that the error gets BIGGER', ro: 'Fă pașii atât de mari încât eroarea să CREASCĂ' } },
      { id: 'stuck', t: { en: 'On the bumpy hill, get stuck in the small valley (local minimum)', ro: 'Pe dealul cu denivelări, rămâi blocat în valea mică (minim local)' }, level: 3 },
      { id: 'escape', t: { en: 'Turn on momentum and reach the deep valley from the far left', ro: 'Pornește impulsul și ajunge în valea adâncă pornind din stânga de tot' }, level: 3 },
    ]);
    const say = bubble('bip', T({ en: "It's foggy! I can only feel the slope under my wheel. Click the hill to put me somewhere, then press Step.", ro: 'E ceață! Simt doar panta de sub roata mea. Apasă pe deal ca să mă pui undeva, apoi apasă Pas.' }));
    const info = h('div', { class: 'note' });
    const sLr = slider({ label: T({ en: 'Step size (learning rate)', ro: 'Mărimea pasului (rata de învățare)' }), min: 0.1, max: 5, step: 0.1, value: lr, fmt: (v2) => v2.toFixed(1), onInput: (v2) => (lr = v2) });
    const stepBtn = btn('👣 ' + T({ en: 'Step', ro: 'Pas' }), () => doStep(), 'primary');
    const autoBtn = btn('▶ ' + T({ en: 'Auto', ro: 'Automat' }), () => {
      auto = !auto;
      autoBtn.textContent = auto ? '⏸ ' + T({ en: 'Pause', ro: 'Pauză' }) : '▶ ' + T({ en: 'Auto', ro: 'Automat' });
    });
    const resetBtn = btn('🔁 ' + T({ en: 'Start over', ro: 'De la capăt' }), () => place(bumpyMode ? -4.6 : -4), 'small');
    const hillSeg = seg(
      [
        { v: false, label: '🥣 ' + T({ en: 'Smooth valley', ro: 'Vale netedă' }) },
        { v: true, label: '🎢 ' + T({ en: 'Bumpy hill', ro: 'Deal cu denivelări' }) },
      ],
      false,
      (b) => {
        bumpyMode = b;
        f = b ? bumpy : bowl;
        place(b ? -4.6 : -4);
      },
    );
    const momSeg = seg(
      [
        { v: false, label: T({ en: 'No momentum', ro: 'Fără impuls' }) },
        { v: true, label: '🎳 ' + T({ en: 'Momentum', ro: 'Impuls' }) },
      ],
      false,
      (b) => {
        momentum = b;
        v = 0;
      },
    );
    const extra = h('div', { class: 'ctl' }, hillSeg.el, momSeg.el);
    if (api.level < 3) extra.hidden = true;

    const XMIN = -5;
    const XMAX = 6.5;
    let frame;
    function place(nx) {
      x = nx;
      v = 0;
      steps = 0;
      trail = [x];
      auto = false;
      autoBtn.textContent = '▶ ' + T({ en: 'Auto', ro: 'Automat' });
      draw();
    }
    function doStep() {
      const before = f(x);
      const slope = deriv(f, x);
      const old = x;
      if (momentum) {
        v = 0.85 * v - lr * 0.3 * slope;
        x += v;
      } else x -= lr * slope;
      steps++;
      trail.push(x);
      const after = f(x);
      if (!bumpyMode) {
        if ((old - 1) * (x - 1) < 0 && Math.abs(x - 1) > 0.15) {
          if (missions.check('over')) say.set(T({ en: 'Whoosh! The step was bigger than the valley, so I landed on the other side.', ro: 'Fiuu! Pasul a fost mai mare decât valea, așa că am aterizat pe partea cealaltă.' }));
        }
        if (after > before + 0.01) {
          if (missions.check('boom')) say.set(T({ en: 'Uh oh! The error went UP. With steps this big, I bounce higher and higher. Learning rate too high!', ro: 'Of! Eroarea a CRESCUT. Cu pași atât de mari, sar tot mai sus. Rată de învățare prea mare!' }));
        }
        if (after < 0.55 && steps <= 10) {
          if (missions.check('fast')) say.set(T({ en: `Bottom reached in ${steps} steps! A good step size makes training fast.`, ro: `Am ajuns jos în ${steps} pași! O mărime bună a pasului face antrenarea rapidă.` }), 'happy');
        }
      } else {
        const settled = Math.abs(x - old) < 0.01;
        if (settled && x < -1 && !momentum) {
          if (missions.check('stuck')) say.set(T({ en: 'I\'m stuck in the small valley! Downhill steps can\'t climb out. This is a local minimum.', ro: 'Am rămas blocat în valea mică! Pașii la vale nu pot urca afară. Acesta e un minim local.' }));
        }
        if (settled && x > 2 && momentum && trail[0] < -3.5) {
          if (missions.check('escape')) say.set(T({ en: 'Momentum carried me over the bump into the deep valley, like a heavy rolling ball!', ro: 'Impulsul m-a purtat peste denivelare, în valea adâncă, ca pe o bilă grea care se rostogolește!' }), 'happy');
        }
      }
      if (Math.abs(x) > 60) {
        auto = false;
        say.set(T({ en: 'I flew right off the map! Way too big a step. Press "Start over".', ro: 'Am zburat de pe hartă! Pas mult prea mare. Apasă „De la capăt”.' }));
      }
      draw();
    }
    let acc = 0;
    api.raf((dt) => {
      if (!auto) return;
      acc += dt;
      if (acc > 0.35) {
        acc = 0;
        doStep();
      }
    });
    function draw() {
      const g = cb.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, W, H);
      frame = plotFrame(g, { x: 50, y: 20, w: W - 70, h: H - 70, xmin: XMIN, xmax: XMAX, ymin: 0, ymax: bumpyMode ? 7 : 9, grid: false, xlabel: T({ en: 'knob setting', ro: 'poziția butonului' }), ylabel: T({ en: 'error', ro: 'eroare' }) });
      // Colored landscape.
      for (let i = 0; i < 115; i++) {
        const xx = XMIN + ((XMAX - XMIN) * i) / 115;
        const yy = f(xx);
        const px = frame.X(xx);
        const py = frame.Y(Math.min(yy, bumpyMode ? 7 : 9));
        const t = Math.min(1, yy / (bumpyMode ? 6 : 8));
        g.fillStyle = `rgba(${Math.round(90 + 165 * t)}, ${Math.round(103 + 35 * t)}, ${Math.round(216 - 124 * t)}, 0.25)`;
        g.fillRect(px, py, (W - 70) / 115 + 1, H - 50 - py);
      }
      g.strokeStyle = C.ink;
      g.lineWidth = 4;
      g.beginPath();
      for (let i = 0; i <= 200; i++) {
        const xx = XMIN + ((XMAX - XMIN) * i) / 200;
        const px = frame.X(xx);
        const py = frame.Y(Math.min(f(xx), 9));
        i ? g.lineTo(px, py) : g.moveTo(px, py);
      }
      g.stroke();
      // Trail of steps.
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1];
        const b = trail[i];
        if (Math.abs(a) > 20 || Math.abs(b) > 20) break;
        arrow(g, frame.X(a), frame.Y(Math.min(9, f(a))) - 14, frame.X(b), frame.Y(Math.min(9, f(b))) - 14, { color: C.accent, width: 2.5, head: 9 });
      }
      const cx = Math.max(XMIN, Math.min(XMAX, x));
      const cy = Math.min(9, f(cx));
      dot(g, frame.X(cx), frame.Y(cy) - 12, 12, C.accent);
      // Slope arrow (the gradient).
      const s = deriv(f, cx);
      const dir = -Math.sign(s);
      if (Math.abs(s) > 0.01) arrow(g, frame.X(cx), frame.Y(cy) - 40, frame.X(cx) + dir * 44, frame.Y(cy) - 40, { color: C.mint, width: 4, head: 11 });
      info.innerHTML = '';
      info.append(
        h('div', null, T({ en: 'Steps: ', ro: 'Pași: ' }), h('b', null, String(steps))),
        h('div', null, T({ en: 'Error: ', ro: 'Eroare: ' }), h('b', null, isFinite(f(x)) ? f(x).toFixed(2) : '∞')),
        h('div', null, T({ en: 'Slope under the wheel: ', ro: 'Panta sub roată: ' }), h('b', null, s.toFixed(2)), ' ', h('span', { style: { color: C.mint } }, T({ en: '(green arrow = downhill)', ro: '(săgeata verde = la vale)' }))),
      );
    }
    cb.canvas.addEventListener('pointerdown', (e) => {
      const p = cb.pos(e);
      const nx = XMIN + ((p.x - 50) / (W - 70)) * (XMAX - XMIN);
      place(Math.max(XMIN, Math.min(XMAX, nx)));
    });
    layout(root, {
      intro: T({ en: 'The curve is the error for every knob setting. Each step goes downhill: new position = old position − step size × slope.', ro: 'Curba arată eroarea pentru fiecare poziție a butonului. Fiecare pas merge la vale: poziția nouă = poziția veche − mărimea pasului × panta.' }),
      stage: [cb.wrap, card(null, info)],
      side: [card(null, sLr.el, h('div', { class: 'row-btns', style: { marginTop: '8px' } }, stepBtn, autoBtn, resetBtn), extra), say.el, missions.el],
    });
    place(-4);
  },
};
