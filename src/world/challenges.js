import * as THREE from 'three';
import { chPoint, terrainHeight, lossValley, local, TOP, SEABED, CH_DIPS } from './layout.js';
import { makeBoard } from './labels.js';
import { makeBall, makeBallSpec, removeBall } from './balls.js';
import { CHALLENGES } from '../content/challenges.js';
import { L, t } from '../i18n.js';
import { state } from '../state.js';
import { sfx } from '../audio.js';

// Island challenges: one physical puzzle per island, solved by moving Bip,
// pushing and kicking balls, standing on plates and walking patterns.

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, ...extra });
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
const DISPLAY = '"Fredoka", "Segoe UI", system-ui, sans-serif';

const spriteTex = {};
function emojiSprite(e, size = 0.5) {
  if (!spriteTex[e]) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.font = `100px ${EMOJI_FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(e, 64, 72);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    spriteTex[e] = tex;
  }
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteTex[e], depthWrite: false, transparent: true }));
  s.scale.set(size, size, 1);
  return s;
}

// A plane with a canvas you can draw anything on.
function canvasPanel(w, h, px = 512) {
  const c = document.createElement('canvas');
  c.width = px;
  c.height = Math.round((px * h) / w);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, side: THREE.DoubleSide }));
  return { mesh, g: c.getContext('2d'), W: c.width, H: c.height, update: () => (tex.needsUpdate = true) };
}

const flat = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const slow = (b, v = 0.5) => b.vel.length() < v;

export function buildChallenge(isl, ctx) {
  const id = 's' + (isl.idx + 1);
  const def = CHALLENGES[id];
  const group = new THREE.Group();
  ctx.scene.add(group);
  const Q = (a, b) => {
    const p = chPoint(isl, a, b);
    return { x: p.x, z: p.z, y: terrainHeight(p.x, p.z) };
  };
  const LP = (rad, tan) => {
    const p = local(isl, rad, tan);
    return { x: p.x, z: p.z, y: terrainHeight(p.x, p.z) };
  };
  // Yaw that makes a board face the middle of the island.
  const face = (x, z) => Math.atan2(isl.x - x, isl.z - z);
  const api = {
    id,
    isl,
    Q,
    LP,
    group,
    face,
    done() {
      ctx.challengeDone(id);
    },
    isDone: () => !!(state.field && state.field[id]),
    ring(p, r, color, tube = 0.07) {
      const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 8, 48), new THREE.MeshBasicMaterial({ color, toneMapped: false }));
      m.rotation.x = Math.PI / 2;
      // Sit the ring on the ground at its own radius (dips are lower in the middle).
      let y = 0;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        y += terrainHeight(p.x + Math.cos(a) * r, p.z + Math.sin(a) * r);
      }
      m.position.set(p.x, y / 8 + 0.06, p.z);
      group.add(m);
      return m;
    },
    board(p, w, h, height, spec) {
      const b = makeBoard(spec || { title: '' }, w, h);
      b.position.set(p.x, p.y + height, p.z);
      b.rotation.y = face(p.x, p.z);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, height - h / 2, 8), std('#7a4f33'));
      post.position.set(p.x, p.y + (height - h / 2) / 2, p.z);
      post.castShadow = true;
      group.add(b, post);
      ctx.physics.addCircle(p.x, p.z, 0.12, p.y - 1, p.y + height);
      ctx.reserve(p.x, p.z, 1.2);
      return b;
    },
    // Balls resting within r of a point.
    ballsIn(p, r, maxSpeed = 0.5) {
      return ctx.physics.balls.filter((b) => flat(b.pos, p) < r && b.pos.y < p.y + 1 && slow(b, maxSpeed));
    },
  };
  const spec = BUILDERS[isl.idx](api, ctx);
  if (!spec) return group;

  // The challenge flag: press E to hear the instructions (and put the pieces back).
  const fp = spec.post;
  const flag = new THREE.Group();
  flag.position.set(fp.x, fp.y, fp.z);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.6, 8), std('#e9eef8', { metalness: 0.3 }));
  pole.position.y = 1.3;
  const banner = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.55, 0.8), std('#ffd23f', { emissive: '#ff9f1a', emissiveIntensity: 0.35 }));
  banner.position.set(0, 2.25, 0.42);
  const star = emojiSprite('⭐', 0.7);
  star.position.y = 2.95;
  flag.add(pole, banner, star);
  flag.rotation.y = face(fp.x, fp.z) + Math.PI / 2;
  flag.traverse((o) => o.isMesh && (o.castShadow = true));
  group.add(flag);
  ctx.physics.addCircle(fp.x, fp.z, 0.12, fp.y - 1, fp.y + 2.6);
  ctx.reserve(fp.x, fp.z, 1.3);
  ctx.interact({
    x: fp.x,
    z: fp.z,
    r: 1.7,
    kind: 'challenge',
    label: () => (api.isDone() ? '✅ ' : '⭐ ') + t('promptChallenge', { title: L(def.title) }),
    action: () => ctx.challengeInfo(id, () => spec.reset && spec.reset()),
  });
  let time = 0;
  ctx.onUpdate((dt) => {
    time += dt;
    star.position.y = 2.95 + Math.sin(time * 2.5) * 0.08;
    banner.material.color.set(api.isDone() ? '#43b05c' : '#ffd23f');
    banner.material.emissive.set(api.isDone() ? '#2a8a3f' : '#ff9f1a');
  });
  return group;
}

// ---------- 1. Tag the machines ----------
function c1(api, ctx) {
  const items = [
    { e: '🤳', n: { en: 'Face unlock', ro: 'Deblocare cu fața' }, a: 'learn' },
    { e: '🧮', n: { en: 'Calculator', ro: 'Calculator de buzunar' }, a: 'rules' },
    { e: '📺', n: { en: 'Video suggestions', ro: 'Sugestii video' }, a: 'learn' },
    { e: '⏰', n: { en: 'Alarm clock', ro: 'Ceas deșteptător' }, a: 'rules' },
    { e: '🗣️', n: { en: 'Voice assistant', ro: 'Asistent vocal' }, a: 'learn' },
  ];
  const TAG = {
    learn: { e: '🧠', n: { en: 'learns from data', ro: 'învață din date' } },
    rules: { e: '📜', n: { en: 'follows rules', ro: 'urmează reguli' } },
  };
  const tags = items.map(() => null);
  const peds = items.map((it, i) => {
    const a = -3.2 + i * 1.6;
    const p = api.Q(a, 0.9 - Math.abs(a) * 0.18);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 1, 16), std('#dfe6f7'));
    ped.position.set(p.x, p.y + 0.5, p.z);
    ped.castShadow = true;
    const icon = makeBoard({ title: '', big: it.e, bigSize: 190 }, 0.7, 0.7);
    icon.position.set(p.x, p.y + 1.5, p.z);
    icon.rotation.y = api.face(p.x, p.z);
    const tag = makeBoard({ title: '?' }, 0.9, 0.4);
    tag.position.set(p.x, p.y + 2.05, p.z);
    tag.rotation.y = api.face(p.x, p.z);
    api.group.add(ped, icon, tag);
    ctx.physics.addCircle(p.x, p.z, 0.42, p.y - 1, p.y + 1);
    return { p, ped, tag, it };
  });
  const board = api.board(api.Q(0, 2.9), 2.8, 1.2, 2.3);
  const drawTag = (i) => {
    const tg = tags[i];
    peds[i].tag.userData.redraw({ title: tg ? TAG[tg].e : '?', titleSize: 64, accent: '#ff6b3d' });
  };
  const status = () => {
    const all = tags.every(Boolean);
    const right = tags.filter((tg, i) => tg === items[i].a).length;
    peds.forEach((pd, i) => pd.ped.material.color.set(!all ? '#dfe6f7' : tags[i] === items[i].a ? '#7ee0a8' : '#ff9a9a'));
    board.userData.redraw({
      eyebrow: '⭐ ' + L(CHALLENGES.s1.title),
      accent: '#ff6b3d',
      title: all ? `${right} / 5 ${right === 5 ? '✅' : ''}` : L({ en: 'Tag all 5 objects (E)', ro: 'Etichetează toate cele 5 obiecte (E)' }),
      titleSize: 44,
      body: '🧠 ' + L(TAG.learn.n) + '   📜 ' + L(TAG.rules.n),
      bodySize: 26,
    });
    if (right === 5) api.done();
  };
  peds.forEach((pd, i) =>
    ctx.interact({
      x: pd.p.x,
      z: pd.p.z,
      r: 1.3,
      kind: 'challenge',
      label: () => '🏷️ ' + L(pd.it.n) + ': ' + (tags[i] ? TAG[tags[i]].e + ' ' + L(TAG[tags[i]].n) : '?'),
      action: () => {
        tags[i] = tags[i] === null ? 'learn' : tags[i] === 'learn' ? 'rules' : null;
        sfx('click');
        drawTag(i);
        status();
      },
    }),
  );
  ctx.onLang(() => {
    peds.forEach((_, i) => drawTag(i));
    status();
  });
  peds.forEach((_, i) => drawTag(i));
  status();
  return {
    post: api.Q(-4.5, -0.6),
    reset() {
      tags.fill(null);
      peds.forEach((_, i) => drawTag(i));
      status();
    },
  };
}

// ---------- 2. Label the fruit ----------
function c2(api, ctx) {
  const zones = [
    { key: 'apple', ab: CH_DIPS[1][0], color: '#e53935', e: '🍎', n: { en: 'Apples', ro: 'Mere' } },
    { key: 'orange', ab: CH_DIPS[1][1], color: '#ff8f1f', e: '🍊', n: { en: 'Oranges', ro: 'Portocale' } },
  ];
  for (const z of zones) {
    z.p = api.Q(z.ab[0], z.ab[1]);
    z.r = z.ab[2];
    api.ring(z.p, z.r, z.color, 0.09);
    z.board = api.board(api.Q(z.ab[0], z.ab[1] + 2.1), 1.5, 0.8, 1.7);
  }
  const fruitSpec = { r: 0.18, mass: 0.2, restitution: 0.35, inertia: 0.4, rollResist: 0.09, type: 'plain' };
  const fruitDefs = [
    ['apple', '#e53935', '🍎'],
    ['orange', '#ff8f1f', '🍊'],
    ['apple', '#7cb342', '🍏'],
    ['orange', '#ff8f1f', '🍊'],
    ['apple', '#d32f2f', '🍎'],
    ['orange', '#ff8f1f', '🍊'],
  ];
  const fruits = fruitDefs.map(([kind, color, e], i) => {
    const p = api.Q(-2.5 + i, -1.4);
    const b = makeBallSpec(ctx.physics, ctx.scene, fruitSpec, p.x, p.y + 0.4, p.z, color);
    b.home.set(p.x, p.y + 0.4, p.z);
    b.kind = kind;
    const s = emojiSprite(e, 0.42);
    api.group.add(s);
    return { b, s };
  });
  const draw = () => {
    for (const z of zones) {
      const n = fruits.filter((f) => f.b.kind === z.key && flat(f.b.pos, z.p) < z.r - 0.05).length;
      z.board.userData.redraw({ title: z.e + ' ' + L(z.n), titleSize: 50, body: `${n} / 3`, bodySize: 40, accent: z.color });
    }
  };
  let acc = 0;
  ctx.onUpdate((dt) => {
    for (const f of fruits) f.s.position.set(f.b.pos.x, f.b.pos.y + 0.45, f.b.pos.z);
    acc += dt;
    if (acc < 0.4) return;
    acc = 0;
    draw();
    const ok = fruits.every((f) => {
      const z = zones.find((zz) => zz.key === f.b.kind);
      return flat(f.b.pos, z.p) < z.r - 0.05 && slow(f.b);
    });
    if (ok) api.done();
  });
  ctx.onLang(draw);
  draw();
  return { post: api.Q(-4.3, -0.8), reset: () => fruits.forEach((f) => f.b.reset()) };
}

// ---------- 3. Odd one out ----------
function c3(api, ctx) {
  const [za, zb, zr] = CH_DIPS[2][0];
  const zone = api.Q(za, zb);
  api.ring(zone, zr, '#ffc21a', 0.09);
  const board = api.board(api.Q(0, 4.0), 2.6, 1.1, 2.1);
  const spots = [-2.4, -1.2, 0, 1.2, 2.4].map((a) => api.Q(a, -0.8));
  const ROUNDS = [
    { n: { en: 'Round 1 of 3: color', ro: 'Runda 1 din 3: culoarea' }, make: (odd) => ({ spec: { r: 0.22, mass: 0.5 }, color: odd ? '#2a9df4' : '#f2464b' }) },
    { n: { en: 'Round 2 of 3: size', ro: 'Runda 2 din 3: mărimea' }, make: (odd) => (odd ? { spec: { r: 0.34, mass: 1.1 }, color: '#ffc21a' } : { spec: { r: 0.19, mass: 0.35 }, color: '#ffc21a' }) },
    { n: { en: 'Round 3 of 3: weight (push them!)', ro: 'Runda 3 din 3: greutatea (împinge-le!)' }, make: (odd) => ({ spec: { r: 0.22, mass: odd ? 9 : 0.35, restitution: odd ? 0.2 : 0.6 }, color: '#43b05c' }) },
  ];
  let round = 0;
  let balls = [];
  let wait = 0;
  let msg = null;
  const setup = () => {
    balls.forEach((b) => removeBall(ctx.physics, ctx.scene, b));
    const oddIdx = Math.floor(Math.random() * 5);
    balls = spots.map((p, i) => {
      const m = ROUNDS[round].make(i === oddIdx);
      const b = makeBallSpec(ctx.physics, ctx.scene, { restitution: 0.6, rollResist: 0.08, inertia: 0.4, type: 'plain', ...m.spec }, p.x, p.y + 0.5, p.z, m.color);
      b.isOdd = i === oddIdx;
      return b;
    });
    msg = null;
    draw();
  };
  const draw = () =>
    board.userData.redraw({
      eyebrow: '⭐ ' + L(CHALLENGES.s3.title),
      accent: '#ffc21a',
      title: round >= 3 ? '✅ 3 / 3' : L(ROUNDS[round].n),
      titleSize: 40,
      body: msg ? L(msg) : L({ en: 'Push the odd ball into the gold circle', ro: 'Împinge intrusa în cercul auriu' }),
      bodySize: 26,
    });
  let acc = 0;
  ctx.onUpdate((dt) => {
    if (wait > 0) {
      wait -= dt;
      if (wait <= 0) {
        if (round >= 3) {
          api.done();
          draw();
        } else setup();
      }
      return;
    }
    acc += dt;
    if (acc < 0.3 || round >= 3) return;
    acc = 0;
    const inZone = balls.filter((b) => flat(b.pos, zone) < zr - 0.1 && slow(b, 0.6));
    if (inZone.length === 1 && inZone[0].isOdd) {
      round++;
      sfx('good');
      ctx.particles.emit({ x: zone.x, y: zone.y + 0.6, z: zone.z, count: 40, colors: ['#ffd23f', '#ffffff'], up: 4, spread: 2, size: 0.2 });
      msg = { en: 'Yes! That one was different.', ro: 'Da! Aceea era diferită.' };
      draw();
      wait = 1.4;
    } else if (inZone.some((b) => !b.isOdd)) {
      if (!msg || msg.en.startsWith('Yes')) {
        msg = { en: 'That one is just like the others. Push it out!', ro: 'Aceea e la fel ca celelalte. Scoate-o afară!' };
        draw();
      }
    }
  });
  ctx.onLang(draw);
  setup();
  return {
    post: api.Q(-4.4, -0.4),
    reset() {
      round = 0;
      wait = 0;
      setup();
    },
  };
}

// ---------- 4. Be the mystery point ----------
function c4(api, ctx) {
  const K = api.isl.knn;
  if (!K) return null;
  const cos = Math.cos(K.rot);
  const sin = Math.sin(K.rot);
  const cols = ['#f2464b', '#2a9df4'];
  const lines = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1, 6), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }));
    m.visible = false;
    api.group.add(m);
    return m;
  });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.07, 8, 32), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }));
  halo.rotation.x = Math.PI / 2;
  halo.visible = false;
  api.group.add(halo);
  const got = { red: false, blue: false, close: false };
  const bp = api.LP(2.2, 5.2);
  const board = api.board(bp, 2.6, 1.3, 2.2);
  const draw = (vote) =>
    board.userData.redraw({
      eyebrow: '⭐ ' + L(CHALLENGES.s4.title) + (vote ? `   🔴 ${vote[0]} · 🔵 ${vote[1]}` : ''),
      accent: '#1fbfa2',
      title: `${got.red ? '✅' : '⬜'} 🔴 3-0   ${got.blue ? '✅' : '⬜'} 🔵 3-0   ${got.close ? '✅' : '⬜'} 2-1`,
      titleSize: 36,
      body: L({ en: 'Walk on the grid: you are the new example!', ro: 'Mergi pe grilă: tu ești exemplul nou!' }),
      bodySize: 26,
    });
  const up = new THREE.Vector3(0, 1, 0);
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  let lastVote = '';
  ctx.onUpdate((dt, time, p) => {
    const dx = p.x - K.center.x;
    const dz = p.z - K.center.z;
    const lx = dx * cos - dz * sin;
    const lz = dx * sin + dz * cos;
    const on = Math.abs(lx) < K.half && Math.abs(lz) < K.half && Math.abs(p.y - K.floorY) < 0.6;
    lines.forEach((l) => (l.visible = on));
    halo.visible = on;
    if (!on) return;
    const near = K.pts.map((q) => ({ q, d: Math.hypot(q.x - p.x, q.z - p.z) })).sort((u, v) => u.d - v.d).slice(0, 3);
    const votes = [0, 0];
    near.forEach((n, i) => {
      votes[n.q.c]++;
      a.set(p.x, p.y + 0.9, p.z);
      b.set(n.q.x, n.q.y, n.q.z);
      const len = a.distanceTo(b);
      lines[i].position.copy(a).add(b).multiplyScalar(0.5);
      lines[i].scale.set(1, len, 1);
      lines[i].quaternion.setFromUnitVectors(up, b.clone().sub(a).normalize());
      lines[i].material.color.set(cols[n.q.c]);
    });
    const winner = votes[1] > votes[0] ? 1 : 0;
    halo.position.set(p.x, p.y + 0.05, p.z);
    halo.material.color.set(cols[winner]);
    halo.scale.setScalar(1 + Math.sin(time * 6) * 0.08);
    const key = votes.join('-');
    if (key !== lastVote) {
      lastVote = key;
      if (votes[0] === 3) got.red = true;
      if (votes[1] === 3) got.blue = true;
      if (votes[0] === 2 || votes[1] === 2) got.close = true;
      sfx('blip');
      draw(votes);
      if (got.red && got.blue && got.close) api.done();
    }
  });
  ctx.onLang(() => draw());
  draw();
  return {
    post: api.LP(3.2, 6.4),
    reset() {
      got.red = got.blue = got.close = false;
      lastVote = '';
      draw();
    },
  };
}

// ---------- 5. Two valleys ----------
function c5(api, ctx) {
  const center = { x: lossValley.x, z: lossValley.z, y: terrainHeight(lossValley.x, lossValley.z) };
  const side = { x: lossValley.side.x, z: lossValley.side.z, y: terrainHeight(lossValley.side.x, lossValley.side.z) };
  api.ring(center, 1.0, '#5a67d8', 0.06);
  api.ring(side, 0.75, '#b44dff', 0.06);
  const board = api.board(api.LP(0.8, 4.4), 2.7, 1.2, 2.2);
  let g = false;
  let l = false;
  const draw = () =>
    board.userData.redraw({
      eyebrow: '⭐ ' + L(CHALLENGES.s5.title),
      accent: '#2a9df4',
      title: `${g ? '✅' : '⬜'} ${L({ en: 'global min', ro: 'minim global' })}   ${l ? '✅' : '⬜'} ${L({ en: 'local min', ro: 'minim local' })}`,
      titleSize: 34,
      body: L({ en: 'Blue ring: the bottom. Purple ring: the side dip.', ro: 'Inelul albastru: fundul. Inelul mov: gropița.' }),
      bodySize: 25,
    });
  let acc = 0;
  ctx.onUpdate((dt) => {
    acc += dt;
    if (acc < 0.4) return;
    acc = 0;
    const gb = ctx.physics.balls.find((b) => flat(b.pos, center) < 1.0 && slow(b, 0.3));
    const lb = ctx.physics.balls.find((b) => b !== gb && flat(b.pos, side) < 0.8 && slow(b, 0.3));
    if (!!gb !== g || !!lb !== l) {
      g = !!gb;
      l = !!lb;
      draw();
    }
    if (g && l) api.done();
  });
  ctx.onLang(draw);
  draw();
  return { post: api.LP(0.2, 2.6) };
}

// Pressure plates: a ring on the ground that turns on when Bip stands on it or a ball rests on it.
function makePlates(api, ctx, dips, colors) {
  return dips.map(([a, b, r], i) => {
    const p = api.Q(a, b);
    const ring = api.ring(p, r * 0.9, colors[i], 0.08);
    const dot = new THREE.Mesh(new THREE.CircleGeometry(0.25, 20), new THREE.MeshBasicMaterial({ color: colors[i], toneMapped: false, transparent: true, opacity: 0.5 }));
    dot.rotation.x = -Math.PI / 2;
    dot.position.set(p.x, terrainHeight(p.x, p.z) + 0.03, p.z);
    api.group.add(dot);
    const plate = { p, r: r * 0.9, ring, dot, on: false, color: colors[i] };
    plate.check = (pp) => {
      const bip = flat(pp, p) < plate.r && pp.y < p.y + 0.6;
      const ball = ctx.physics.balls.some((bb) => bb.mass >= 0.3 && flat(bb.pos, p) < plate.r && bb.pos.y - bb.r < p.y + 0.4);
      plate.on = bip || ball;
      ring.material.color.set(plate.on ? '#ffffff' : colors[i]);
      dot.material.opacity = plate.on ? 1 : 0.5;
      return plate.on;
    };
    return plate;
  });
}

// ---------- 6. Wake the neuron ----------
function c6(api, ctx) {
  const inputs = [
    { e: '☀️', w: 2 },
    { e: '📚', w: 2 },
    { e: '🧑‍🤝‍🧑', w: 1 },
  ];
  const plates = makePlates(api, ctx, CH_DIPS[5], ['#ffc21a', '#2a9df4', '#43b05c']);
  plates.forEach((pl, i) => {
    const bp = api.Q(CH_DIPS[5][i][0], CH_DIPS[5][i][1] + 1.35);
    const s = emojiSprite(inputs[i].e, 0.6);
    s.position.set(bp.x, bp.y + 1.0, bp.z);
    api.group.add(s);
    const w = makeBoard({ title: '', big: '×' + inputs[i].w, bigSize: 150, bigInk: '#1d2340' }, 0.6, 0.4);
    w.position.set(bp.x, bp.y + 0.45, bp.z);
    w.rotation.y = api.face(bp.x, bp.z);
    api.group.add(w);
  });
  const np = api.Q(0, 3.4);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 1.6, 10), std('#3b4a7a'));
  post.position.set(np.x, np.y + 0.8, np.z);
  const cell = new THREE.Mesh(new THREE.IcosahedronGeometry(0.6, 1), std('#b39dff', { emissive: '#7b5cff', emissiveIntensity: 0.2, flatShading: true }));
  cell.position.set(np.x, np.y + 2.1, np.z);
  api.group.add(post, cell);
  ctx.physics.addCircle(np.x, np.z, 0.3, np.y - 1, np.y + 2.7);
  const board = api.board(api.Q(-2.9, 3.2), 2.6, 1.1, 2.0);
  const balls = [api.Q(-1.1, -1.7), api.Q(1.1, -1.7)].map((p) => makeBall(ctx.physics, ctx.scene, 'rubber', p.x, p.y + 0.4, p.z, '#b44dff'));
  let lastKey = '';
  let fired = 0;
  const draw = (sum, bits) =>
    board.userData.redraw({
      eyebrow: '⭐ ' + L(CHALLENGES.s6.title),
      accent: '#7b5cff',
      title: `Σ = ${bits[0] * 2} + ${bits[1] * 2} + ${bits[2]} − 3 = ${sum}`,
      titleSize: 40,
      body: sum > 0 ? L({ en: '⚡ More than 0: it fires!', ro: '⚡ Mai mult decât 0: se aprinde!' }) : L({ en: 'Not more than 0: asleep 😴', ro: 'Nu e mai mult decât 0: doarme 😴' }),
      bodySize: 28,
    });
  let t2 = 0;
  ctx.onUpdate((dt, time, p) => {
    const bits = plates.map((pl) => (pl.check(p) ? 1 : 0));
    const sum = bits[0] * 2 + bits[1] * 2 + bits[2] - 3;
    const key = bits.join('');
    if (key !== lastKey) {
      lastKey = key;
      draw(sum, bits);
      if (sum > 0) {
        sfx('good');
        ctx.particles.emit({ x: cell.position.x, y: cell.position.y, z: cell.position.z, count: 40, colors: ['#ffe36b', '#ffffff', '#b388ff'], up: 3, spread: 2, size: 0.2 });
        api.done();
      }
    }
    fired = sum > 0 ? 1 : Math.max(0, fired - dt * 2);
    t2 += dt;
    cell.material.emissiveIntensity = 0.2 + fired * (1.2 + Math.sin(t2 * 12) * 0.3);
    cell.rotation.y += dt * (0.3 + fired * 3);
  });
  ctx.onLang(() => {
    lastKey = '';
  });
  draw(-3, [0, 0, 0]);
  return { post: api.Q(-4.2, -0.8), reset: () => balls.forEach((b) => b.reset()) };
}

// ---------- 7. The XOR puzzle ----------
function c7(api, ctx) {
  const plates = makePlates(api, ctx, CH_DIPS[6], ['#2a9df4', '#ff8a1f']);
  plates.forEach((pl, i) => {
    const s = emojiSprite(i ? '🅱️' : '🅰️', 0.7);
    s.position.set(pl.p.x, pl.p.y + 1.1, pl.p.z);
    api.group.add(s);
  });
  // A small network on a stand: 2 inputs -> 2 hidden (OR, AND) -> 1 output.
  const np = api.Q(0, 2.6);
  const stand = new THREE.Group();
  stand.position.set(np.x, np.y, np.z);
  stand.rotation.y = api.face(np.x, np.z);
  api.group.add(stand);
  const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.4, 0.12), std('#27305a'));
  back.position.set(0, 2.0, -0.1);
  const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), std('#27305a'));
  leg.position.set(0, 0.4, -0.1);
  stand.add(back, leg);
  ctx.physics.addBox(np.x, np.z, 1.6, 0.2, -stand.rotation.y, np.y - 1, np.y + 3.2);
  const node = (x, y, color) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), std(color, { emissive: color, emissiveIntensity: 0.1 }));
    m.position.set(x, y, 0.05);
    stand.add(m);
    return m;
  };
  const inA = node(-1.0, 1.2, '#2a9df4');
  const inB = node(1.0, 1.2, '#ff8a1f');
  const hOr = node(-0.8, 2.0, '#b44dff');
  const hAnd = node(0.8, 2.0, '#b44dff');
  const out = node(0, 2.8, '#ffd23f');
  out.scale.setScalar(1.5);
  const link = (m1, m2, color) => {
    const g = new THREE.BufferGeometry().setFromPoints([m1.position, m2.position]);
    stand.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color })));
  };
  [[inA, hOr], [inA, hAnd], [inB, hOr], [inB, hAnd]].forEach(([u, v]) => link(u, v, '#8fa3d9'));
  link(hOr, out, '#43b05c');
  link(hAnd, out, '#f2464b');
  const tags = makeBoard({ title: '', body: 'OR   ·   AND', bodySize: 34 }, 1.8, 0.3);
  tags.position.set(0, 1.62, 0.07);
  stand.add(tags);
  const balls = [api.Q(-3.2, -1.8), api.Q(3.2, -1.8)].map((p) => makeBall(ctx.physics, ctx.scene, 'rubber', p.x, p.y + 0.4, p.z, '#ff4d9d'));
  const board = api.board(api.Q(3.4, 2.4), 2.6, 1.2, 2.0);
  const steps = { one: null, both: false, other: false };
  const draw = () =>
    board.userData.redraw({
      eyebrow: '⭐ ' + L(CHALLENGES.s7.title),
      accent: '#b44dff',
      title: `${steps.one ? '✅' : '⬜'} 1   ${steps.both ? '✅' : '⬜'} A+B   ${steps.other ? '✅' : '⬜'} 2`,
      titleSize: 40,
      body: !steps.one
        ? L({ en: 'Light the lamp with ONE plate', ro: 'Aprinde lampa cu O SINGURĂ placă' })
        : !steps.both
          ? L({ en: 'Now press BOTH plates', ro: 'Acum apasă AMBELE plăci' })
          : L({ en: 'Now light it with the OTHER plate', ro: 'Acum aprinde-o cu CEALALTĂ placă' }),
      bodySize: 26,
    });
  const lit = (m, on) => (m.material.emissiveIntensity = on ? 1.3 : 0.1);
  let lastKey = '';
  ctx.onUpdate((dt, time, p) => {
    const a = plates[0].check(p) ? 1 : 0;
    const b = plates[1].check(p) ? 1 : 0;
    const or = a + b - 0.5 > 0 ? 1 : 0;
    const and = a + b - 1.5 > 0 ? 1 : 0;
    const o = or - 2 * and - 0.5 > 0 ? 1 : 0;
    lit(inA, a);
    lit(inB, b);
    lit(hOr, or);
    lit(hAnd, and);
    lit(out, o);
    const key = `${a}${b}`;
    if (key === lastKey) return;
    lastKey = key;
    if (o) sfx('good');
    if (o && !steps.one) steps.one = a ? 'A' : 'B';
    else if (a && b && steps.one) steps.both = true;
    else if (o && steps.both && (a ? 'A' : 'B') !== steps.one) steps.other = true;
    draw();
    if (steps.one && steps.both && steps.other) api.done();
  });
  ctx.onLang(draw);
  draw();
  return {
    post: api.Q(-4.2, 0.6),
    reset() {
      steps.one = null;
      steps.both = steps.other = false;
      balls.forEach((b) => b.reset());
      draw();
    },
  };
}

// ---------- 8. Pixel floor ----------
function c8(api, ctx) {
  const N = 6;
  const O = api.Q(0, 0);
  const T = { x: api.isl.tangent.x, z: api.isl.tangent.z };
  const R = { x: api.isl.radial.x, z: api.isl.radial.z };
  let top = -Infinity;
  for (let i = -3; i <= 3; i++) for (let j = -3; j <= 3; j++) top = Math.max(top, terrainHeight(O.x + T.x * i + R.x * j, O.z + T.z * i + R.z * j));
  const Y = top + 0.12;
  const rot = Math.atan2(T.z, T.x);
  ctx.physics.addBox(O.x, O.z, N / 2, N / 2, rot, Y - 1.5, Y, { walkable: true });
  const base = new THREE.Mesh(new THREE.BoxGeometry(N + 0.2, 0.5, N + 0.2), std('#27305a'));
  base.position.set(O.x, Y - 0.25, O.z);
  base.rotation.y = -rot;
  base.receiveShadow = true;
  api.group.add(base);
  const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.92, 0.06, 0.92), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 }), N * N);
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -rot);
  const cellPos = (c, r) => ({ x: O.x + T.x * (c - 2.5) + R.x * (2.5 - r), z: O.z + T.z * (c - 2.5) + R.z * (2.5 - r) });
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const p = cellPos(c, r);
      m4.compose(new THREE.Vector3(p.x, Y - 0.02, p.z), q, new THREE.Vector3(1, 1, 1));
      tiles.setMatrixAt(r * N + c, m4);
    }
  }
  tiles.receiveShadow = true;
  api.group.add(tiles);
  const TARGET = new Set(['1,1', '1,2', '1,3', '1,4', '2,4', '3,4']);
  const bits = new Array(N * N).fill(0);
  const color = new THREE.Color();
  const paint = () => {
    for (let i = 0; i < N * N; i++) tiles.setColorAt(i, color.set(bits[i] ? '#fff6c8' : '#2b3150'));
    tiles.instanceColor.needsUpdate = true;
  };
  // The board: the target picture and the numbers the computer sees.
  const bp = api.Q(0, 4.1);
  const panel = canvasPanel(3.0, 1.5);
  panel.mesh.position.set(bp.x, bp.y + 2.1, bp.z);
  panel.mesh.rotation.y = api.face(bp.x, bp.z);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 1.4, 8), std('#7a4f33'));
  pole.position.set(bp.x, bp.y + 0.7, bp.z);
  api.group.add(panel.mesh, pole);
  ctx.physics.addCircle(bp.x, bp.z, 0.12, bp.y - 1, bp.y + 3);
  ctx.reserve(bp.x, bp.z, 1.4);
  const drawBoard = () => {
    const { g, W, H } = panel;
    g.fillStyle = '#f6f9ff';
    g.fillRect(0, 0, W, H);
    g.lineWidth = 8;
    g.strokeStyle = '#1d2340';
    g.strokeRect(4, 4, W - 8, H - 8);
    g.fillStyle = '#e0501f';
    g.font = `600 22px ${DISPLAY}`;
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.fillText('⭐ ' + L(CHALLENGES.s8.title).toUpperCase(), 18, 14);
    const cs = 26;
    const drawGrid = (x0, y0, fn) => {
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          g.fillStyle = fn(c, r) ? '#ffd23f' : '#2b3150';
          g.fillRect(x0 + c * cs, y0 + r * cs, cs - 3, cs - 3);
        }
      }
    };
    g.fillStyle = '#1d2340';
    g.font = `600 18px ${DISPLAY}`;
    g.fillText(L({ en: 'Copy this', ro: 'Copiază asta' }), 20, 46);
    drawGrid(20, 72, (c, r) => TARGET.has(`${c},${r}`));
    g.fillText(L({ en: 'The computer sees', ro: 'Calculatorul vede' }), 206, 46);
    g.font = `700 20px ui-monospace, Consolas, monospace`;
    for (let r = 0; r < N; r++) {
      let row = '';
      for (let c = 0; c < N; c++) row += bits[r * N + c] + ' ';
      g.fillStyle = '#1d2340';
      g.fillText(row, 206, 76 + r * 26);
    }
    const ok = [...bits.keys()].filter((i) => (bits[i] === 1) === TARGET.has(`${i % N},${Math.floor(i / N)}`)).length;
    g.font = `700 26px ${DISPLAY}`;
    g.fillStyle = ok === N * N ? '#13957e' : '#1d2340';
    g.fillText(ok === N * N ? '✅ 36 / 36' : `${ok} / 36`, 380, 110);
    panel.update();
  };
  let last = null;
  ctx.onUpdate((dt, time, p) => {
    const dx = p.x - O.x;
    const dz = p.z - O.z;
    const a = dx * T.x + dz * T.z;
    const b = dx * R.x + dz * R.z;
    const onFloor = Math.abs(a) < N / 2 && Math.abs(b) < N / 2 && Math.abs(p.y - Y) < 0.35;
    if (!onFloor) {
      last = null;
      return;
    }
    const c = Math.min(N - 1, Math.max(0, Math.floor(a + N / 2)));
    const r = Math.min(N - 1, Math.max(0, Math.floor(N / 2 - b)));
    const key = r * N + c;
    if (key === last) return;
    last = key;
    bits[key] ^= 1;
    sfx('blip');
    paint();
    drawBoard();
    if (bits.every((v, i) => (v === 1) === TARGET.has(`${i % N},${Math.floor(i / N)}`))) api.done();
  });
  ctx.onLang(drawBoard);
  paint();
  drawBoard();
  return {
    post: api.Q(-3.9, -3.4),
    reset() {
      bits.fill(0);
      paint();
      drawBoard();
    },
  };
}

// ---------- 9. Trust the pattern ----------
function c9(api, ctx) {
  const isl = api.isl;
  const rot = Math.atan2(isl.tangent.z, isl.tangent.x);
  const stones = [];
  const stoneMat = std('#c9bca4', { flatShading: true });
  const glowMat = std('#9be7ff', { emissive: '#35c4f0', emissiveIntensity: 0.5 });
  for (let i = 0; i <= 8; i++) {
    const p = local(isl, 11.5 + 1.9 * i, 3.0);
    const y = TOP + 0.3 + 0.32 * i;
    const size = i === 8 ? 2.4 : 1.3;
    const hidden = i >= 5 && i <= 7;
    const g = new THREE.Group();
    const top = new THREE.Mesh(new THREE.BoxGeometry(size, 0.3, size), hidden ? glowMat : stoneMat);
    top.position.set(0, y - 0.15, 0);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, y - SEABED, 8), stoneMat);
    pillar.position.set(0, (y + SEABED) / 2 - 0.3, 0);
    g.add(top, pillar);
    g.position.set(p.x, 0, p.z);
    g.rotation.y = -rot;
    g.visible = !hidden;
    g.traverse((o) => o.isMesh && (o.castShadow = true));
    api.group.add(g);
    ctx.physics.addBox(p.x, p.z, size / 2, size / 2, rot, SEABED, y, { walkable: true });
    ctx.reserve(p.x, p.z, 1.6);
    stones.push({ p, y, g, hidden, half: size / 2 });
  }
  const last = stones[8];
  const trophy = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), std('#ffd23f', { emissive: '#ff9f1a', emissiveIntensity: 0.8, metalness: 0.4 }));
  trophy.position.set(last.p.x, last.y + 1.1, last.p.z);
  api.group.add(trophy);
  const board = api.board(api.LP(9.2, 6.4), 2.4, 1.1, 2.0);
  const draw = () =>
    board.userData.redraw({ eyebrow: '⭐ ' + L(CHALLENGES.s9.title), title: '👀 5 + ❓ 3 + 🏆', titleSize: 44, body: L({ en: 'Follow the pattern!', ro: 'Urmează tiparul!' }), bodySize: 28, accent: '#f2464b' });
  ctx.onLang(draw);
  draw();
  ctx.onUpdate((dt, time, p) => {
    trophy.rotation.y += dt * 2;
    trophy.position.y = last.y + 1.1 + Math.sin(time * 2) * 0.1;
    for (const s of stones) {
      const on = Math.abs(p.x - s.p.x) < s.half + 0.2 && Math.abs(p.z - s.p.z) < s.half + 0.2 && Math.abs(p.y - s.y) < 0.12;
      if (!on) continue;
      if (s.hidden && !s.g.visible) {
        s.g.visible = true;
        sfx('pop');
        ctx.particles.emit({ x: s.p.x, y: s.y + 0.2, z: s.p.z, count: 25, colors: ['#9be7ff', '#ffffff'], up: 2, spread: 1.5, size: 0.18 });
      }
      if (s === last) api.done();
    }
  });
  return { post: api.LP(9.9, 4.4) };
}

// ---------- 10. Group them yourself ----------
function c10(api, ctx) {
  const rings = CH_DIPS[9].map(([a, b, r]) => {
    const p = api.Q(a, b);
    api.ring(p, r, '#ffffff', 0.08);
    return { p, r };
  });
  const SIZES = [
    { r: 0.15, mass: 0.25 },
    { r: 0.26, mass: 0.6 },
    { r: 0.38, mass: 1.4 },
  ];
  const starts = [
    [-0.8, 0.3, 0],
    [0.9, 0.2, 1],
    [-3.4, -1.2, 2],
    [3.4, -1.2, 0],
    [-0.6, 2.9, 1],
    [0.8, -3.3, 2],
  ];
  const balls = starts.map(([a, b, s]) => {
    const p = api.Q(a, b);
    const ball = makeBallSpec(ctx.physics, ctx.scene, { ...SIZES[s], restitution: 0.55, rollResist: 0.08, type: 'plain' }, p.x, p.y + 0.5, p.z, '#eef1f8');
    ball.sizeClass = s;
    return ball;
  });
  const board = api.board(api.Q(0, 3.9), 2.6, 1.1, 2.0);
  let lastN = -1;
  const draw = (n) =>
    board.userData.redraw({
      eyebrow: '⭐ ' + L(CHALLENGES.s10.title),
      accent: '#00b3d6',
      title: `⚪ ${n} / 6`,
      titleSize: 50,
      body: L({ en: 'Similar balls together, one group per circle', ro: 'Mingile asemănătoare împreună, un grup în fiecare cerc' }),
      bodySize: 25,
    });
  let acc = 0;
  ctx.onUpdate((dt) => {
    acc += dt;
    if (acc < 0.5) return;
    acc = 0;
    const where = balls.map((b) => rings.findIndex((rg) => flat(b.pos, rg.p) < rg.r - 0.05 && slow(b)));
    const n = where.filter((w) => w >= 0).length;
    if (n !== lastN) {
      lastN = n;
      draw(n);
    }
    if (n < 6) return;
    const pure = rings.every((_, ri) => new Set(balls.filter((_, bi) => where[bi] === ri).map((b) => b.sizeClass)).size <= 1);
    if (pure) api.done();
  });
  ctx.onLang(() => draw(Math.max(0, lastN)));
  draw(0);
  return { post: api.Q(-4.4, -2.2), reset: () => balls.forEach((b) => b.reset()) };
}

// ---------- 11. You are the agent ----------
function c11(api, ctx) {
  const isl = api.isl;
  const lp = api.LP(10.2, 5.4);
  const aim = { x: isl.radial.x, z: isl.radial.z };
  const ANGLE = (40 * Math.PI) / 180;
  const DIST = 14;
  const launcher = new THREE.Group();
  launcher.position.set(lp.x, lp.y, lp.z);
  launcher.rotation.y = Math.atan2(aim.x, aim.z);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, 0.5, 16), std('#3b4a7a'));
  base.position.y = 0.25;
  const pivot = new THREE.Group();
  pivot.position.y = 0.9;
  pivot.rotation.x = -(Math.PI / 2 - ANGLE);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 1.6, 16), std('#ff8a1f', { metalness: 0.3 }));
  barrel.position.y = 0.7;
  pivot.add(barrel);
  launcher.add(base, pivot);
  launcher.traverse((o) => o.isMesh && (o.castShadow = true));
  api.group.add(launcher);
  ctx.physics.addCircle(lp.x, lp.z, 0.9, lp.y - 1, lp.y + 2);
  ctx.reserve(lp.x, lp.z, 2.2);
  const target = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.18, 10, 28), std('#2a9df4', { emissive: '#2a9df4', emissiveIntensity: 0.3 }));
  ring.rotation.x = Math.PI / 2;
  const flagM = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.9, 8), std('#ffffff'));
  flagM.position.y = 0.6;
  target.add(ring, flagM);
  target.position.set(lp.x + aim.x * DIST, 0.05, lp.z + aim.z * DIST);
  api.group.add(target);
  let power = 8;
  let tries = 0;
  let lastMiss = null;
  let flying = false;
  let hit = false;
  const board = api.board(api.LP(8.2, 8.0), 2.6, 1.3, 2.1);
  const draw = () =>
    board.userData.redraw({
      eyebrow: '⭐ ' + L(CHALLENGES.s11.title),
      accent: '#ff8a1f',
      title: `⚡ ${power.toFixed(1)} m/s   🎯 ${tries}`,
      titleSize: 42,
      body: hit
        ? L({ en: `HIT in ${tries} tries! 🎉`, ro: `LOVIT din ${tries} încercări! 🎉` })
        : lastMiss === null
          ? L({ en: 'Reward = −(how far you missed)', ro: 'Recompensă = −(cât ai ratat)' })
          : L({ en: `Reward ${(-Math.abs(lastMiss)).toFixed(1)} · ${lastMiss < 0 ? 'too short' : 'too far'}`, ro: `Recompensă ${(-Math.abs(lastMiss)).toFixed(1)} · ${lastMiss < 0 ? 'prea scurt' : 'prea departe'}` }),
      bodySize: 26,
    });
  const shot = makeBall(ctx.physics, ctx.scene, 'cannon', lp.x, -40, lp.z, '#ff8a1f');
  shot.sleeping = true;
  shot.mesh.visible = false;
  const fire = () => {
    if (flying) return;
    flying = true;
    tries++;
    const tip = { x: lp.x + aim.x * Math.cos(ANGLE) * 1.5, y: lp.y + 0.9 + Math.sin(ANGLE) * 1.5, z: lp.z + aim.z * Math.cos(ANGLE) * 1.5 };
    shot.pos.set(tip.x, tip.y, tip.z);
    shot.vel.set(aim.x * Math.cos(ANGLE) * power, Math.sin(ANGLE) * power, aim.z * Math.cos(ANGLE) * power);
    shot.mesh.visible = true;
    shot.wake();
    sfx('launch');
    let landed = false;
    const touch = () => {
      if (landed) return;
      landed = true;
      const d = (shot.pos.x - lp.x) * aim.x + (shot.pos.z - lp.z) * aim.z;
      lastMiss = d - DIST;
      ctx.particles.emit({ x: shot.pos.x, y: 0.1, z: shot.pos.z, count: 18, color: '#e0f7ff', up: 3, spread: 1.5, size: 0.25 });
      sfx(shot.inWater ? 'splash' : 'bounce');
      if (Math.abs(lastMiss) < 1.2) {
        hit = true;
        sfx('win');
        ctx.particles.emit({ x: target.position.x, y: 1, z: target.position.z, count: 60, colors: ['#ffd23f', '#ff8a1f', '#2a9df4'], up: 6, spread: 3, size: 0.3 });
        api.done();
      }
      draw();
      setTimeout(() => {
        shot.mesh.visible = false;
        shot.pos.set(lp.x, -40, lp.z);
        shot.vel.set(0, 0, 0);
        shot.sleeping = true;
        flying = false;
      }, 1800);
    };
    shot.onWater = touch;
    shot.onLand = touch;
  };
  const buttons = [
    { tan: 4.0, e: '▼', label: { en: 'Less power', ro: 'Mai puțină putere' }, color: '#2a9df4', act: () => (power = Math.max(5, power - 0.5)) },
    { tan: 5.4, e: '🚀', label: { en: 'Fire!', ro: 'Lansează!' }, color: '#f2464b', act: fire },
    { tan: 6.8, e: '▲', label: { en: 'More power', ro: 'Mai multă putere' }, color: '#43b05c', act: () => (power = Math.min(20, power + 0.5)) },
  ];
  for (const b of buttons) {
    const p = api.LP(8.3, b.tan);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.9, 12), std('#3b4a7a'));
    col.position.set(p.x, p.y + 0.45, p.z);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16), std(b.color, { emissive: b.color, emissiveIntensity: 0.4 }));
    cap.position.set(p.x, p.y + 0.95, p.z);
    const s = emojiSprite(b.e, 0.45);
    s.position.set(p.x, p.y + 1.45, p.z);
    api.group.add(col, cap, s);
    ctx.physics.addCircle(p.x, p.z, 0.26, p.y - 1, p.y + 1);
    ctx.reserve(p.x, p.z, 1.2);
    ctx.interact({
      x: p.x,
      z: p.z,
      r: 0.85,
      kind: 'challenge',
      label: () => b.e + ' ' + L(b.label) + `  (${power.toFixed(1)} m/s)`,
      action: () => {
        b.act();
        sfx('click');
        draw();
      },
    });
  }
  ctx.onUpdate((dt, time) => {
    target.position.y = 0.05 + Math.sin(time * 1.2) * 0.06;
  });
  ctx.onLang(draw);
  draw();
  return {
    post: api.LP(7.4, 2.4),
    reset() {
      tries = 0;
      lastMiss = null;
      hit = false;
      power = 8;
      draw();
    },
  };
}

// ---------- 12. Walk a sentence ----------
const MODELS = {
  en: {
    words: ['the', 'cat', 'dog', 'sat', 'on', 'mat', '.'],
    next: {
      '^': { the: 1 },
      the: { cat: 0.45, dog: 0.35, mat: 0.2 },
      cat: { sat: 0.7, '.': 0.3 },
      dog: { sat: 0.6, '.': 0.4 },
      sat: { on: 0.9, '.': 0.1 },
      on: { the: 1 },
      mat: { '.': 0.9, on: 0.1 },
    },
  },
  ro: {
    words: ['pisica', 'câinele', 'stă', 'pe', 'covor', 'canapea', '.'],
    next: {
      '^': { pisica: 0.55, câinele: 0.45 },
      pisica: { stă: 0.8, '.': 0.2 },
      câinele: { stă: 0.75, '.': 0.25 },
      stă: { pe: 0.9, '.': 0.1 },
      pe: { covor: 0.6, canapea: 0.4 },
      covor: { '.': 1 },
      canapea: { '.': 1 },
    },
  },
};

function c12(api, ctx) {
  const spots = [[0, 0]];
  for (let k = 0; k < 6; k++) {
    const ang = (k / 6) * Math.PI * 2 + 0.3;
    spots.push([Math.cos(ang) * 2.2, Math.sin(ang) * 2.2]);
  }
  const yaw = Math.atan2(-api.isl.radial.x, -api.isl.radial.z);
  const pads = spots.map(([a, b]) => {
    const p = api.Q(a, b);
    const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.78, 0.1, 24), std('#ffffff', { emissive: '#ffd23f', emissiveIntensity: 0 }));
    disk.position.set(p.x, p.y + 0.05, p.z);
    disk.receiveShadow = true;
    const panel = canvasPanel(1.2, 0.6, 384);
    panel.mesh.rotation.order = 'YXZ';
    panel.mesh.rotation.set(-Math.PI / 2, yaw, 0);
    panel.mesh.position.set(p.x, p.y + 0.11, p.z);
    api.group.add(disk, panel.mesh);
    return { p, disk, panel, word: '' };
  });
  const board = api.board(api.Q(0, 3.9), 3.0, 1.2, 2.0);
  let sentence = [];
  let msg = null;
  let current = null;
  const model = () => MODELS[state.lang === 'ro' ? 'ro' : 'en'];
  const probs = () => model().next[sentence.length ? sentence[sentence.length - 1] : '^'] || {};
  const drawPads = () => {
    const m = model();
    const pr = probs();
    pads.forEach((pad, i) => {
      pad.word = m.words[i];
      const { g, W, H } = pad.panel;
      const p = pr[pad.word] || 0;
      g.fillStyle = p >= 0.2 ? '#fff6c8' : '#dfe3ee';
      g.fillRect(0, 0, W, H);
      g.lineWidth = 10;
      g.strokeStyle = p >= 0.2 ? '#ffb400' : '#9aa3bf';
      g.strokeRect(5, 5, W - 10, H - 10);
      g.fillStyle = '#1d2340';
      g.font = `700 ${pad.word.length > 6 ? 70 : 92}px ${DISPLAY}`;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText(pad.word, W / 2, H / 2 + 4);
      pad.panel.update();
      pad.disk.material.emissiveIntensity = p * 1.4;
      pad.disk.material.color.set(p >= 0.2 ? '#fff6c8' : '#dfe3ee');
    });
  };
  const drawBoard = () =>
    board.userData.redraw({
      eyebrow: '⭐ ' + L(CHALLENGES.s12.title),
      accent: '#ff8a1f',
      title: sentence.length ? sentence.join(' ') : '…',
      titleSize: 42,
      body: msg ? L(msg) : L({ en: 'Step on a glowing word', ro: 'Pășește pe un cuvânt luminos' }),
      bodySize: 26,
    });
  const restart = (m) => {
    sentence = [];
    msg = m || null;
    drawPads();
    drawBoard();
  };
  ctx.onUpdate((dt, time, p) => {
    const pad = pads.find((pd) => flat(p, pd.p) < 0.7 && p.y < pd.p.y + 0.7);
    if (pad === current) return;
    current = pad;
    if (!pad) return;
    const pr = probs()[pad.word] || 0;
    if (pr < 0.2) {
      sfx('bad');
      restart({ en: `"${pad.word}" can't come next there. Start again!`, ro: `„${pad.word}” nu poate urma acolo. Începe din nou!` });
      return;
    }
    sentence.push(pad.word);
    sfx('blip');
    msg = { en: `"${pad.word}" had a ${Math.round(pr * 100)}% chance`, ro: `„${pad.word}” avea o șansă de ${Math.round(pr * 100)}%` };
    if (pad.word === '.') {
      if (sentence.length >= 4) {
        msg = { en: 'A whole sentence! 🎉', ro: 'O propoziție întreagă! 🎉' };
        drawBoard();
        api.done();
        sentence = [];
        drawPads();
        return;
      }
      restart({ en: 'Too short! Use at least 3 words before the period.', ro: 'Prea scurtă! Folosește cel puțin 3 cuvinte înainte de punct.' });
      return;
    }
    drawPads();
    drawBoard();
  });
  ctx.onLang(() => restart());
  restart();
  return { post: api.Q(-4.2, -2.0), reset: () => restart() };
}

// ---------- 13. Balance the data ----------
function c13(api, ctx) {
  const pans = CH_DIPS[12].map(([a, b, r], i) => {
    const p = api.Q(a, b);
    api.ring(p, r, i ? '#6fb7ff' : '#ff8a5c', 0.09);
    const s = emojiSprite(i ? '🐩' : '🐕', 0.8);
    const lp = api.Q(a, b + 1.6);
    s.position.set(lp.x, lp.y + 1.1, lp.z);
    api.group.add(s);
    return { p, r };
  });
  // The scale: a beam that tilts toward the heavier pan (torque = mass × g × arm).
  const sp = api.Q(0, 2.4);
  const stand = new THREE.Group();
  stand.position.set(sp.x, sp.y, sp.z);
  stand.rotation.y = api.face(sp.x, sp.z);
  api.group.add(stand);
  const gold = std('#ffc93c', { metalness: 0.6, roughness: 0.3 });
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 2.4, 10), gold);
  col.position.y = 1.2;
  const beamPivot = new THREE.Group();
  beamPivot.position.y = 2.45;
  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 0.12), gold);
  beamPivot.add(beam);
  const hangers = [-1, 1].map((sx) => {
    const hg = new THREE.Group();
    hg.position.x = sx * 1.5;
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.7, 6), gold);
    rope.position.y = -0.35;
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.3, 0.08, 16), gold);
    pan.position.y = -0.72;
    hg.add(rope, pan);
    beamPivot.add(hg);
    return hg;
  });
  stand.add(col, beamPivot);
  stand.traverse((o) => o.isMesh && (o.castShadow = true));
  ctx.physics.addCircle(sp.x, sp.z, 0.2, sp.y - 1, sp.y + 2.6);
  // Three "big dog" examples already on the left pan, three spare balls to add.
  const left = [-0.35, 0, 0.35].map((o) => {
    const p = { x: pans[0].p.x + api.isl.tangent.x * o, z: pans[0].p.z + api.isl.tangent.z * o };
    return makeBall(ctx.physics, ctx.scene, 'rubber', p.x, pans[0].p.y + 0.5, p.z, '#ff8a5c');
  });
  const spare = [api.Q(-0.7, -1.9), api.Q(0.7, -1.9), api.Q(0, -3.0)].map((p) => makeBall(ctx.physics, ctx.scene, 'rubber', p.x, p.y + 0.4, p.z, '#6fb7ff'));
  const board = api.board(api.Q(3.4, 2.6), 2.4, 1.1, 2.0);
  const massIn = (pan) => ctx.physics.balls.filter((b) => flat(b.pos, pan.p) < pan.r - 0.05 && b.pos.y < pan.p.y + 1).reduce((s, b) => s + b.mass, 0);
  let tilt = 0;
  let mL = 0;
  let mR = 0;
  const draw = () =>
    board.userData.redraw({
      eyebrow: '⭐ ' + L(CHALLENGES.s13.title),
      accent: '#5c7cfa',
      title: `🐕 ${mL.toFixed(1)} kg · 🐩 ${mR.toFixed(1)} kg`,
      titleSize: 40,
      body: Math.abs(mL - mR) < 0.35 && mR >= 1.5 ? L({ en: 'Balanced! ⚖️', ro: 'Echilibrat! ⚖️' }) : L({ en: 'Add examples to the lighter side', ro: 'Adaugă exemple pe partea mai ușoară' }),
      bodySize: 26,
    });
  let acc = 0;
  ctx.onUpdate((dt) => {
    acc += dt;
    if (acc >= 0.4) {
      acc = 0;
      const nl = massIn(pans[0]);
      const nr = massIn(pans[1]);
      if (Math.abs(nl - mL) > 0.01 || Math.abs(nr - mR) > 0.01) {
        mL = nl;
        mR = nr;
        draw();
      }
      if (Math.abs(mL - mR) < 0.35 && mR >= 1.5) api.done();
    }
    const want = Math.max(-0.4, Math.min(0.4, (mL - mR) * 0.2));
    tilt += (want - tilt) * Math.min(1, dt * 2);
    beamPivot.rotation.z = tilt;
    hangers.forEach((hg) => (hg.rotation.z = -tilt));
  });
  ctx.onLang(draw);
  draw();
  return {
    post: api.Q(-4.2, -1.2),
    reset() {
      left.forEach((b) => b.reset());
      spare.forEach((b) => b.reset());
    },
  };
}

const BUILDERS = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13];
