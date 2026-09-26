import { h } from '../ui/dom.js';
import { btn, card, bubble, layout, canvasBox, slider, seg } from './kit.js';
import { C, text, dot, line, emoji, rr, arrow } from '../ui/draw.js';

const G = 9.81;
// Real projectile motion from 1 m height. Optional air drag: a = -k |v| v.
function simulate(v, deg, drag) {
  const pts = [];
  let x = 0;
  let y = 1;
  const a = (deg * Math.PI) / 180;
  let vx = v * Math.cos(a);
  let vy = v * Math.sin(a);
  const dt = 0.01;
  for (let i = 0; i < 3000; i++) {
    pts.push([x, y]);
    const sp = Math.hypot(vx, vy);
    vx += -drag * sp * vx * dt;
    vy += (-G - drag * sp * vy) * dt;
    const nx = x + vx * dt;
    const ny = y + vy * dt;
    if (ny < 0) {
      const f = y / (y - ny);
      pts.push([x + (nx - x) * f, 0]);
      break;
    }
    x = nx;
    y = ny;
  }
  return pts;
}

export const launchLab = {
  icon: '🏀',
  title: { en: 'The Learning Launcher', ro: 'Lansatorul care învață' },
  desc: { en: 'Try to hit the basket yourself, then watch an AI learn to do it from rewards alone.', ro: 'Încearcă să nimerești coșul, apoi privește o IA care învață să facă asta doar din recompense.' },
  mount(root, api) {
    const T = api.T;
    const W = 620;
    const H = 360;
    const cb = canvasBox(W, H, { maxWidth: 660 });
    const chart = canvasBox(620, 120, { maxWidth: 660 });
    const S = 18; // pixels per meter
    const X0 = 40;
    const GY = H - 40;
    let target = 19;
    let angle = 45;
    let speed = 10;
    let drag = 0;
    let anim = null;
    let history = [];
    let aiRun = null;
    let aiHitsAt = new Set();
    let lastHitTargets = [];
    const missions = api.missions([
      { id: 'me', t: { en: 'Hit the basket yourself', ro: 'Nimerește tu coșul' } },
      { id: 'ai', t: { en: 'Watch the AI learn to hit the basket', ro: 'Privește IA cum învață să nimerească coșul' } },
      { id: 'move', t: { en: 'Move the basket and let the AI learn again', ro: 'Mută coșul și lasă IA să învețe din nou' }, level: 2 },
      { id: 'drag', t: { en: 'Turn on air drag: the AI still learns, without knowing any formula!', ro: 'Pornește rezistența aerului: IA tot învață, fără să știe vreo formulă!' }, level: 3 },
    ]);
    const say = bubble('bip', T({ en: 'Set the angle and speed, then press Launch. Real gravity: 9.81 m/s²!', ro: 'Alege unghiul și viteza, apoi apasă Lansează. Gravitație adevărată: 9,81 m/s²!' }));
    const status = h('div', { class: 'note' });

    const sAngle = slider({ label: T({ en: 'Angle', ro: 'Unghi' }), min: 10, max: 80, step: 1, value: angle, fmt: (v) => v + '°', onInput: (v) => (angle = v) });
    const sSpeed = slider({ label: T({ en: 'Speed', ro: 'Viteză' }), min: 5, max: 25, step: 0.5, value: speed, fmt: (v) => v.toFixed(1) + ' m/s', onInput: (v) => (speed = v) });

    const launch = (v, a, who) =>
      new Promise((resolve) => {
        const pts = simulate(v, a, drag);
        anim = { pts, i: 0, who, resolve, a };
        api.sfx('launch');
      });
    const score = (pts) => pts[pts.length - 1][0] - target;

    const meBtn = btn('🚀 ' + T({ en: 'Launch', ro: 'Lansează' }), async () => {
      if (anim || aiRun) return;
      const pts = await launch(speed, angle, 'me');
      const miss = score(pts);
      history.push({ pts, miss, who: 'me' });
      if (Math.abs(miss) < 0.8) {
        api.sfx('win');
        missions.check('me');
        say.set(T({ en: 'SWISH! You solved it. You probably adjusted after each miss... just like the AI will!', ro: 'COȘ! Ai reușit. Probabil te-ai corectat după fiecare ratare... exact cum va face IA!' }), 'happy');
      } else say.set(miss < 0 ? T({ en: `Too short by ${(-miss).toFixed(1)} m. More speed, or a different angle?`, ro: `Prea scurt cu ${(-miss).toFixed(1)} m. Mai multă viteză sau alt unghi?` }) : T({ en: `Too far by ${miss.toFixed(1)} m.`, ro: `Prea departe cu ${miss.toFixed(1)} m.` }));
      draw();
    }, 'primary');

    // The AI: keeps its best try and explores around it with shrinking noise.
    const aiBtn = btn('🤖 ' + T({ en: 'Let the AI learn', ro: 'Lasă IA să învețe' }), async () => {
      if (anim || aiRun) return;
      aiRun = { tries: 0, best: null, sa: 18, sv: 5, rewards: [] };
      history = [];
      say.set(T({ en: "The AI knows nothing about physics. It only gets a reward: minus the distance it missed by. Let's watch!", ro: 'IA nu știe nimic despre fizică. Primește doar o recompensă: minus distanța cu care a ratat. Să vedem!' }));
      let hit = false;
      while (aiRun && aiRun.tries < 60) {
        const r = aiRun;
        let a;
        let v;
        const explore = r.tries < 3 || Math.random() < 0.15;
        if (!r.best || explore) {
          a = 20 + Math.random() * 55;
          v = 6 + Math.random() * 16;
        } else {
          a = Math.max(15, Math.min(75, r.best.a + (Math.random() * 2 - 1) * r.sa));
          v = Math.max(5, Math.min(25, r.best.v + (Math.random() * 2 - 1) * r.sv));
        }
        r.tries++;
        const pts = await launch(v, a, 'ai');
        if (!aiRun) return;
        const miss = score(pts);
        const reward = -Math.abs(miss);
        r.rewards.push(reward);
        history.push({ pts, miss, who: 'ai' });
        if (history.length > 14) history.shift();
        if (!r.best || reward > r.best.reward) {
          r.best = { a, v, reward };
          r.sa = Math.max(1, r.sa * 0.7);
          r.sv = Math.max(0.2, r.sv * 0.7);
        } else {
          r.sa = Math.max(1, r.sa * 0.93);
          r.sv = Math.max(0.2, r.sv * 0.93);
        }
        status.textContent = T({ en: `Try ${r.tries}: ${explore ? 'exploring 🧭' : 'improving its best 🎯'} · reward ${reward.toFixed(1)}`, ro: `Încercarea ${r.tries}: ${explore ? 'explorează 🧭' : 'își îmbunătățește cea mai bună 🎯'} · recompensă ${reward.toFixed(1)}` });
        drawChart();
        if (Math.abs(miss) < 0.8) {
          api.sfx('win');
          missions.check('ai');
          lastHitTargets.push(target);
          if (lastHitTargets.length >= 2 && new Set(lastHitTargets.map((x) => x.toFixed(1))).size >= 2) missions.check('move');
          if (drag > 0) missions.check('drag');
          aiHitsAt.add(target);
          say.set(T({ en: `The AI hit the basket after ${r.tries} tries! It learned only from rewards, by keeping what worked and trying small changes.`, ro: `IA a nimerit coșul după ${r.tries} încercări! A învățat doar din recompense, păstrând ce a mers și încercând mici schimbări.` }), 'happy');
          hit = true;
          break;
        }
      }
      if (aiRun && !hit) say.set(T({ en: 'So close! Learning takes practice. Press "Let the AI learn" to give it another round.', ro: 'Aproape! Învățarea cere exercițiu. Apasă „Lasă IA să învețe” ca să-i dai încă o rundă.' }));
      aiRun = null;
      draw();
    });
    const moveBtn = btn('↔️ ' + T({ en: 'Move basket', ro: 'Mută coșul' }), () => {
      if (anim || aiRun) return;
      target = 10 + Math.round(Math.random() * 14);
      history = [];
      say.set(T({ en: `The basket is now ${target} m away. Old knowledge doesn't fit anymore!`, ro: `Coșul e acum la ${target} m. Ce știa înainte nu se mai potrivește!` }));
      draw();
    }, 'small');
    if (api.level < 2) moveBtn.hidden = true;
    const dragSeg = seg(
      [
        { v: 0, label: T({ en: 'No air', ro: 'Fără aer' }) },
        { v: 0.02, label: '💨 ' + T({ en: 'Air drag', ro: 'Rezistența aerului' }) },
      ],
      0,
      (v) => {
        drag = v;
        history = [];
        say.set(v ? T({ en: 'Now the air slows the ball down, like in real life. The simple formula no longer works... but trial and error still does!', ro: 'Acum aerul frânează mingea, ca în realitate. Formula simplă nu mai merge... dar încercarea și eroarea încă merg!' }) : T({ en: 'No air: a perfect parabola.', ro: 'Fără aer: o parabolă perfectă.' }));
        draw();
      },
    );
    if (api.level < 3) dragSeg.el.hidden = true;

    function draw() {
      const g = cb.g;
      const sky = g.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#dff3ff');
      sky.addColorStop(1, '#ffffff');
      g.fillStyle = sky;
      g.fillRect(0, 0, W, H);
      g.fillStyle = '#9bd46a';
      g.fillRect(0, GY, W, H - GY);
      line(g, 0, GY, W, GY, C.ink, 3);
      for (let m = 0; m <= 30; m += 5) {
        line(g, X0 + m * S, GY, X0 + m * S, GY + 8, C.ink, 2);
        text(g, m + ' m', X0 + m * S, GY + 20, { size: 12, color: C.ink2 });
      }
      // Basket.
      const bx = X0 + target * S;
      rr(g, bx - 0.8 * S, GY - 18, 1.6 * S, 18, 5);
      g.fillStyle = C.rose;
      g.fill();
      g.strokeStyle = C.ink;
      g.lineWidth = 2.5;
      g.stroke();
      emoji(g, '🧺', bx, GY - 34, 30);
      // Past tries.
      history.forEach((hh, i) => {
        const last = i === history.length - 1;
        g.strokeStyle = hh.who === 'ai' ? (last ? C.grape : 'rgba(123,92,255,0.22)') : last ? C.accent : 'rgba(255,107,61,0.25)';
        g.lineWidth = last ? 3.5 : 2;
        g.beginPath();
        hh.pts.forEach(([x, y], j) => (j ? g.lineTo(X0 + x * S, GY - y * S) : g.moveTo(X0 + x * S, GY - y * S)));
        g.stroke();
      });
      // Launcher.
      const a = ((anim ? anim.a : angle) * Math.PI) / 180;
      g.save();
      g.translate(X0, GY - 1 * S);
      g.rotate(-a);
      rr(g, -6, -9, 40, 18, 6);
      g.fillStyle = C.green;
      g.fill();
      g.stroke();
      g.restore();
      emoji(g, '🤖', X0 - 14, GY - 18, 26);
      if (anim) {
        const p = anim.pts[Math.min(anim.i, anim.pts.length - 1)];
        g.strokeStyle = anim.who === 'ai' ? C.grape : C.accent;
        g.lineWidth = 3;
        g.beginPath();
        anim.pts.slice(0, anim.i + 1).forEach(([x, y], j) => (j ? g.lineTo(X0 + x * S, GY - y * S) : g.moveTo(X0 + x * S, GY - y * S)));
        g.stroke();
        dot(g, X0 + p[0] * S, GY - p[1] * S, 8, '#e8772e');
      }
      text(g, T({ en: 'gravity 9.81 m/s²', ro: 'gravitație 9,81 m/s²' }) + (drag ? ' · ' + T({ en: 'air drag on', ro: 'cu rezistența aerului' }) : ''), W - 12, 16, { size: 13, color: C.ink2, align: 'right' });
    }
    function drawChart() {
      const g = chart.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, 620, 120);
      text(g, T({ en: 'AI reward per try (higher = closer)', ro: 'Recompensa IA la fiecare încercare (mai sus = mai aproape)' }), 10, 12, { size: 12, align: 'left', color: C.ink2 });
      const r = aiRun;
      if (!r || !r.rewards.length) return;
      const mn = Math.min(-20, ...r.rewards);
      r.rewards.forEach((v, i) => {
        const x = 16 + i * 14;
        const hgt = ((v - mn) / -mn) * 90;
        g.fillStyle = Math.abs(v) < 0.8 ? C.mint : C.grape;
        g.fillRect(x, 112 - hgt, 10, hgt);
      });
    }
    api.raf((dt) => {
      if (!anim) return;
      anim.i += Math.max(2, Math.round(dt * 100 * (anim.who === 'ai' ? 3 : 1.6)));
      if (anim.i >= anim.pts.length - 1) {
        const a = anim;
        anim = null;
        api.sfx('bounce');
        draw();
        a.resolve(a.pts);
        return;
      }
      draw();
    });
    api.onDestroy(() => (aiRun = null));
    layout(root, {
      intro: T({ en: 'Part 1: try to land the ball in the basket. Part 2: an AI that knows no physics learns to do it by trial and error.', ro: 'Partea 1: încearcă să pui mingea în coș. Partea 2: o IA care nu știe fizică învață să facă asta prin încercare și eroare.' }),
      stage: [cb.wrap, chart.wrap],
      side: [
        card(T({ en: 'You try', ro: 'Încearcă tu' }), sAngle.el, sSpeed.el, h('div', { class: 'row-btns', style: { marginTop: '6px' } }, meBtn)),
        card(T({ en: 'The AI tries', ro: 'Încearcă IA' }), h('div', { class: 'row-btns' }, aiBtn, moveBtn), dragSeg.el, status),
        say.el,
        missions.el,
      ],
    });
    draw();
    drawChart();
  },
};

// ---------- Robot Maze (Q-learning) ----------
const N = 6;
const START = [0, 5];
const GOAL = [5, 0];
const PITS = [[2, 1], [1, 3], [3, 3], [4, 4]];
const WALLS = [[4, 1], [4, 2], [2, 4]];
const ACTS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up right down left
const has = (arr, x, y) => arr.some(([a, b]) => a === x && b === y);

function shortestPath() {
  const dist = {};
  const q = [START];
  dist[START.join()] = 0;
  while (q.length) {
    const [x, y] = q.shift();
    for (const [dx, dy] of ACTS) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= N || ny >= N || has(WALLS, nx, ny) || has(PITS, nx, ny)) continue;
      const k = nx + ',' + ny;
      if (dist[k] == null) {
        dist[k] = dist[x + ',' + y] + 1;
        q.push([nx, ny]);
      }
    }
  }
  return dist[GOAL.join()];
}

export const gridWorld = {
  icon: '🔋',
  title: { en: 'Robot Maze (Q-learning)', ro: 'Labirintul robotului (învățare Q)' },
  desc: { en: 'A robot learns the way to its battery through trial, error and rewards.', ro: 'Un robot învață drumul spre baterie prin încercare, eroare și recompense.' },
  mount(root, api) {
    const T = api.T;
    const S = 70;
    const cb = canvasBox(N * S, N * S, { maxWidth: 440 });
    const chart = canvasBox(420, 110, { maxWidth: 440 });
    let Q = {};
    let eps = 0.2;
    let gamma = 0.9;
    const alpha = 0.5;
    let pos = START.slice();
    let episodes = 0;
    let rewards = [];
    let watching = null;
    let fastLeft = 0;
    let lowGammaTrained = 0;
    let lowGammaFresh = false; // brain reset while γ is low, so old far-sighted values are gone
    const best = shortestPath();
    const missions = api.missions([
      { id: 'watch', t: { en: 'Watch one episode: the robot starts clueless', ro: 'Privește un episod: robotul pornește fără nicio idee' } },
      { id: 'learn', t: { en: 'Train until the robot takes the shortest safe path to the battery', ro: 'Antrenează până când robotul ia cel mai scurt drum sigur spre baterie' } },
      { id: 'gamma', t: { en: 'Set the discount γ low (0.3 or less), reset and train: see the arrows far from the battery go blank', ro: 'Pune factorul γ mic (0,3 sau mai puțin), resetează și antrenează: vezi cum săgețile departe de baterie dispar' }, level: 3 },
    ]);
    const say = bubble('ada', T({ en: 'The robot gets +10 for the battery, −10 for falling in a hole, and −0.1 for every step (so it hurries). It starts knowing nothing!', ro: 'Robotul primește +10 pentru baterie, −10 dacă pică într-o groapă și −0,1 la fiecare pas (ca să se grăbească). Pornește fără să știe nimic!' }));
    const stat = h('div', { class: 'note' });
    const key = (x, y) => x + ',' + y;
    const q = (x, y) => (Q[key(x, y)] ||= [0, 0, 0, 0]);
    const choose = (x, y, e) => {
      if (Math.random() < e) return Math.floor(Math.random() * 4);
      const v = q(x, y);
      const m = Math.max(...v);
      const idx = [0, 1, 2, 3].filter((i) => v[i] === m);
      return idx[Math.floor(Math.random() * idx.length)];
    };
    const move = (x, y, a) => {
      const nx = x + ACTS[a][0];
      const ny = y + ACTS[a][1];
      if (nx < 0 || ny < 0 || nx >= N || ny >= N || has(WALLS, nx, ny)) return [x, y];
      return [nx, ny];
    };
    // One Q-learning step. Returns { done, reward }.
    const stepQ = (s) => {
      const [x, y] = s.pos;
      const a = choose(x, y, eps);
      const [nx, ny] = move(x, y, a);
      let r = -0.1;
      let done = false;
      if (nx === GOAL[0] && ny === GOAL[1]) {
        r = 10;
        done = true;
      } else if (has(PITS, nx, ny)) {
        r = -10;
        done = true;
      }
      const target = done ? r : r + gamma * Math.max(...q(nx, ny));
      q(x, y)[a] += alpha * (target - q(x, y)[a]);
      s.pos = [nx, ny];
      s.total += r;
      s.steps++;
      if (s.steps >= 80) done = true;
      return done;
    };
    const greedyPath = () => {
      let p = START.slice();
      const path = [p];
      for (let i = 0; i < 40; i++) {
        const v = q(p[0], p[1]);
        const m = Math.max(...v);
        if (m === 0 && v.every((x) => x === 0)) return null;
        const a = v.indexOf(m);
        p = move(p[0], p[1], a);
        path.push(p);
        if (p[0] === GOAL[0] && p[1] === GOAL[1]) return path;
        if (has(PITS, p[0], p[1])) return null;
      }
      return null;
    };
    const endEpisode = (s) => {
      episodes++;
      rewards.push(s.total);
      if (rewards.length > 120) rewards.shift();
      if (gamma <= 0.3 && lowGammaFresh) lowGammaTrained++;
      const path = greedyPath();
      if (path && path.length - 1 === best) {
        if (missions.check('learn')) say.set(T({ en: `Learned! The robot now takes the shortest safe path: ${best} steps. Follow the arrows: each one points to the best action in that square.`, ro: `A învățat! Robotul ia acum cel mai scurt drum sigur: ${best} pași. Urmează săgețile: fiecare arată cea mai bună acțiune din căsuța aceea.` }), 'happy');
      }
      if (gamma <= 0.3 && lowGammaFresh && lowGammaTrained >= 40) {
        if (missions.check('gamma')) say.set(T({ en: 'With a low γ the robot is short-sighted: the battery\'s value fades quickly, so squares far away learn almost nothing.', ro: 'Cu γ mic, robotul vede doar pe termen scurt: valoarea bateriei se stinge repede, așa că în căsuțele îndepărtate nu învață aproape nimic.' }));
      }
    };
    const watchBtn = btn('👀 ' + T({ en: 'Watch 1 episode', ro: 'Privește 1 episod' }), () => {
      if (watching || fastLeft) return;
      watching = { pos: START.slice(), total: 0, steps: 0 };
      missions.check('watch');
    }, 'primary');
    const trainBtn = btn('⚡ ' + T({ en: 'Train 50 episodes', ro: 'Antrenează 50 de episoade' }), () => {
      if (watching) return;
      fastLeft += 50;
    });
    const resetBtn = btn('🧠 ' + T({ en: 'Reset brain', ro: 'Resetează creierul' }), () => {
      Q = {};
      episodes = 0;
      rewards = [];
      watching = null;
      fastLeft = 0;
      lowGammaTrained = 0;
      lowGammaFresh = gamma <= 0.3;
      pos = START.slice();
      draw();
    }, 'small');
    const sEps = slider({ label: T({ en: 'Exploration (ε)', ro: 'Explorare (ε)' }), min: 0, max: 1, step: 0.05, value: eps, fmt: (v) => Math.round(v * 100) + '%', onInput: (v) => (eps = v) });
    const sGamma = slider({ label: T({ en: 'Discount (γ)', ro: 'Factor de reducere (γ)' }), min: 0.1, max: 0.99, step: 0.01, value: gamma, fmt: (v) => v.toFixed(2), onInput: (v) => {
      gamma = v;
      lowGammaTrained = 0;
      lowGammaFresh = v <= 0.3 && (lowGammaFresh || episodes === 0);
    } });
    if (api.level < 3) sGamma.el.hidden = true;

    let acc = 0;
    api.raf((dt) => {
      if (watching) {
        acc += dt;
        if (acc > 0.14) {
          acc = 0;
          const done = stepQ(watching);
          pos = watching.pos;
          if (done) {
            const s = watching;
            watching = null;
            endEpisode(s);
            api.sfx(s.total > 0 ? 'good' : 'bad');
            pos = START.slice();
          }
          draw();
        }
      } else if (fastLeft > 0) {
        for (let k = 0; k < 5 && fastLeft > 0; k++) {
          const s = { pos: START.slice(), total: 0, steps: 0 };
          while (!stepQ(s));
          endEpisode(s);
          fastLeft--;
        }
        draw();
      }
    });

    function draw() {
      const g = cb.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, N * S, N * S);
      let mx = 0.01;
      for (const k in Q) mx = Math.max(mx, ...Q[k].map(Math.abs));
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const px = x * S;
          const py = y * S;
          rr(g, px + 2, py + 2, S - 4, S - 4, 10);
          if (has(WALLS, x, y)) {
            g.fillStyle = '#8a7a6a';
            g.fill();
            emoji(g, '🧱', px + S / 2, py + S / 2, 34);
            continue;
          }
          if (has(PITS, x, y)) {
            g.fillStyle = '#2b2f4a';
            g.fill();
            emoji(g, '🕳️', px + S / 2, py + S / 2, 34);
            continue;
          }
          const v = Q[key(x, y)];
          const m = v ? Math.max(...v) : 0;
          g.fillStyle = m > 0 ? `rgba(31,191,162,${Math.min(0.85, (m / mx) * 0.85)})` : m < 0 ? `rgba(242,70,75,${Math.min(0.5, (-m / mx) * 0.5)})` : '#f1f4fb';
          g.fill();
          if (v && m > 0.05 && !(x === GOAL[0] && y === GOAL[1])) {
            const a = v.indexOf(m);
            const cx = px + S / 2;
            const cy = py + S / 2;
            arrow(g, cx - ACTS[a][0] * 16, cy - ACTS[a][1] * 16, cx + ACTS[a][0] * 18, cy + ACTS[a][1] * 18, { width: 4, head: 11 });
          }
        }
      }
      emoji(g, '🔋', GOAL[0] * S + S / 2, GOAL[1] * S + S / 2, 40);
      emoji(g, '🏁', START[0] * S + 14, START[1] * S + 14, 18);
      emoji(g, '🤖', pos[0] * S + S / 2, pos[1] * S + S / 2, 40);
      const path = greedyPath();
      stat.innerHTML = '';
      stat.append(
        h('div', null, T({ en: 'Episodes: ', ro: 'Episoade: ' }), h('b', null, String(episodes))),
        h('div', null, T({ en: 'Best plan so far: ', ro: 'Cel mai bun plan până acum: ' }), h('b', null, path ? T({ en: `${path.length - 1} steps`, ro: `${path.length - 1} pași` }) : T({ en: 'no plan yet', ro: 'încă niciun plan' })), T({ en: ` (shortest possible: ${best})`, ro: ` (cel mai scurt posibil: ${best})` })),
      );
      const cg = chart.g;
      cg.fillStyle = '#fff';
      cg.fillRect(0, 0, 420, 110);
      text(cg, T({ en: 'Total reward per episode', ro: 'Recompensa totală pe episod' }), 8, 10, { size: 12, align: 'left', color: C.ink2 });
      line(cg, 8, 60, 412, 60, C.line, 1);
      rewards.forEach((r, i) => {
        const x = 8 + (i / 120) * 404;
        const hgt = Math.max(-45, Math.min(45, r * 4.5));
        cg.fillStyle = r > 0 ? C.mint : C.rose;
        cg.fillRect(x, hgt > 0 ? 60 - hgt : 60, 3, Math.abs(hgt));
      });
    }
    layout(root, {
      intro: T({ en: 'Green squares have learned they are good, with arrows showing the best move. Red squares have learned they are dangerous.', ro: 'Căsuțele verzi au învățat că sunt bune, cu săgeți care arată cea mai bună mutare. Căsuțele roșii au învățat că sunt periculoase.' }),
      stage: [cb.wrap, chart.wrap],
      side: [card(null, h('div', { class: 'row-btns' }, watchBtn, trainBtn, resetBtn), h('div', { style: { marginTop: '10px' } }, sEps.el, sGamma.el), stat), say.el, missions.el],
    });
    draw();
  },
};
