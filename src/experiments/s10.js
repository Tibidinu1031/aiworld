import { h } from '../ui/dom.js';
import { btn, card, bubble, layout, canvasBox, seg } from './kit.js';
import { C, text, dot, line, seeded, gauss, plotFrame, emoji } from '../ui/draw.js';

const COLS = [C.red, C.blue, C.yellow, C.green, C.grape];

export const kmeansLab = {
  icon: '🍬',
  title: { en: 'Sort the Candy Bag (k-means)', ro: 'Sortează punga cu bomboane (k-means)' },
  desc: { en: 'Candies have no labels. Use k-means to discover the groups hidden in the bag.', ro: 'Bomboanele nu au etichete. Folosește k-means ca să descoperi grupurile ascunse în pungă.' },
  mount(root, api) {
    const T = api.T;
    const W = 560;
    const H = 460;
    const cb = canvasBox(W, H, { maxWidth: 600 });
    const elbow = canvasBox(560, 180, { maxWidth: 600 });
    elbow.wrap.hidden = true;
    let pts = [];
    let k = 3;
    let centers = [];
    let assign = [];
    let phase = 'assign';
    let auto = false;
    let placing = false;
    let manual = [];
    let moved = true;
    let seed = 21;
    let nBlobs = 3;
    const trails = [];
    const missions = api.missions([
      { id: 'run', t: { en: 'Run k-means until the flags stop moving', ro: 'Rulează k-means până când stegulețele nu se mai mișcă' } },
      { id: 'k3', t: { en: 'Use k = 3 to find the 3 kinds of candy', ro: 'Folosește k = 3 ca să găsești cele 3 feluri de bomboane' } },
      { id: 'k2', t: { en: 'Try k = 2 and see two groups get squashed together', ro: 'Încearcă k = 2 și vezi cum două grupuri sunt înghesuite împreună' }, level: 2 },
      { id: 'place', t: { en: 'Place the starting flags yourself by clicking', ro: 'Pune singur stegulețele de start, prin clic' }, level: 2 },
      { id: 'elbow', t: { en: 'Draw the elbow chart and spot the best k', ro: 'Desenează graficul cotului și găsește cel mai bun k' }, level: 3 },
    ]);
    const say = bubble('ada', T({ en: 'These candies have no labels. Press "Drop flags", then take the steps. Watch the groups appear!', ro: 'Aceste bomboane nu au etichete. Apasă „Pune stegulețe”, apoi fă pașii. Privește cum apar grupurile!' }));
    const info = h('div', { class: 'note' });

    const makeData = () => {
      const R = seeded(seed);
      pts = [];
      const cs = [];
      while (cs.length < nBlobs) {
        const c = [0.15 + R() * 0.7, 0.15 + R() * 0.7];
        if (cs.every((q) => Math.hypot(q[0] - c[0], q[1] - c[1]) > 0.32)) cs.push(c);
      }
      cs.forEach((c) => {
        for (let i = 0; i < 18; i++) pts.push({ x: Math.max(0.02, Math.min(0.98, c[0] + gauss(R) * 0.065)), y: Math.max(0.02, Math.min(0.98, c[1] + gauss(R) * 0.065)) });
      });
      centers = [];
      assign = pts.map(() => -1);
      trails.length = 0;
    };
    const nearest = (p, cs) => {
      let best = 0;
      let bd = Infinity;
      cs.forEach((c, i) => {
        const d = (p.x - c[0]) ** 2 + (p.y - c[1]) ** 2;
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    };
    const inertia = (cs, as) => pts.reduce((s, p, i) => s + (p.x - cs[as[i]][0]) ** 2 + (p.y - cs[as[i]][1]) ** 2, 0);
    const doAssign = () => {
      assign = pts.map((p) => nearest(p, centers));
      phase = 'move';
    };
    const doMove = () => {
      moved = false;
      centers = centers.map((c, i) => {
        const mine = pts.filter((_, j) => assign[j] === i);
        if (!mine.length) return c;
        const nc = [mine.reduce((s, p) => s + p.x, 0) / mine.length, mine.reduce((s, p) => s + p.y, 0) / mine.length];
        if (Math.hypot(nc[0] - c[0], nc[1] - c[1]) > 1e-4) {
          moved = true;
          trails.push([c, nc, i]);
        }
        return nc;
      });
      phase = 'assign';
      if (!moved) converged();
    };
    const converged = () => {
      auto = false;
      autoBtn.textContent = '▶ ' + T({ en: 'Auto', ro: 'Automat' });
      missions.check('run');
      if (k === 3 && nBlobs === 3) {
        const good = inertia(centers, assign) < 0.8;
        if (good) {
          if (missions.check('k3')) say.set(T({ en: 'Three groups found, and nobody told me the answers! That is unsupervised learning.', ro: 'Trei grupuri găsite, și nimeni nu mi-a spus răspunsurile! Asta e învățarea nesupravegheată.' }), 'happy');
        } else say.set(T({ en: 'Hmm, the flags got stuck in a strange grouping. That is a local minimum! Drop the flags again for a new start.', ro: 'Hmm, stegulețele s-au blocat într-o grupare ciudată. Acesta e un minim local! Pune din nou stegulețele pentru un nou start.' }));
      } else if (k === 2 && nBlobs === 3) {
        if (missions.check('k2')) say.set(T({ en: 'With only 2 flags, two different kinds of candy had to share a group. Choosing k matters!', ro: 'Cu doar 2 stegulețe, două feluri diferite de bomboane au trebuit să împartă un grup. Alegerea lui k contează!' }));
      } else say.set(T({ en: 'The flags stopped moving: k-means is done!', ro: 'Stegulețele nu se mai mișcă: k-means a terminat!' }));
      draw();
    };
    const dropFlags = () => {
      const R = seeded(Math.floor(Math.random() * 1e6) + 1);
      centers = Array.from({ length: k }, () => [0.08 + R() * 0.84, 0.08 + R() * 0.84]);
      assign = pts.map(() => -1);
      trails.length = 0;
      phase = 'assign';
      moved = true;
      say.set(T({ en: 'Flags dropped at random spots. Now: Step 2, every candy joins its nearest flag.', ro: 'Stegulețe puse la întâmplare. Acum: Pasul 2, fiecare bomboană intră la cel mai apropiat steguleț.' }));
      draw();
    };
    const step = () => {
      if (!centers.length) dropFlags();
      else if (phase === 'assign') doAssign();
      else doMove();
      draw();
    };

    function draw() {
      const g = cb.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, W, H);
      const f = plotFrame(g, { x: 50, y: 20, w: W - 70, h: H - 70, xmin: 0, xmax: 1, ymin: 0, ymax: 1, xlabel: T({ en: 'sweetness 🍯', ro: 'dulceață 🍯' }), ylabel: T({ en: 'size 📏', ro: 'mărime 📏' }), ticks: 5 });
      if (phase === 'move' && centers.length) {
        pts.forEach((p, i) => {
          const c = centers[assign[i]];
          if (c) line(g, f.X(p.x), f.Y(p.y), f.X(c[0]), f.Y(c[1]), 'rgba(59,66,102,0.14)', 1.5);
        });
      }
      for (const [a, b, i] of trails) line(g, f.X(a[0]), f.Y(a[1]), f.X(b[0]), f.Y(b[1]), COLS[i], 3, [5, 5]);
      pts.forEach((p, i) => dot(g, f.X(p.x), f.Y(p.y), 8, assign[i] >= 0 ? COLS[assign[i]] : '#b9c0d6'));
      const flags = placing ? manual : centers;
      flags.forEach((c, i) => {
        const x = f.X(c[0]);
        const y = f.Y(c[1]);
        line(g, x, y, x, y - 34, C.ink, 3);
        g.beginPath();
        g.moveTo(x, y - 34);
        g.lineTo(x + 24, y - 27);
        g.lineTo(x, y - 20);
        g.closePath();
        g.fillStyle = COLS[i];
        g.fill();
        g.strokeStyle = C.ink;
        g.lineWidth = 2;
        g.stroke();
        dot(g, x, y, 6, C.ink, null);
      });
      if (placing) text(g, T({ en: `Click to place flag ${manual.length + 1} of ${k}`, ro: `Apasă ca să pui stegulețul ${manual.length + 1} din ${k}` }), W / 2, 36, { size: 18, color: C.grape });
      info.innerHTML = '';
      info.append(
        h('div', null, T({ en: 'Next: ', ro: 'Urmează: ' }), h('b', null, !centers.length ? T({ en: 'drop the flags', ro: 'pune stegulețele' }) : phase === 'assign' ? T({ en: 'Step 2 · join the nearest flag', ro: 'Pasul 2 · intră la cel mai apropiat steguleț' }) : T({ en: 'Step 3 · move flags to the middle', ro: 'Pasul 3 · mută stegulețele la mijloc' }))),
        api.level >= 2 && centers.length && assign[0] >= 0 ? h('div', null, T({ en: 'Total distance: ', ro: 'Distanța totală: ' }), h('b', null, (inertia(centers, assign) * 100).toFixed(1))) : null,
      );
    }
    void emoji;

    cb.canvas.addEventListener('pointerdown', (e) => {
      if (!placing) return;
      const p = cb.pos(e);
      const x = (p.x - 50) / (W - 70);
      const y = 1 - (p.y - 20) / (H - 70);
      manual.push([Math.max(0, Math.min(1, x)), Math.max(0, Math.min(1, y))]);
      api.sfx('click');
      if (manual.length >= k) {
        placing = false;
        centers = manual.slice();
        assign = pts.map(() => -1);
        trails.length = 0;
        phase = 'assign';
        missions.check('place');
        say.set(T({ en: 'Your flags are in place. Now take the steps and see where they end up!', ro: 'Stegulețele tale sunt la locul lor. Acum fă pașii și vezi unde ajung!' }));
      }
      draw();
    });

    const kSeg = seg([2, 3, 4, 5].map((v) => ({ v, label: 'k = ' + v })), k, (v) => {
      k = v;
      placing = false;
      manual = [];
      centers = [];
      assign = pts.map(() => -1);
      trails.length = 0;
      draw();
    });
    const dropBtn = btn('🚩 ' + T({ en: 'Drop flags', ro: 'Pune stegulețe' }), dropFlags, 'small');
    const stepBtn = btn('👣 ' + T({ en: 'Next step', ro: 'Pasul următor' }), step, 'primary');
    const autoBtn = btn('▶ ' + T({ en: 'Auto', ro: 'Automat' }), () => {
      auto = !auto;
      autoBtn.textContent = auto ? '⏸ ' + T({ en: 'Pause', ro: 'Pauză' }) : '▶ ' + T({ en: 'Auto', ro: 'Automat' });
    });
    const placeBtn = btn('👆 ' + T({ en: 'Place flags myself', ro: 'Pun eu stegulețele' }), () => {
      placing = true;
      manual = [];
      centers = [];
      assign = pts.map(() => -1);
      trails.length = 0;
      draw();
    }, 'small');
    if (api.level < 2) placeBtn.hidden = true;
    const newBtn = btn('🎲 ' + T({ en: 'New candy bag', ro: 'Pungă nouă' }), () => {
      seed++;
      nBlobs = api.level >= 2 && Math.random() < 0.5 ? 4 : 3;
      makeData();
      say.set(T({ en: `A new bag! How many kinds of candy do you think are in it?`, ro: `O pungă nouă! Câte feluri de bomboane crezi că sunt în ea?` }));
      draw();
    }, 'small');
    const elbowBtn = btn('💪 ' + T({ en: 'Elbow chart', ro: 'Graficul cotului' }), () => {
      const vals = [];
      for (let kk = 1; kk <= 6; kk++) {
        let best = Infinity;
        for (let rep = 0; rep < 8; rep++) {
          let cs = Array.from({ length: kk }, () => {
            const p = pts[Math.floor(Math.random() * pts.length)];
            return [p.x, p.y];
          });
          let as = [];
          for (let it = 0; it < 20; it++) {
            as = pts.map((p) => nearest(p, cs));
            cs = cs.map((c, i) => {
              const mine = pts.filter((_, j) => as[j] === i);
              return mine.length ? [mine.reduce((s, p) => s + p.x, 0) / mine.length, mine.reduce((s, p) => s + p.y, 0) / mine.length] : c;
            });
          }
          best = Math.min(best, inertia(cs, as));
        }
        vals.push(best * 100);
      }
      elbow.wrap.hidden = false;
      const g = elbow.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, 560, 180);
      const mx = vals[0] * 1.05;
      const f = plotFrame(g, { x: 60, y: 14, w: 470, h: 130, xmin: 1, xmax: 6, ymin: 0, ymax: mx, ticks: 5 });
      for (let kk = 1; kk <= 6; kk++) text(g, 'k=' + kk, f.X(kk), 160, { size: 13, color: C.ink2 });
      g.strokeStyle = C.accent;
      g.lineWidth = 4;
      g.beginPath();
      vals.forEach((v, i) => (i ? g.lineTo(f.X(i + 1), f.Y(v)) : g.moveTo(f.X(i + 1), f.Y(v))));
      g.stroke();
      vals.forEach((v, i) => dot(g, f.X(i + 1), f.Y(v), 7, C.accent));
      text(g, T({ en: 'total distance', ro: 'distanța totală' }), 30, 8, { size: 12, align: 'left', color: C.ink2 });
      missions.check('elbow');
      say.set(T({ en: `Look for the bend (the elbow). This bag has ${nBlobs} kinds of candy: the line drops fast until k = ${nBlobs}, then flattens.`, ro: `Caută îndoitura (cotul). Punga are ${nBlobs} feluri de bomboane: linia scade repede până la k = ${nBlobs}, apoi se aplatizează.` }));
    }, 'small');
    if (api.level < 3) elbowBtn.hidden = true;

    let acc = 0;
    api.raf((dt) => {
      if (!auto) return;
      acc += dt;
      if (acc > 0.6) {
        acc = 0;
        step();
      }
    });

    layout(root, {
      intro: T({ en: 'Each dot is a candy, placed by its sweetness and size. There are no labels! k-means will find the groups.', ro: 'Fiecare punct e o bomboană, așezată după dulceață și mărime. Nu există etichete! k-means va găsi grupurile.' }),
      stage: [cb.wrap, elbow.wrap],
      side: [
        card(T({ en: 'Number of groups', ro: 'Numărul de grupuri' }), kSeg.el),
        card(null, h('div', { class: 'row-btns' }, dropBtn, stepBtn, autoBtn), h('div', { class: 'row-btns', style: { marginTop: '8px' } }, placeBtn, newBtn, elbowBtn), h('div', { style: { marginTop: '8px' } }, info)),
        say.el,
        missions.el,
      ],
    });
    makeData();
    draw();
  },
};
