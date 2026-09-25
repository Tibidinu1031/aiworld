import { h } from '../ui/dom.js';
import { btn, card, bubble, layout, canvasBox, slider } from './kit.js';
import { C, text, plotFrame, dot, seeded, gauss } from '../ui/draw.js';
import { polyfit, mse } from './polyfit.js';

const truth = (x) => 0.5 + 0.3 * Math.sin(2.4 * x) + 0.1 * x;

export const overfitLab = {
  icon: '🎢',
  title: { en: 'The Wiggly Curve Lab', ro: 'Laboratorul curbei încâlcite' },
  desc: { en: 'Make a curve more and more wiggly and discover when memorizing beats understanding... or not.', ro: 'Fă o curbă tot mai încâlcită și descoperă când memorarea bate înțelegerea... sau nu.' },
  mount(root, api) {
    const T = api.T;
    const W = 600;
    const H = 400;
    const cb = canvasBox(W, H, { maxWidth: 640 });
    const chart = canvasBox(600, 170, { maxWidth: 640 });
    let seed = 11;
    let n = 12;
    let deg = 1;
    let reveal = false;
    let more = false;
    let tx;
    let ty;
    let vx;
    let vy;
    let fit;
    const missions = api.missions([
      { id: 'zero', t: { en: 'Make the curve so wiggly that the training error is almost zero', ro: 'Fă curba atât de încâlcită încât eroarea de antrenare să fie aproape zero' } },
      { id: 'reveal', t: { en: 'With a very wiggly curve, reveal the test data. Ouch!', ro: 'Cu o curbă foarte încâlcită, arată datele de test. Au!' } },
      { id: 'best', t: { en: 'Find the "just right" wiggliness with the smallest test error', ro: 'Găsește încâlcirea „exact bună”, cu cea mai mică eroare de test' } },
      { id: 'newdata', t: { en: 'Press "New data" while the curve is very wiggly and watch it jump around', ro: 'Apasă „Date noi” când curba e foarte încâlcită și privește cum sare' }, level: 2 },
      { id: 'more', t: { en: 'Turn on "More data" and see the wiggly curve calm down', ro: 'Pornește „Mai multe date” și vezi cum se liniștește curba încâlcită' }, level: 3 },
    ]);
    const say = bubble('ada', T({ en: 'Blue dots are training data. Move the slider to make the orange curve more wiggly.', ro: 'Punctele albastre sunt date de antrenare. Mută glisorul ca să faci curba portocalie mai încâlcită.' }));
    const trainEl = h('b');
    const testEl = h('b');
    const trainBar = h('div', { class: 'meter' }, h('i'));
    const testBar = h('div', { class: 'meter' }, h('i'));

    const makeData = () => {
      const R = seeded(seed);
      n = more ? 30 : 12;
      tx = Array.from({ length: n }, (_, i) => -0.97 + (i / (n - 1)) * 1.94 + (R() - 0.5) * (1.6 / n));
      ty = tx.map((x) => truth(x) + gauss(R) * 0.08);
      vx = Array.from({ length: 30 }, () => R() * 1.9 - 0.95);
      vy = vx.map((x) => truth(x) + gauss(R) * 0.08);
    };
    const maxDeg = () => Math.min(11, n - 1);
    const sDeg = slider({
      label: T({ en: 'How wiggly', ro: 'Cât de încâlcită' }),
      min: 1,
      max: 11,
      step: 1,
      value: 1,
      fmt: (v) => (api.level >= 2 ? T({ en: `degree ${v}`, ro: `gradul ${v}` }) : '〰️'.repeat(Math.min(6, Math.ceil(v / 2)))),
      onInput: (v) => {
        deg = Math.min(v, maxDeg());
        update();
      },
    });
    const revealBtn = btn('👀 ' + T({ en: 'Reveal test data', ro: 'Arată datele de test' }), () => {
      reveal = !reveal;
      revealBtn.classList.toggle('sun', reveal);
      update(true);
    });
    const newBtn = btn('🎲 ' + T({ en: 'New data', ro: 'Date noi' }), () => {
      seed++;
      makeData();
      if (deg >= 8) {
        if (missions.check('newdata')) say.set(T({ en: 'With new noise, the wiggly curve changes shape completely! It was fitting the noise, not the pattern. A simple curve barely changes.', ro: 'Cu zgomot nou, curba încâlcită își schimbă complet forma! Potrivea zgomotul, nu tiparul. O curbă simplă abia se schimbă.' }));
      }
      update();
    }, 'small');
    if (api.level < 2) newBtn.hidden = true;
    const moreBtn = btn('📚 ' + T({ en: 'More data', ro: 'Mai multe date' }), () => {
      more = !more;
      moreBtn.classList.toggle('sun', more);
      makeData();
      deg = Math.min(sDeg.get(), maxDeg());
      if (more && deg >= 8) {
        if (missions.check('more')) say.set(T({ en: 'With 30 training points, even a wiggly curve has to follow the real trend. More data fights overfitting!', ro: 'Cu 30 de puncte de antrenare, chiar și o curbă încâlcită trebuie să urmeze tendința reală. Mai multe date combat supra-învățarea!' }), 'happy');
      }
      update();
    }, 'small');
    if (api.level < 3) moreBtn.hidden = true;

    const testErrs = () => {
      const out = [];
      for (let d = 1; d <= maxDeg(); d++) {
        const f = polyfit(tx, ty, d);
        out.push({ d, tr: mse(f, tx, ty), te: mse(f, vx, vy) });
      }
      return out;
    };

    function update(fromReveal) {
      fit = polyfit(tx, ty, deg);
      const tr = mse(fit, tx, ty);
      const te = mse(fit, vx, vy);
      trainEl.textContent = (tr * 1000).toFixed(1);
      testEl.textContent = reveal ? (te * 1000).toFixed(1) : '?';
      const scale = (v) => Math.min(100, Math.sqrt(v * 1000 / 60) * 100);
      trainBar.firstChild.style.width = scale(tr) + '%';
      testBar.firstChild.style.width = reveal ? scale(te) + '%' : '0%';
      testBar.className = 'meter' + (te > tr * 3 && reveal ? ' bad' : '');
      const all = testErrs();
      const best = all.reduce((a, b) => (b.te < a.te ? b : a));
      if (tr < 0.001 && deg >= 9) {
        if (missions.check('zero')) say.set(T({ en: 'The curve touches every training dot: almost zero error! But look how crazy it is between the dots... Now reveal the test data.', ro: 'Curba atinge fiecare punct de antrenare: eroare aproape zero! Dar uite cât de nebunește se mișcă între puncte... Acum arată datele de test.' }));
      }
      if (reveal && deg >= 9 && te > tr * 3) {
        if (missions.check('reveal')) say.set(T({ en: 'Ouch! On new data the wiggly curve is terrible. It memorized the training dots instead of learning the pattern. That is overfitting!', ro: 'Au! Pe date noi curba încâlcită e groaznică. A memorat punctele de antrenare în loc să învețe tiparul. Asta e supra-învățarea!' }));
      }
      if (reveal && te <= best.te * 1.1 + 1e-6 && missions.isDone('reveal')) {
        if (missions.check('best')) say.set(T({ en: `Just right! Wiggliness ${deg} gives the smallest test error. Not too simple, not too wiggly.`, ro: `Exact bine! Încâlcirea ${deg} dă cea mai mică eroare de test. Nici prea simplă, nici prea încâlcită.` }), 'happy');
      }
      if (fromReveal && reveal && deg < 9 && !missions.isDone('reveal')) say.set(T({ en: 'Green diamonds are test data: new points the curve never saw. Now make the curve really wiggly and compare!', ro: 'Romburile verzi sunt date de test: puncte noi pe care curba nu le-a văzut. Acum fă curba foarte încâlcită și compară!' }));
      draw(all);
    }

    function draw(all) {
      const g = cb.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, W, H);
      const f = plotFrame(g, { x: 30, y: 20, w: W - 50, h: H - 40, xmin: -1, xmax: 1, ymin: -0.2, ymax: 1.2, grid: true });
      g.save();
      g.beginPath();
      g.rect(30, 20, W - 50, H - 40);
      g.clip();
      g.strokeStyle = C.accent;
      g.lineWidth = 4;
      g.beginPath();
      for (let i = 0; i <= 300; i++) {
        const x = -1 + (2 * i) / 300;
        const y = Math.max(-2, Math.min(3, fit(x)));
        i ? g.lineTo(f.X(x), f.Y(y)) : g.moveTo(f.X(x), f.Y(y));
      }
      g.stroke();
      g.restore();
      tx.forEach((x, i) => dot(g, f.X(x), f.Y(ty[i]), 7, C.blue));
      if (reveal) {
        vx.forEach((x, i) => {
          g.save();
          g.translate(f.X(x), f.Y(vy[i]));
          g.rotate(Math.PI / 4);
          g.fillStyle = C.mint;
          g.fillRect(-6, -6, 12, 12);
          g.strokeStyle = C.ink;
          g.lineWidth = 2;
          g.strokeRect(-6, -6, 12, 12);
          g.restore();
        });
      }
      // Error vs complexity chart (Scientist and up).
      const cg = chart.g;
      cg.fillStyle = '#fff';
      cg.fillRect(0, 0, 600, 170);
      if (api.level >= 2) {
        const mx = 0.05;
        const pf = plotFrame(cg, { x: 50, y: 14, w: 520, h: 120, xmin: 1, xmax: maxDeg(), ymin: 0, ymax: mx, ticks: 5 });
        const line2 = (key, col) => {
          cg.strokeStyle = col;
          cg.lineWidth = 3.5;
          cg.beginPath();
          all.forEach((e, i) => {
            const y = pf.Y(Math.min(mx, e[key]));
            i ? cg.lineTo(pf.X(e.d), y) : cg.moveTo(pf.X(e.d), y);
          });
          cg.stroke();
        };
        line2('tr', C.blue);
        if (reveal) line2('te', C.mint);
        cg.strokeStyle = C.accent;
        cg.lineWidth = 2;
        cg.setLineDash([5, 5]);
        cg.beginPath();
        cg.moveTo(pf.X(deg), 14);
        cg.lineTo(pf.X(deg), 134);
        cg.stroke();
        cg.setLineDash([]);
        text(cg, T({ en: 'error vs. wiggliness · blue = training · green = test', ro: 'eroare vs. încâlcire · albastru = antrenare · verde = test' }), 300, 156, { size: 13, color: C.ink2 });
      } else chart.wrap.hidden = true;
    }

    layout(root, {
      intro: T({ en: 'A curve tries to follow the dots. Blue dots are for training. Hidden test dots will show if the curve really learned the pattern.', ro: 'O curbă încearcă să urmeze punctele. Punctele albastre sunt pentru antrenare. Punctele de test ascunse vor arăta dacă curba a învățat cu adevărat tiparul.' }),
      stage: [cb.wrap, chart.wrap],
      side: [
        card(null, sDeg.el, h('div', { class: 'row-btns', style: { marginTop: '8px' } }, revealBtn, newBtn, moreBtn)),
        card(T({ en: 'Errors (smaller is better)', ro: 'Erori (mai mic e mai bine)' }), h('div', { class: 'lab', style: { fontFamily: 'var(--display)' } }, '● ' + T({ en: 'Training: ', ro: 'Antrenare: ' }), trainEl), trainBar, h('div', { class: 'lab', style: { fontFamily: 'var(--display)', marginTop: '8px' } }, '◆ ' + T({ en: 'Test: ', ro: 'Test: ' }), testEl), testBar),
        say.el,
        missions.el,
      ],
    });
    makeData();
    update();
  },
};
