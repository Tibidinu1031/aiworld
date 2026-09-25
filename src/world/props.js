import * as THREE from 'three';
import { local, terrainHeight, lossValley, TOP } from './layout.js';
import { makeBoard, wordTexture } from './labels.js';
import { makeBall } from './balls.js';
import { sfx } from '../audio.js';
import { L, t } from '../i18n.js';
import { state } from '../state.js';

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...extra });
const glowMat = (color) => new THREE.MeshBasicMaterial({ color, toneMapped: false });
const yawTo = (dx, dz) => Math.atan2(dx, dz);

function shadow(obj) {
  obj.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  return obj;
}

// Build the themed landmark of one station island.
export function buildStationProps(isl, ctx) {
  const P = (rad, tan) => {
    const p = local(isl, rad, tan);
    return { x: p.x, z: p.z, y: terrainHeight(p.x, p.z) };
  };
  const faceIn = yawTo(-isl.radial.x, -isl.radial.z);
  const builders = [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13];
  const group = new THREE.Group();
  ctx.scene.add(group);
  builders[isl.idx]({ isl, ctx, P, faceIn, group });
  return group;
}

// ---------- Station 1: rules machine vs learning machine ----------
function s1({ ctx, P, faceIn, group }) {
  const a = P(6.8, -3);
  const rules = new THREE.Group();
  rules.position.set(a.x, a.y, a.z);
  rules.rotation.y = faceIn;
  const box = new THREE.Mesh(new THREE.BoxGeometry(2, 1.8, 1.4), std('#7d8bb0', { metalness: 0.4, roughness: 0.4 }));
  box.position.y = 0.9;
  rules.add(box);
  const gears = [];
  const gearGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.12, 10);
  gearGeo.rotateX(Math.PI / 2);
  for (const [gx, gy, s, c] of [[-0.45, 1.15, 1, '#ffd23f'], [0.3, 0.75, 0.75, '#ff6b3d'], [0.55, 1.35, 0.5, '#43b05c']]) {
    const gm = new THREE.Mesh(gearGeo, std(c, { metalness: 0.5, roughness: 0.3 }));
    gm.scale.setScalar(s);
    gm.position.set(gx, gy, 0.74);
    rules.add(gm);
    gears.push({ m: gm, dir: gears.length % 2 ? -1 : 1, s });
  }
  const rb = makeBoard({ title: '', big: '📜' }, 1.1, 0.8);
  rb.position.set(0, 2.3, 0);
  rules.add(rb);
  group.add(shadow(rules));
  ctx.physics.addBox(a.x, a.z, 1.0, 0.7, -faceIn, a.y - 1, a.y + 1.8, { walkable: true });

  const b = P(6.8, 3);
  const learn = new THREE.Group();
  learn.position.set(b.x, b.y, b.z);
  learn.rotation.y = faceIn;
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.05, 1, 20), std('#3b4a7a', { metalness: 0.3 }));
  ped.position.y = 0.5;
  learn.add(ped);
  const brain = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 1), new THREE.MeshStandardMaterial({ color: '#ff8fd0', emissive: '#ff4d9d', emissiveIntensity: 0.8, flatShading: true }));
  brain.position.y = 1.65;
  learn.add(brain);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.95, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: '#bfefff', transparent: true, opacity: 0.25, roughness: 0.05, depthWrite: false }),
  );
  dome.position.y = 1;
  learn.add(dome);
  const dots = [];
  for (let i = 0; i < 10; i++) {
    const d = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), glowMat(['#ffd23f', '#5ff3ff', '#7bf7c9'][i % 3]));
    learn.add(d);
    dots.push({ m: d, ph: i / 10 });
  }
  const lb = makeBoard({ title: '', big: '🧠' }, 1.1, 0.8);
  lb.position.set(0, 3, 0);
  learn.add(lb);
  group.add(shadow(learn));
  ctx.physics.addCircle(b.x, b.z, 1.05, b.y - 1, b.y + 2);

  ctx.onUpdate((dt, time) => {
    for (const g of gears) g.m.rotation.z += (dt * g.dir * 1.2) / g.s;
    brain.scale.setScalar(1 + Math.sin(time * 3) * 0.06);
    brain.rotation.y += dt * 0.5;
    for (const d of dots) {
      const k = (time * 0.25 + d.ph) % 1;
      const ang = d.ph * Math.PI * 2 + time * 0.8;
      const rr = 2.2 * (1 - k);
      d.m.position.set(Math.cos(ang) * rr, 1.65 + (1 - k) * 1.2, Math.sin(ang) * rr);
      d.m.scale.setScalar(Math.max(0.1, 1 - k * 0.8));
    }
  });
  ctx.sign(P(3.2, -6.2), {
    title: { en: 'Rules or learning?', ro: 'Reguli sau învățare?' },
    text: {
      en: 'The gear machine (📜) follows fixed rules that people wrote, step by step. The glowing brain machine (🧠) learns from examples: watch the little data cubes fly into it! Most modern AI is the learning kind.',
      ro: 'Mașina cu roți dințate (📜) urmează reguli fixe, scrise de oameni, pas cu pas. Mașina cu creier strălucitor (🧠) învață din exemple: uită-te cum zboară cubulețele de date spre ea! Majoritatea IA moderne sunt de felul care învață.',
    },
  });
}

// ---------- Station 2: data factory ----------
function s2({ ctx, P, faceIn, group }) {
  const crateMat = std('#c4884f', { roughness: 0.9 });
  const crateGeo = new THREE.BoxGeometry(1, 0.8, 1);
  const appleGeo = new THREE.SphereGeometry(0.14, 12, 10);
  const appleMat = std('#e53935', { roughness: 0.4 });
  const bananaGeo = new THREE.CapsuleGeometry(0.06, 0.3, 4, 8);
  const bananaMat = std('#ffd54f', { roughness: 0.5 });
  const crates = [
    [8.5, -4, 0, 'a'], [8.5, -2.8, 0, 'b'], [8.5, -3.4, 0.8, 'a'],
    [9.5, 3.4, 0, 'b'], [8.4, 4.2, 0, 'a'],
  ];
  for (const [rad, tan, lift, kind] of crates) {
    const p = P(rad, tan);
    const c = new THREE.Mesh(crateGeo, crateMat);
    c.position.set(p.x, p.y + 0.4 + lift, p.z);
    c.rotation.y = faceIn + (tan * 0.3);
    group.add(shadow(c));
    for (let k = 0; k < 5; k++) {
      const f = new THREE.Mesh(kind === 'a' ? appleGeo : bananaGeo, kind === 'a' ? appleMat : bananaMat);
      f.position.set(p.x + (k % 3) * 0.25 - 0.25, p.y + 0.9 + lift, p.z + Math.floor(k / 3) * 0.3 - 0.15);
      if (kind === 'b') f.rotation.z = Math.PI / 2;
      group.add(f);
    }
    ctx.physics.addBox(p.x, p.z, 0.52, 0.52, -(faceIn + tan * 0.3), p.y + lift - (lift ? 0 : 1), p.y + lift + 0.8, { walkable: true });
  }
  // Conveyor belt feeding a labeling machine.
  const s = P(6, -1.5);
  const e = P(6, 2.2);
  const conv = new THREE.Group();
  conv.position.set((s.x + e.x) / 2, Math.max(s.y, e.y), (s.z + e.z) / 2);
  conv.rotation.y = yawTo(e.x - s.x, e.z - s.z);
  const belt = new THREE.Mesh(new THREE.BoxGeometry(1, 0.15, 4), std('#2b3150'));
  belt.position.y = 0.75;
  conv.add(belt);
  for (const zz of [-1.7, 1.7]) {
    for (const xx of [-0.45, 0.45]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.75, 0.1), std('#7d8bb0'));
      leg.position.set(xx, 0.37, zz);
      conv.add(leg);
    }
  }
  const machine = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 1.2), std('#1fbfa2'));
  machine.position.set(0, 0.8, 2.3);
  conv.add(machine);
  const tag = makeBoard({ title: '', big: '🏷️' }, 1, 0.7);
  tag.position.set(0, 2, 2.3);
  tag.rotation.y = Math.PI;
  conv.add(tag);
  const items = [];
  for (let i = 0; i < 5; i++) {
    const isA = i % 2 === 0;
    const m = new THREE.Mesh(isA ? appleGeo : bananaGeo, isA ? appleMat : bananaMat);
    if (!isA) m.rotation.x = Math.PI / 2;
    conv.add(m);
    items.push({ m, ph: i / 5 });
  }
  group.add(shadow(conv));
  ctx.physics.addBox(conv.position.x, conv.position.z, 0.6, 2.9, -conv.rotation.y, conv.position.y - 1, conv.position.y + 1.6);
  ctx.onUpdate((dt, time) => {
    for (const it of items) {
      const k = (time * 0.15 + it.ph) % 1;
      it.m.position.set(0, 0.95, -1.9 + k * 3.8);
      it.m.visible = k < 0.95;
    }
  });
  ctx.sign(P(3.2, -6.2), {
    title: { en: 'The data factory', ro: 'Fabrica de date' },
    text: {
      en: 'Each fruit on the belt gets a label (apple or banana) and becomes one example in a dataset. AI learns from thousands of labeled examples like these. Tip: you can jump onto the crates!',
      ro: 'Fiecare fruct de pe bandă primește o etichetă (măr sau banană) și devine un exemplu dintr-un set de date. IA învață din mii de exemple etichetate ca acestea. Sfat: poți sări pe lăzi!',
    },
  });
}

// ---------- Station 3: a 3D feature space ----------
function s3({ ctx, P, faceIn, group }) {
  const o = P(6.5, -2.5);
  const g = new THREE.Group();
  g.position.set(o.x, o.y, o.z);
  g.rotation.y = faceIn + Math.PI / 4;
  const axis = (dir, color, label) => {
    const len = 4.2;
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, len, 8), std(color, { emissive: color, emissiveIntensity: 0.3 }));
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.4, 10), std(color));
    if (dir === 'x') {
      m.rotation.z = -Math.PI / 2;
      m.position.set(len / 2, 0.15, 0);
      cone.rotation.z = -Math.PI / 2;
      cone.position.set(len, 0.15, 0);
    } else if (dir === 'y') {
      m.position.set(0, len / 2 + 0.15, 0);
      cone.position.set(0, len + 0.15, 0);
    } else {
      m.rotation.x = Math.PI / 2;
      m.position.set(0, 0.15, len / 2);
      cone.rotation.x = Math.PI / 2;
      cone.position.set(0, 0.15, len);
    }
    g.add(m, cone);
    const b = makeBoard({ title: '', big: label, bigSize: 170 }, 0.7, 0.55);
    b.position.copy(cone.position).multiplyScalar(1.08);
    b.position.y += 0.45;
    g.add(b);
    return b;
  };
  axis('x', '#f2464b', '⚖️');
  axis('y', '#43b05c', '📏');
  axis('z', '#2a9df4', '🎨');
  const balls = [];
  const geo = new THREE.SphereGeometry(0.17, 14, 10);
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 26; i++) {
    const apple = i % 2 === 0;
    const m = new THREE.Mesh(geo, std(apple ? '#e53935' : '#ffd54f', { roughness: 0.3 }));
    const base = apple ? [2.8, 1.2, 3.1] : [1.2, 3.1, 0.9];
    m.position.set(base[0] + (rnd() - 0.5) * 1.2, base[1] + (rnd() - 0.5) * 1.1 + 0.15, base[2] + (rnd() - 0.5) * 1.2);
    g.add(m);
    balls.push({ m, y: m.position.y, ph: rnd() * 6 });
  }
  group.add(shadow(g));
  ctx.physics.addCircle(o.x, o.z, 0.3, o.y - 1, o.y + 4.5);
  ctx.onUpdate((dt, time) => {
    for (const b of balls) b.m.position.y = b.y + Math.sin(time * 1.5 + b.ph) * 0.05;
  });
  ctx.sign(P(3.2, -6.2), {
    title: { en: 'A 3D feature space', ro: 'Un spațiu 3D al trăsăturilor' },
    text: {
      en: 'Every ball is one fruit. Its place shows 3 features: weight ⚖️ (red axis), length 📏 (green axis) and redness 🎨 (blue axis). Apples (red) and bananas (yellow) end up in different corners, so an AI can tell them apart.',
      ro: 'Fiecare bilă este un fruct. Locul ei arată 3 trăsături: greutatea ⚖️ (axa roșie), lungimea 📏 (axa verde) și cât de roșu este 🎨 (axa albastră). Merele (roșii) și bananele (galbene) ajung în colțuri diferite, așa că o IA le poate deosebi.',
    },
  });
}

// ---------- Station 4: nearest neighbors on a floor grid ----------
function s4({ ctx, P, faceIn, group }) {
  const c = P(6.8, 0);
  const g = new THREE.Group();
  g.position.set(c.x, c.y, c.z);
  g.rotation.y = faceIn;
  const floorTex = (() => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const x = cv.getContext('2d');
    x.fillStyle = '#e9eefc';
    x.fillRect(0, 0, 256, 256);
    x.strokeStyle = '#b5c0e0';
    x.lineWidth = 3;
    for (let i = 0; i <= 8; i++) {
      x.beginPath();
      x.moveTo(i * 32, 0);
      x.lineTo(i * 32, 256);
      x.moveTo(0, i * 32);
      x.lineTo(256, i * 32);
      x.stroke();
    }
    const tx = new THREE.CanvasTexture(cv);
    tx.colorSpace = THREE.SRGBColorSpace;
    return tx;
  })();
  const floor = new THREE.Mesh(new THREE.BoxGeometry(8, 0.2, 8), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.8 }));
  floor.position.y = 0.1;
  g.add(floor);
  const pts = [
    [-2.8, -2.4, 0], [-2, -3.1, 0], [-3.1, -1.2, 0], [-1.5, -1.8, 0], [-2.4, -0.2, 0], [-0.9, -2.9, 0],
    [2.6, 2.2, 1], [1.8, 3, 1], [3, 1, 1], [1.2, 1.6, 1], [2.2, 0.2, 1], [0.6, 2.8, 1],
  ];
  const cols = ['#f2464b', '#2a9df4'];
  const pgeo = new THREE.CylinderGeometry(0.22, 0.22, 1, 14);
  for (const [x, z, k] of pts) {
    const h = 0.6 + ((x * 7 + z * 3) % 1 + 1) % 1 * 0.8;
    const m = new THREE.Mesh(pgeo, std(cols[k], { roughness: 0.35 }));
    m.scale.y = h;
    m.position.set(x, 0.2 + h / 2, z);
    g.add(m);
    const top = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8), std(cols[k]));
    top.position.set(x, 0.2 + h, z);
    g.add(top);
  }
  const star = [0.2, 0.4];
  const gold = new THREE.Mesh(new THREE.OctahedronGeometry(0.4, 0), new THREE.MeshStandardMaterial({ color: '#ffd23f', emissive: '#ff9f1a', emissiveIntensity: 0.6, metalness: 0.4, roughness: 0.3 }));
  gold.position.set(star[0], 1.6, star[1]);
  g.add(gold);
  const gpost = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 8), std('#ffd23f'));
  gpost.position.set(star[0], 0.9, star[1]);
  g.add(gpost);
  const near = pts
    .map((p) => ({ p, d: Math.hypot(p[0] - star[0], p[1] - star[1]) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 3);
  const beams = [];
  for (const n of near) {
    const a = new THREE.Vector3(star[0], 1.6, star[1]);
    const h = 0.6 + ((n.p[0] * 7 + n.p[1] * 3) % 1 + 1) % 1 * 0.8;
    const b = new THREE.Vector3(n.p[0], 0.2 + h, n.p[1]);
    const len = a.distanceTo(b);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 6), glowMat(cols[n.p[2]]));
    beam.position.copy(a).add(b).multiplyScalar(0.5);
    beam.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
    g.add(beam);
    beams.push(beam);
  }
  group.add(shadow(g));
  ctx.physics.addBox(c.x, c.z, 4, 4, -faceIn, c.y - 1, c.y + 0.2, { walkable: true });
  ctx.onUpdate((dt, time) => {
    gold.rotation.y += dt;
    gold.position.y = 1.6 + Math.sin(time * 2) * 0.1;
    beams.forEach((b, i) => (b.material.opacity = 1, b.scale.x = b.scale.z = 1 + Math.sin(time * 4 + i) * 0.3));
  });
  ctx.sign(P(2.6, -5.8), {
    title: { en: 'Ask the neighbors', ro: 'Întreabă vecinii' },
    text: {
      en: 'The golden gem is a new, unknown example. Glowing lines connect it to its 3 nearest neighbors. Count the colors: the majority wins! Walk onto the grid and look closely.',
      ro: 'Diamantul auriu este un exemplu nou, necunoscut. Liniile luminoase îl leagă de cei mai apropiați 3 vecini. Numără culorile: câștigă majoritatea! Urcă pe grilă și uită-te de aproape.',
    },
  });
}

// ---------- Station 5: the Loss Valley ----------
function s5({ isl, ctx, P, group }) {
  const rim = { x: lossValley.x - isl.tangent.x * 5.2, z: lossValley.z - isl.tangent.z * 5.2 };
  const rimY = terrainHeight(rim.x, rim.z);
  const disp = new THREE.Group();
  disp.position.set(rim.x - isl.tangent.x * 0.9, rimY, rim.z - isl.tangent.z * 0.9);
  disp.rotation.y = yawTo(isl.tangent.x, isl.tangent.z);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 2.2, 10), std('#7d8bb0'));
  post.position.y = 1.1;
  const hopper = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.35, 0.9, 16, 1, true), std('#2a9df4', { side: THREE.DoubleSide }));
  hopper.position.y = 2.5;
  const chute = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.4, 12, 1, true), std('#ffd23f', { side: THREE.DoubleSide }));
  chute.rotation.x = Math.PI / 2.6;
  chute.position.set(0, 1.9, 0.6);
  disp.add(post, hopper, chute);
  group.add(shadow(disp));
  ctx.physics.addCircle(disp.position.x, disp.position.z, 0.5, rimY - 1, rimY + 3);

  const balls = [];
  const colors = ['#ff6b3d', '#ffd23f', '#43b05c', '#2a9df4', '#b44dff', '#ff4d9d'];
  for (let i = 0; i < 3; i++) {
    balls.push(makeBall(ctx.physics, ctx.scene, 'rubber', lossValley.x + i * 0.6 - 0.6, TOP, lossValley.z, colors[i]));
  }
  let next = 0;
  ctx.interact({
    x: disp.position.x,
    z: disp.position.z,
    y: rimY,
    r: 2.6,
    label: () => t('promptDispenser'),
    action: () => {
      sfx('launch');
      for (let k = 0; k < 3; k++) {
        let b;
        if (balls.length < 9) {
          b = makeBall(ctx.physics, ctx.scene, 'rubber', rim.x, rimY + 1.2, rim.z, colors[balls.length % colors.length]);
          balls.push(b);
        } else {
          b = balls[next % balls.length];
          next++;
        }
        const off = (k - 1) * 0.9;
        b.pos.set(rim.x + isl.radial.x * off, rimY + 1 + k * 0.3, rim.z + isl.radial.z * off);
        b.vel.set(isl.tangent.x * (1.2 + k * 0.5), 0, isl.tangent.z * (1.2 + k * 0.5));
        b.wake();
      }
    },
  });
  ctx.sign(P(1.4, -5.8), {
    title: { en: 'The Loss Valley', ro: 'Valea Erorii' },
    text: {
      en: 'Here the height of the ground is the error (the "loss"). Red = big error, blue = small error. Release balls at the yellow dispenser: gravity pulls them down to the lowest point. AI training also walks downhill, just with math. See the small dip on the side? A ball can get stuck there. That is a "local minimum"!',
      ro: 'Aici înălțimea terenului este eroarea (numită „loss”). Roșu = eroare mare, albastru = eroare mică. Dă drumul bilelor de la dozatorul galben: gravitația le trage spre cel mai jos punct. Și antrenarea IA coboară dealul, doar că folosește matematică. Vezi gropița de pe margine? O bilă poate rămâne blocată acolo. Acesta este un „minim local”!',
    },
  });
}

// ---------- Station 6: a giant neuron ----------
function s6({ ctx, P, faceIn, group }) {
  const c = P(7, 0);
  const g = new THREE.Group();
  g.position.set(c.x, c.y, c.z);
  g.rotation.y = faceIn + Math.PI / 2;
  const cellMat = new THREE.MeshStandardMaterial({ color: '#b39dff', emissive: '#7b5cff', emissiveIntensity: 0.35, roughness: 0.5, flatShading: true });
  const soma = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1), cellMat);
  soma.position.set(0, 1.8, 0);
  g.add(soma);
  const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 12), glowMat('#ffd23f'));
  nucleus.position.copy(soma.position);
  nucleus.position.z += 0.8;
  g.add(nucleus);
  const branchMat = new THREE.MeshStandardMaterial({ color: '#9f86ff', roughness: 0.6 });
  const curves = [];
  const dends = [
    [-3.2, 3.4, 1.2], [-3.5, 1.4, -1.5], [-2.6, 0.4, 2.2], [-1.2, 3.8, -2], [-2.4, 3.0, -0.2],
  ];
  for (const [x, y, z] of dends) {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, y, z),
      new THREE.Vector3(x * 0.6, (y + 1.8) / 2 + 0.3, z * 0.6),
      new THREE.Vector3(-0.8, 1.8, z * 0.1),
    ]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.1, 6), branchMat));
    curves.push(curve);
  }
  const axon = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.9, 1.8, 0),
    new THREE.Vector3(2.4, 2.2, 0.3),
    new THREE.Vector3(3.8, 1.4, -0.2),
    new THREE.Vector3(4.6, 0.9, 0),
  ]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(axon, 30, 0.16, 8), new THREE.MeshStandardMaterial({ color: '#ffd23f', roughness: 0.4 })));
  for (const [dx, dy, dz] of [[0.5, 0.3, 0.4], [0.5, -0.4, -0.3], [0.6, 0.1, -0.6]]) {
    const term = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 8), glowMat('#ff8a1f'));
    term.position.set(4.6 + dx, 0.9 + dy, dz);
    g.add(term);
  }
  const pulses = [];
  const pulseGeo = new THREE.SphereGeometry(0.16, 10, 8);
  for (let i = 0; i < curves.length; i++) {
    const m = new THREE.Mesh(pulseGeo, glowMat('#5ff3ff'));
    g.add(m);
    pulses.push({ m, c: curves[i], ph: i * 0.19 });
  }
  const ap = new THREE.Mesh(new THREE.SphereGeometry(0.26, 12, 10), glowMat('#ffffff'));
  g.add(ap);
  group.add(shadow(g));
  ctx.physics.addCircle(c.x, c.z, 1.2, c.y - 1, c.y + 3);
  ctx.onUpdate((dt, time) => {
    const cycle = time % 3;
    for (const p of pulses) {
      const k = Math.min(1, Math.max(0, (cycle - p.ph) / 1.2));
      p.m.position.copy(p.c.getPoint(k));
      p.m.visible = k > 0 && k < 1;
    }
    const fire = cycle > 1.9 && cycle < 2.2;
    cellMat.emissiveIntensity = fire ? 1.4 : 0.35;
    const k = Math.min(1, Math.max(0, (cycle - 2) / 0.9));
    ap.position.copy(axon.getPoint(k));
    ap.visible = cycle > 2 && cycle < 2.9;
  });
  ctx.sign(P(2.6, -5.8), {
    title: { en: 'A giant neuron', ro: 'Un neuron uriaș' },
    text: {
      en: 'Blue signals travel along the branches (dendrites) into the cell body. When enough signal arrives, the neuron "fires": it glows and sends a white pulse down the long yellow axon to other neurons. Artificial neurons copy this idea with math.',
      ro: 'Semnalele albastre călătoresc pe ramuri (dendrite) spre corpul celulei. Când ajunge destul semnal, neuronul „se aprinde”: strălucește și trimite un impuls alb pe axonul lung și galben spre alți neuroni. Neuronii artificiali copiază această idee folosind matematică.',
    },
  });
}

// ---------- Station 7: a layered network ----------
function s7({ ctx, P, faceIn, group }) {
  const c = P(7.2, 0);
  const g = new THREE.Group();
  g.position.set(c.x, c.y, c.z);
  g.rotation.y = faceIn;
  const layers = [3, 4, 4, 2];
  const nodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.28, 16, 12);
  const colors = ['#5ff3ff', '#b44dff', '#b44dff', '#ffd23f'];
  layers.forEach((n, li) => {
    const x = (li - 1.5) * 2.2;
    const col = [];
    for (let k = 0; k < n; k++) {
      const y = 1.4 + (k - (n - 1) / 2) * 0.9 + 1.2;
      const m = new THREE.Mesh(nodeGeo, new THREE.MeshStandardMaterial({ color: colors[li], emissive: colors[li], emissiveIntensity: 0.3 }));
      m.position.set(x, y, 0);
      g.add(m);
      col.push(m);
    }
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.4 + 0.2, 8), std('#3b4a7a'));
    post.position.set(x, 0.7, 0);
    g.add(post);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.1, (n - 1) * 0.9 + 0.3, 0.1), std('#3b4a7a'));
    bar.position.set(x, 2.6, -0.15);
    g.add(bar);
    nodes.push(col);
  });
  const edges = [];
  const lineGeo = new THREE.BufferGeometry();
  const verts = [];
  for (let li = 0; li < nodes.length - 1; li++) {
    for (const a of nodes[li]) {
      for (const b of nodes[li + 1]) {
        verts.push(a.position.x, a.position.y, a.position.z, b.position.x, b.position.y, b.position.z);
        edges.push({ a: a.position, b: b.position, li });
      }
    }
  }
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  g.add(new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ color: '#8fa3d9', transparent: true, opacity: 0.8 })));
  const pulses = [];
  const pg = new THREE.SphereGeometry(0.09, 8, 6);
  for (let i = 0; i < 24; i++) {
    const m = new THREE.Mesh(pg, glowMat('#ffffff'));
    g.add(m);
    pulses.push({ m, e: edges[(i * 7) % edges.length], ph: Math.random() });
  }
  group.add(shadow(g));
  ctx.physics.addBox(c.x, c.z, 3.6, 0.3, -faceIn, c.y - 1, c.y + 1.2);
  ctx.onUpdate((dt, time) => {
    const phase = (time * 0.7) % 3;
    for (const p of pulses) {
      const local = phase - p.e.li;
      const k = Math.min(1, Math.max(0, local));
      p.m.position.lerpVectors(p.e.a, p.e.b, k);
      p.m.visible = local > 0 && local < 1;
    }
    nodes.forEach((col, li) => {
      const on = Math.max(0, 1 - Math.abs(phase - li) * 1.5);
      col.forEach((m) => (m.material.emissiveIntensity = 0.3 + on * 1.3));
    });
  });
  ctx.sign(P(2.6, -5.8), {
    title: { en: 'A neural network', ro: 'O rețea neuronală' },
    text: {
      en: 'Four layers of neurons: input (blue), two hidden layers (purple) and output (yellow). Every neuron is connected to all neurons in the next layer. Watch the signals flow forward, layer by layer, until the output lights up with an answer.',
      ro: 'Patru straturi de neuroni: intrare (albastru), două straturi ascunse (mov) și ieșire (galben). Fiecare neuron este legat de toți neuronii din stratul următor. Privește cum curg semnalele înainte, strat cu strat, până când ieșirea se aprinde cu un răspuns.',
    },
  });
}

// ---------- Station 8: pixel wall + edge filter wall ----------
function s8({ ctx, P, faceIn, group }) {
  const N = 12;
  // A cat face drawn in 12x12 brightness values (0 dark .. 1 bright).
  const img = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const cx = x - 5.5;
      const cy = y - 6.2;
      let v = 0.12;
      const face = cx * cx / 26 + cy * cy / 20 < 1;
      const earL = y < 4 && x >= 1 && x <= 4 && y > 4 - (x - 0) && y > x - 4 - 0;
      const earR = y < 4 && x >= 7 && x <= 10 && y > 4 - (11 - x) && y > (11 - x) - 4;
      if (face || earL || earR) v = 0.95;
      if ((x === 3 || x === 8) && (y === 5 || y === 6)) v = 0.1;
      if (y === 8 && (x === 5 || x === 6)) v = 0.35;
      if (y === 9 && (x === 4 || x === 7)) v = 0.35;
      img.push(v);
    }
  }
  const at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 0.12 : img[y * N + x]);
  const edge = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const gx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
      const gy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
      edge.push(Math.min(1, Math.hypot(gx, gy) / 2.5));
    }
  }
  const s = 0.32;
  const box = new THREE.BoxGeometry(s * 0.92, s * 0.92, 0.3);
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
  const col = new THREE.Color();
  const m4 = new THREE.Matrix4();
  const walls = [[-2.3, img, false], [2.3, edge, true]];
  for (const [off, data, isEdge] of walls) {
    const p = P(8, off);
    const wall = new THREE.Group();
    wall.position.set(p.x, p.y, p.z);
    wall.rotation.y = faceIn;
    const im = new THREE.InstancedMesh(box, mat, N * N);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const v = data[y * N + x];
        m4.makeTranslation((x - (N - 1) / 2) * s, 0.6 + (N - 1 - y) * s, 0);
        im.setMatrixAt(y * N + x, m4);
        if (isEdge) im.setColorAt(y * N + x, col.setRGB(0.05 + v * 0.3, 0.08 + v * 0.9, 0.15 + v * 0.95));
        else im.setColorAt(y * N + x, col.setRGB(v, v * 0.95, v * 0.85));
      }
    }
    wall.add(im);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(N * s + 0.3, N * s + 0.3, 0.2), std('#2b3150'));
    frame.position.set(0, 0.6 + ((N - 1) * s) / 2, -0.2);
    wall.add(frame);
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.8, 0.2), std('#2b3150'));
    leg.position.set(0, 0.3, -0.2);
    wall.add(leg);
    group.add(shadow(wall));
    ctx.physics.addBox(p.x, p.z, 2.1, 0.3, -faceIn, p.y - 1, p.y + 4.6);
  }
  const arrow = makeBoard({ title: '', big: '➜', bigSize: 200, bigOffset: 10 }, 0.9, 0.6);
  const ap = P(7.6, 0);
  arrow.position.set(ap.x, ap.y + 2.5, ap.z);
  arrow.rotation.y = faceIn;
  group.add(arrow);
  ctx.sign(P(2.6, -5.8), {
    title: { en: 'Pixels and filters', ro: 'Pixeli și filtre' },
    text: {
      en: 'The left wall is a picture of a cat made of 144 pixels (12 × 12). Each block is one number: bright or dark. The right wall is the same picture after an edge filter: it lights up where brightness changes quickly. That is how vision AIs find outlines!',
      ro: 'Peretele din stânga este poza unei pisici din 144 de pixeli (12 × 12). Fiecare bloc este un număr: luminos sau întunecat. Peretele din dreapta este aceeași poză după un filtru de margini: se aprinde acolo unde luminozitatea se schimbă brusc. Așa găsesc IA de vedere contururile!',
    },
  });
}

// ---------- Station 9: overfit curve vs smooth curve ----------
function s9({ ctx, P, faceIn, group }) {
  const c = P(7.4, 0);
  const g = new THREE.Group();
  g.position.set(c.x, c.y, c.z);
  g.rotation.y = faceIn;
  const xs = [-3.2, -2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4, 3.2];
  const noise = [0.25, -0.3, 0.35, -0.2, 0.3, -0.35, 0.2, -0.25, 0.3];
  const trueF = (x) => 1.8 + 0.35 * x + 0.12 * x * x * 0.5;
  const ys = xs.map((x, i) => trueF(x) + noise[i]);
  const dotGeo = new THREE.SphereGeometry(0.16, 12, 8);
  xs.forEach((x, i) => {
    const d = new THREE.Mesh(dotGeo, std('#1d2340'));
    d.position.set(x, ys[i], 0);
    g.add(d);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, ys[i], 6), std('#8a94b8'));
    post.position.set(x, ys[i] / 2, 0);
    g.add(post);
  });
  const smooth = [];
  const wild = [];
  for (let i = 0; i <= 80; i++) {
    const x = -3.4 + (6.8 * i) / 80;
    smooth.push(new THREE.Vector3(x, trueF(x), 0.25));
    // Lagrange interpolation through all points: the overfit curve.
    let y = 0;
    for (let a = 0; a < xs.length; a++) {
      let l = 1;
      for (let b = 0; b < xs.length; b++) if (a !== b) l *= (x - xs[b]) / (xs[a] - xs[b]);
      y += ys[a] * l;
    }
    wild.push(new THREE.Vector3(x, Math.max(0.2, Math.min(4.6, y)), -0.25));
  }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(smooth), 80, 0.07, 6), std('#43b05c', { emissive: '#43b05c', emissiveIntensity: 0.4 })));
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wild), 160, 0.07, 6), std('#f2464b', { emissive: '#f2464b', emissiveIntensity: 0.4 })));
  group.add(shadow(g));
  ctx.physics.addBox(c.x, c.z, 3.4, 0.4, -faceIn, c.y - 1, c.y + 1);
  ctx.sign(P(2.6, -5.8), {
    title: { en: 'Two curves, same dots', ro: 'Două curbe, aceleași puncte' },
    text: {
      en: 'The calm green curve follows the general trend of the dots. The wild red curve touches every single dot, but it swings like crazy between them. For a new dot, the green curve guesses much better. The red one is overfitting: it memorized instead of understanding.',
      ro: 'Curba verde, liniștită, urmează direcția generală a punctelor. Curba roșie, sălbatică, atinge fiecare punct, dar se zbânțuie nebunește între ele. Pentru un punct nou, curba verde ghicește mult mai bine. Cea roșie face supra-învățare: a memorat în loc să înțeleagă.',
    },
  });
}

// ---------- Station 10: clusters of physical balls ----------
function s10({ isl, ctx, P, faceIn, group }) {
  const centers = [P(8.4, -3), P(6, 1.5), P(9.6, 3.6)];
  const colors = ['#f2464b', '#2a9df4', '#ffd23f'];
  const balls = [];
  centers.forEach((c, k) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.35, 1.55, 32), new THREE.MeshBasicMaterial({ color: colors[k], transparent: true, opacity: 0.8 }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(c.x, c.y + 0.04, c.z);
    group.add(ring);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + k;
      const rr = i === 0 ? 0 : 0.6;
      balls.push(makeBall(ctx.physics, ctx.scene, 'rubber', c.x + Math.cos(a) * rr, c.y + 0.3, c.z + Math.sin(a) * rr, colors[k]));
    }
  });
  const signPos = P(3.2, -6.2);
  ctx.sign(signPos, {
    title: { en: 'Groups without labels', ro: 'Grupuri fără etichete' },
    text: {
      en: 'These balls sit in 3 groups. Nobody wrote labels on them, yet you can see the groups just from where they are. Clustering AI finds groups like this all by itself. Kick them around (F), then use the reset button to put them back.',
      ro: 'Aceste mingi stau în 3 grupuri. Nimeni nu le-a pus etichete, dar vezi grupurile doar după locul în care se află. IA de grupare găsește singură grupuri ca acestea. Lovește-le (F), apoi folosește butonul de resetare ca să le pui la loc.',
    },
  });
  const btn = P(5.2, -4.4);
  const b = new THREE.Group();
  b.position.set(btn.x, btn.y, btn.z);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 0.9, 12), std('#3b4a7a'));
  base.position.y = 0.45;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 16), std('#f2464b', { emissive: '#f2464b', emissiveIntensity: 0.4 }));
  cap.position.y = 0.96;
  b.add(base, cap);
  group.add(shadow(b));
  ctx.physics.addCircle(btn.x, btn.z, 0.35, btn.y - 1, btn.y + 1);
  ctx.interact({
    x: btn.x,
    z: btn.z,
    y: btn.y,
    r: 1.8,
    label: () => t('promptBalls'),
    action: () => {
      sfx('pop');
      balls.forEach((bb) => bb.reset());
    },
  });
  void faceIn;
  void isl;
}

// ---------- Station 11: the AI launcher over the sea ----------
function s11({ isl, ctx, P, group }) {
  const lp = P(10.2, 0);
  const aim = { x: isl.radial.x, z: isl.radial.z };
  const ANGLE = (40 * Math.PI) / 180;
  const launcher = new THREE.Group();
  launcher.position.set(lp.x, lp.y, lp.z);
  launcher.rotation.y = yawTo(aim.x, aim.z);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1, 0.5, 16), std('#3b4a7a'));
  base.position.y = 0.25;
  const pivot = new THREE.Group();
  pivot.position.y = 0.9;
  pivot.rotation.x = -(Math.PI / 2 - ANGLE);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 1.8, 16), std('#43b05c', { metalness: 0.3 }));
  barrel.position.y = 0.8;
  pivot.add(barrel);
  const eye = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), glowMat('#5ff3ff'));
  eye.position.set(0, 0.2, 0.36);
  pivot.add(eye);
  launcher.add(base, pivot);
  group.add(shadow(launcher));
  ctx.physics.addCircle(lp.x, lp.z, 1, lp.y - 1, lp.y + 2);

  // Floating target in the sea.
  let targetDist = 15;
  const target = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.18, 10, 28), std('#f2464b', { emissive: '#f2464b', emissiveIntensity: 0.3 }));
  ring.rotation.x = Math.PI / 2;
  const inner = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.12, 8, 24), std('#ffffff'));
  inner.rotation.x = Math.PI / 2;
  const flag = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.9, 8), std('#ffd23f'));
  flag.position.y = 0.6;
  target.add(ring, inner, flag);
  group.add(shadow(target));
  const placeTarget = () => {
    target.position.set(lp.x + aim.x * targetDist, 0.05, lp.z + aim.z * targetDist);
  };
  placeTarget();

  const board = makeBoard({ eyebrow: t('promptLauncher'), title: '—' }, 2.6, 1.3);
  const bp = P(8.4, -3.2);
  board.position.set(bp.x, bp.y + 2.4, bp.z);
  board.rotation.y = yawTo(-isl.radial.x + isl.tangent.x * 0.4, -isl.radial.z + isl.tangent.z * 0.4);
  group.add(board);
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.8, 8), std('#7a4f33'));
  post.position.set(bp.x, bp.y + 0.9, bp.z);
  group.add(post);
  ctx.physics.addCircle(bp.x, bp.z, 0.15, bp.y - 1, bp.y + 3);

  const shots = [];
  const ai = { running: false, tries: 0, v: 0, sigma: 2.5, best: null, waiting: false, timer: 0, msg: null };
  if (import.meta.env && import.meta.env.DEV) window.__launcherAI = ai;
  const drawBoard = () => {
    const lines = ai.msg
      ? L(ai.msg)
      : ai.tries
        ? L({ en: `Try ${ai.tries}: ${ai.v.toFixed(1)} m/s`, ro: `Încercarea ${ai.tries}: ${ai.v.toFixed(1)} m/s` })
        : L({ en: 'Press E next to me!', ro: 'Apasă E lângă mine!' });
    board.userData.redraw({ eyebrow: t('promptLauncher'), title: lines, titleSize: 44, accent: '#43b05c' });
  };
  drawBoard();
  ctx.onLang(drawBoard);

  const fire = () => {
    ai.tries++;
    ai.msg = null;
    const tip = { x: lp.x + aim.x * Math.cos(ANGLE) * 1.7, y: lp.y + 0.9 + Math.sin(ANGLE) * 1.7, z: lp.z + aim.z * Math.cos(ANGLE) * 1.7 };
    let b = shots.find((s) => s.done);
    if (!b) {
      b = makeBall(ctx.physics, ctx.scene, 'cannon', tip.x, tip.y, tip.z, '#43b05c');
      shots.push(b);
    }
    b.pos.set(tip.x, tip.y, tip.z);
    b.vel.set(aim.x * Math.cos(ANGLE) * ai.v, Math.sin(ANGLE) * ai.v, aim.z * Math.cos(ANGLE) * ai.v);
    b.done = false;
    b.landed = false;
    b.wake();
    b.mesh.visible = true;
    const onTouch = () => {
      if (b.landed) return;
      b.landed = true;
      const d = (b.pos.x - lp.x) * aim.x + (b.pos.z - lp.z) * aim.z;
      const err = d - targetDist;
      ctx.particles.emit({ x: b.pos.x, y: 0.1, z: b.pos.z, count: 18, color: '#e0f7ff', up: 3, spread: 1.5, size: 0.25 });
      sfx(b.inWater ? 'splash' : 'bounce');
      learn(err);
      setTimeout(() => {
        b.done = true;
        b.mesh.visible = false;
        b.pos.set(0, -50, 0);
        b.vel.set(0, 0, 0);
        b.sleeping = true;
      }, 2500);
    };
    b.onWater = onTouch;
    b.onLand = onTouch;
    sfx('launch');
    ctx.particles.emit({ x: tip.x, y: tip.y, z: tip.z, count: 12, colors: ['#ffffff', '#cfd8dc'], up: 1, spread: 1, size: 0.3, gravity: 0.1 });
    drawBoard();
  };

  const learn = (err) => {
    // Reward = -|error|. Keep the best try, then explore around it with shrinking steps.
    if (!ai.best || Math.abs(err) < Math.abs(ai.best.err)) ai.best = { v: ai.v, err };
    if (Math.abs(err) < 1.1) {
      ai.msg = { en: `HIT in ${ai.tries} tries! 🎯`, ro: `LOVIT din ${ai.tries} încercări! 🎯` };
      ai.running = false;
      sfx('win');
      ctx.particles.emit({ x: target.position.x, y: 1, z: target.position.z, count: 60, colors: ['#ffd23f', '#ff6b3d', '#43b05c', '#2a9df4'], up: 6, spread: 3, size: 0.3 });
      drawBoard();
      return;
    }
    ai.msg = {
      en: err < 0 ? `Too short by ${(-err).toFixed(1)} m → more power` : `Too far by ${err.toFixed(1)} m → less power`,
      ro: err < 0 ? `Prea scurt cu ${(-err).toFixed(1)} m → mai multă putere` : `Prea departe cu ${err.toFixed(1)} m → mai puțină putere`,
    };
    drawBoard();
    const noise = (Math.random() - 0.5) * ai.sigma;
    ai.v = Math.max(4, Math.min(22, ai.best.v - ai.best.err * 0.22 + noise));
    ai.sigma *= 0.75;
    if (ai.tries >= 14) {
      ai.running = false;
      return;
    }
    ai.waiting = true;
    ai.timer = 1.6;
  };

  ctx.interact({
    x: lp.x,
    z: lp.z,
    y: lp.y,
    r: 3,
    label: () => t('promptLauncher'),
    enabled: () => !ai.running,
    action: () => {
      if (ai.tries > 0) {
        targetDist = 11 + Math.random() * 9;
        placeTarget();
      }
      ai.running = true;
      ai.tries = 0;
      ai.best = null;
      ai.sigma = 2.5;
      ai.v = 6 + Math.random() * 3;
      fire();
    },
  });
  ctx.onUpdate((dt, time) => {
    target.position.y = 0.05 + Math.sin(time * 1.3) * 0.06;
    target.rotation.z = Math.sin(time * 0.9) * 0.05;
    if (ai.waiting) {
      ai.timer -= dt;
      if (ai.timer <= 0) {
        ai.waiting = false;
        if (ai.running) fire();
      }
    }
  });
  ctx.sign(P(3.2, -6.2), {
    title: { en: 'The AI launcher', ro: 'Lansatorul IA' },
    text: {
      en: 'This launcher knows no physics formulas. Each try it gets a score: how far from the red target the ball lands. It keeps its best try and adjusts the power a bit. After a few tries it hits the target! The balls fly with real gravity and air drag.',
      ro: 'Acest lansator nu știe nicio formulă de fizică. La fiecare încercare primește un scor: cât de departe de ținta roșie aterizează mingea. Își păstrează cea mai bună încercare și ajustează puțin puterea. După câteva încercări nimerește ținta! Mingile zboară cu gravitație și rezistența aerului adevărate.',
    },
  });
}

// ---------- Station 12: floating words ----------
function s12({ ctx, P, faceIn, group }) {
  const c = P(7.2, 0);
  const g = new THREE.Group();
  g.position.set(c.x, c.y, c.z);
  g.rotation.y = faceIn;
  const phrase = { en: ['The', 'cat', 'sat', 'on', 'the'], ro: ['Pisica', 'stă', 'pe', 'un', ''] };
  const cands = {
    en: [['mat', 0.55], ['sofa', 0.3], ['moon', 0.15]],
    ro: [['covor', 0.55], ['scaun', 0.3], ['nor', 0.15]],
  };
  const tileGeo = new THREE.BoxGeometry(1.25, 0.62, 0.2);
  const tiles = [];
  for (let i = 0; i < 5; i++) {
    const m = new THREE.Mesh(tileGeo, new THREE.MeshStandardMaterial({ color: '#ffffff' }));
    m.position.set(-3 + i * 1.35, 3.2, 0);
    g.add(m);
    tiles.push(m);
  }
  const candTiles = [];
  const bars = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(tileGeo, new THREE.MeshStandardMaterial({ color: '#ffffff' }));
    m.position.set(-1.6 + i * 1.6, 0.9, 0.4);
    g.add(m);
    candTiles.push(m);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1, 0.3), std(['#43b05c', '#ffd23f', '#f2464b'][i], { emissive: ['#43b05c', '#ffd23f', '#f2464b'][i], emissiveIntensity: 0.3 }));
    g.add(bar);
    bars.push(bar);
  }
  const q = new THREE.Mesh(tileGeo, new THREE.MeshStandardMaterial({ color: '#ffffff' }));
  q.position.set(-3 + 5 * 1.35, 3.2, 0);
  g.add(q);
  const draw = () => {
    const lang = state.lang;
    const words = phrase[lang];
    tiles.forEach((m, i) => {
      m.visible = !!words[i];
      if (words[i]) m.material.map = wordTexture(words[i], '#ffe9a8');
      m.material.needsUpdate = true;
    });
    const qi = words.filter(Boolean).length;
    q.position.x = -3 + qi * 1.35;
    q.material.map = wordTexture('?', '#b44dff', '#ffffff');
    q.material.needsUpdate = true;
    cands[lang].forEach(([w, p], i) => {
      candTiles[i].material.map = wordTexture(w, '#ffffff');
      candTiles[i].material.needsUpdate = true;
      bars[i].scale.y = p * 3;
      bars[i].position.set(candTiles[i].position.x, 1.3 + (p * 3) / 2, 0.4);
    });
  };
  draw();
  ctx.onLang(draw);
  group.add(shadow(g));
  ctx.physics.addBox(c.x, c.z, 2.5, 0.45, -faceIn, c.y - 1, c.y + 2.5);
  ctx.onUpdate((dt, time) => {
    tiles.forEach((m, i) => {
      m.position.y = 3.2 + Math.sin(time * 1.4 + i * 0.7) * 0.12;
      m.rotation.y = Math.sin(time * 0.8 + i) * 0.15;
    });
    q.position.y = 3.2 + Math.sin(time * 3) * 0.15;
    q.rotation.y += dt;
  });
  ctx.sign(P(2.6, -5.8), {
    title: { en: 'Guess the next word', ro: 'Ghicește cuvântul următor' },
    text: {
      en: 'Language AIs read the words so far and guess the next one. The bars show how likely each word is. Tall bar = very likely. By guessing one word at a time, again and again, a chatbot writes whole answers!',
      ro: 'IA de limbaj citesc cuvintele de până acum și ghicesc următorul cuvânt. Barele arată cât de probabil este fiecare cuvânt. Bară înaltă = foarte probabil. Ghicind câte un cuvânt, iar și iar, un chatbot scrie răspunsuri întregi!',
    },
  });
}

// ---------- Station 13: the balance of fairness ----------
function s13({ ctx, P, faceIn, group }) {
  const c = P(7.2, 0);
  const g = new THREE.Group();
  g.position.set(c.x, c.y, c.z);
  g.rotation.y = faceIn;
  const gold = std('#ffc93c', { metalness: 0.6, roughness: 0.3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 0.4, 20), std('#3b4a7a'));
  base.position.y = 0.2;
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 3.2, 12), gold);
  col.position.y = 1.9;
  const beamPivot = new THREE.Group();
  beamPivot.position.y = 3.5;
  const beam = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.16, 0.16), gold);
  beamPivot.add(beam);
  const pans = [];
  for (const sx of [-1, 1]) {
    const hanger = new THREE.Group();
    hanger.position.x = sx * 2.1;
    beamPivot.add(hanger);
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.4, 6), gold);
    rope.position.y = -0.7;
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.5, 0.15, 20), gold);
    pan.position.y = -1.45;
    hanger.add(rope, pan);
    const icon = makeBoard({ title: '', big: sx < 0 ? '🐕' : '🐩', bigSize: 190 }, 0.8, 0.8);
    icon.position.y = -0.8;
    icon.position.z = 0.02;
    hanger.add(icon);
    pans.push(hanger);
  }
  g.add(base, col, beamPivot);
  group.add(shadow(g));
  ctx.physics.addCircle(c.x, c.z, 1.2, c.y - 1, c.y + 3.5);
  let ang = 0.25;
  let vel = 0;
  ctx.onUpdate((dt, time) => {
    // A damped pendulum that settles to level, then gets nudged again.
    vel += (-ang * 3 - vel * 0.6) * dt;
    ang += vel * dt;
    if (Math.floor(time / 9) !== Math.floor((time - dt) / 9)) vel += 0.5;
    beamPivot.rotation.z = ang;
    for (const p of pans) p.rotation.z = -ang;
  });
  ctx.sign(P(2.6, -5.8), {
    title: { en: 'The balance of fairness', ro: 'Balanța corectitudinii' },
    text: {
      en: 'A fair AI works equally well for everyone: big dogs and small dogs, every accent, every skin color. When one side is left out of the training data, the AI tips over. We balance it by testing on every group and adding the missing examples.',
      ro: 'O IA corectă funcționează la fel de bine pentru toată lumea: câini mari și câini mici, orice accent, orice culoare a pielii. Când o parte lipsește din datele de antrenare, IA se înclină. O echilibrăm testând-o pe fiecare grup și adăugând exemplele care lipsesc.',
    },
  });
  void TOP;
}
