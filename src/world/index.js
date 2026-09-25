import * as THREE from 'three';
import { createEnvironment } from './env.js';
import { buildTerrain, buildDecorations } from './terrain.js';
import { buildBridges } from './bridges.js';
import { buildStationProps } from './props.js';
import { buildChallenge } from './challenges.js';
import { createParticles, createBeacon } from './fx.js';
import { createRobot } from './robot.js';
import { makeBoard } from './labels.js';
import { makeBall } from './balls.js';
import { stationIslands, hub, local, terrainHeight, TOP, islandAt, rng, chPoint } from './layout.js';
import { STATION_META } from '../content/meta.js';
import { L, t } from '../i18n.js';
import { state, sp } from '../state.js';

const std = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.6, ...extra });

// Builds the whole island world and returns handles the game uses.
export function buildWorld(scene, physics, hooks) {
  const env = createEnvironment(scene);
  buildTerrain(scene);
  const particles = createParticles(scene);
  const reserved = [];
  const interactables = [];
  const updaters = [];
  const langHooks = [];
  const signs = [];

  const reserve = (x, z, r) => reserved.push({ x, z, r });
  const ctx = {
    scene,
    physics,
    particles,
    reserve,
    challengeDone: (id) => hooks.challengeDone(id),
    challengeInfo: (id, after) => hooks.challengeInfo(id, after),
    interact(o) {
      interactables.push({ y: terrainHeight(o.x, o.z), r: 2.5, enabled: () => true, ...o });
    },
    onUpdate(fn) {
      updaters.push(fn);
    },
    onLang(fn) {
      langHooks.push(fn);
    },
    sign(p, content) {
      buildSign(p, content);
    },
  };

  // --- Info signs (press E to read) ---
  const signGeo = new THREE.BoxGeometry(1.3, 0.9, 0.1);
  const signPostGeo = new THREE.CylinderGeometry(0.07, 0.08, 1.2, 8);
  function buildSign(p, content) {
    const g = new THREE.Group();
    g.position.set(p.x, p.y, p.z);
    const isl = islandAt(p.x, p.z);
    const cx = isl ? isl.x : 0;
    const cz = isl ? isl.z : 0;
    g.rotation.y = Math.atan2(cx - p.x, cz - p.z) + 0.001;
    const post = new THREE.Mesh(signPostGeo, std('#7a4f33'));
    post.position.y = 0.6;
    const board = new THREE.Mesh(signGeo, std('#f6f9ff'));
    board.position.y = 1.35;
    board.rotation.x = -0.25;
    const face = makeBoard({ title: '', big: 'i', bigSize: 230, bigInk: '#2a9df4', bigOffset: 8 }, 0.8, 0.55);
    face.position.set(0, 1.37, 0.07);
    face.rotation.x = -0.25;
    g.add(post, board, face);
    g.traverse((o) => o.isMesh && (o.castShadow = true));
    scene.add(g);
    physics.addCircle(p.x, p.z, 0.25, p.y - 1, p.y + 1.8);
    reserve(p.x, p.z, 1.4);
    const sign = { ...content, x: p.x, z: p.z };
    signs.push(sign);
    ctx.interact({ x: p.x, z: p.z, r: 2.2, kind: 'sign', label: () => t('promptSign') + ': ' + L(content.title), action: () => hooks.readSign(sign) });
  }

  // --- Station kiosks, title boards, teleport pads ---
  const kiosks = [];
  const pads = [];
  const padGeo = new THREE.CylinderGeometry(1.1, 1.2, 0.16, 28);
  const padRingGeo = new THREE.TorusGeometry(0.95, 0.07, 8, 32);
  const padBeamGeo = new THREE.CylinderGeometry(0.95, 0.95, 2.2, 24, 1, true);
  padBeamGeo.translate(0, 1.1, 0);
  const padBeamMat = new THREE.MeshBasicMaterial({ color: '#6fe7ff', transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });

  function buildPad(x, z, id) {
    const y = terrainHeight(x, z);
    const g = new THREE.Group();
    g.position.set(x, y, z);
    const base = new THREE.Mesh(padGeo, std('#3b4a7a', { metalness: 0.4 }));
    base.position.y = 0.08;
    base.receiveShadow = true;
    const ring = new THREE.Mesh(padRingGeo, new THREE.MeshBasicMaterial({ color: '#6fe7ff', toneMapped: false }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.18;
    const beam = new THREE.Mesh(padBeamGeo, padBeamMat);
    beam.position.y = 0.16;
    g.add(base, ring, beam);
    scene.add(g);
    reserve(x, z, 1.8);
    pads.push({ id, x, z, y, ring });
    ctx.interact({ x, z, r: 1.4, kind: 'pad', label: () => t('promptTeleport'), action: () => hooks.openMap() });
  }

  const cullables = [];
  for (const isl of stationIslands) {
    const meta = STATION_META[isl.idx];
    const faceIn = Math.atan2(isl.radial.x, isl.radial.z); // faces outward... toward the props
    // Kiosk.
    const kp = local(isl, -4, 0);
    const ky = terrainHeight(kp.x, kp.z);
    const k = new THREE.Group();
    k.position.set(kp.x, ky, kp.z);
    k.rotation.y = faceIn;
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.25, 0.7), std('#27305a', { metalness: 0.2 }));
    body.position.y = 0.62;
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.16, 0.72), std(meta.color, { emissive: meta.color, emissiveIntensity: 0.4 }));
    stripe.position.y = 0.95;
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.05, 0.22), std('#27305a'));
    head.position.set(0, 1.75, 0.05);
    head.rotation.x = -0.3;
    const screen = makeBoard({}, 1.3, 0.9);
    screen.position.set(0, 1.77, 0.19);
    screen.rotation.x = -0.3;
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color: meta.color, toneMapped: false }));
    lamp.position.set(0, 2.38, -0.05);
    k.add(body, stripe, head, screen, lamp);
    k.traverse((o) => o.isMesh && (o.castShadow = true));
    scene.add(k);
    cullables.push({ obj: k, x: isl.x, z: isl.z });
    physics.addBox(kp.x, kp.z, 0.7, 0.42, -faceIn, ky - 1, ky + 2.3);
    reserve(kp.x, kp.z, 3);

    const kiosk = {
      id: meta.id,
      idx: isl.idx,
      x: kp.x,
      z: kp.z,
      y: ky,
      front: local(isl, -2.6, 0),
      lamp,
      redraw() {
        const p = sp(meta.id);
        const unlocked = isUnlocked(meta.id);
        screen.userData.redraw({
          badge: String(meta.num),
          accent: meta.color,
          eyebrow: t('station') + ' ' + meta.num,
          title: unlocked ? L(meta.title) : '🔒 ' + t('locked'),
          titleSize: 46,
          body: p.passed ? '✅ ' + t('passed') : '',
          bodySize: 38,
        });
      },
    };
    kiosk.redraw();
    kiosks.push(kiosk);
    langHooks.push(() => kiosk.redraw());
    ctx.interact({
      x: kiosk.front.x,
      z: kiosk.front.z,
      r: 2.4,
      kind: 'kiosk',
      stationId: meta.id,
      label: () => (isUnlocked(meta.id) ? t('promptTerminal', { n: meta.num, title: L(meta.title) }) : t('promptLocked', { n: meta.num })),
      action: () => hooks.openStation(meta.id),
    });

    // Big title board on two posts behind the kiosk.
    const bp = local(isl, -6, 0);
    const by = terrainHeight(bp.x, bp.z);
    const tb = new THREE.Group();
    tb.position.set(bp.x, by, bp.z);
    tb.rotation.y = faceIn;
    const board = makeBoard({}, 4.2, 1.5);
    board.position.y = 3.3;
    const board2 = makeBoard({}, 4.2, 1.5);
    board2.position.set(0, 3.3, -0.16);
    board2.rotation.y = Math.PI;
    const back = new THREE.Mesh(new THREE.BoxGeometry(4.35, 1.65, 0.12), std('#27305a'));
    back.position.set(0, 3.3, -0.08);
    tb.add(board, board2, back);
    for (const sx of [-1.8, 1.8]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 3.3, 8), std('#27305a'));
      post.position.set(sx, 1.65, -0.1);
      tb.add(post);
      const pw = local(isl, -6.1, -sx);
      physics.addCircle(pw.x, pw.z, 0.15, by - 1, by + 4.2);
    }
    tb.traverse((o) => o.isMesh && (o.castShadow = true));
    scene.add(tb);
    const drawTitle = () => {
      const spec = { badge: String(meta.num), accent: meta.color, eyebrow: t('station') + ' ' + meta.num, title: L(meta.title), titleSize: 50 };
      board.userData.redraw(spec);
      board2.userData.redraw(spec);
    };
    drawTitle();
    langHooks.push(drawTitle);
    reserve(bp.x, bp.z, 2.6);

    // Teleport pad and a spot for Professor Ada.
    const pp = local(isl, -4.2, -4.6);
    buildPad(pp.x, pp.z, meta.id);
    const ap = local(isl, -3.2, 2.6);
    reserve(ap.x, ap.z, 1.5);
    isl.adaSpot = { x: ap.x, z: ap.z };

    // Themed landmark.
    reserve(local(isl, 7, 0).x, local(isl, 7, 0).z, 6.5);
    cullables.push({ obj: buildStationProps(isl, ctx), x: isl.x, z: isl.z });
    // Island challenge (a physical puzzle), on the free side of the island.
    const ca = chPoint(isl, 0, 0);
    reserve(ca.x, ca.z, 4.6);
    cullables.push({ obj: buildChallenge(isl, ctx), x: isl.x, z: isl.z });
  }

  // --- Hub: Core Tower, final kiosk, physics playground, signs ---
  const tower = buildTower(scene, physics);
  reserve(0, 0, 9.5);
  const fk = { x: 0, z: 6.9 };
  {
    const y = terrainHeight(fk.x, fk.z);
    const k = new THREE.Group();
    k.position.set(fk.x, y, fk.z);
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.3, 0.8), std('#27305a', { metalness: 0.3 }));
    body.position.y = 0.65;
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 0.22), std('#27305a'));
    top.position.set(0, 1.8, 0.05);
    top.rotation.x = -0.3;
    const screen = makeBoard({}, 1.5, 0.95);
    screen.position.set(0, 1.82, 0.19);
    screen.rotation.x = -0.3;
    k.add(body, top, screen);
    k.traverse((o) => o.isMesh && (o.castShadow = true));
    scene.add(k);
    physics.addBox(fk.x, fk.z, 0.8, 0.45, 0, y - 1, y + 2.3);
    const redraw = () => {
      const n = passedCount();
      screen.userData.redraw({
        eyebrow: t('finalTitle'),
        accent: '#b44dff',
        title: state.finalPassed ? '🏆' : n >= 13 ? '▶ ' + t('open') : `${n} / 13`,
        titleSize: 64,
        body: state.finalPassed ? t('resultPassMsgFinal') : t('cores'),
        bodySize: 30,
      });
    };
    redraw();
    langHooks.push(redraw);
    tower.redrawKiosk = redraw;
    ctx.interact({
      x: fk.x,
      z: fk.z + 1.5,
      r: 2.4,
      kind: 'final',
      label: () => (passedCount() >= 13 ? t('promptFinal') : t('promptFinalLocked')),
      action: () => hooks.openFinal(),
    });
  }
  // Welcome arch over the path to Station 1.
  {
    const ay = terrainHeight(0, 24.5);
    const arch = new THREE.Group();
    arch.position.set(0, ay, 24.5);
    for (const sx of [-2.6, 2.6]) {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 4.4, 10), std('#ff6b3d'));
      p.position.set(sx, 2.2, 0);
      arch.add(p);
      physics.addCircle(sx, 24.5, 0.3, ay - 1, ay + 4.6);
    }
    const front = makeBoard({}, 5.4, 1.3);
    front.position.set(0, 4.5, 0.08);
    const backB = makeBoard({}, 5.4, 1.3);
    backB.position.set(0, 4.5, -0.08);
    backB.rotation.y = Math.PI;
    arch.add(front, backB);
    arch.traverse((o) => o.isMesh && (o.castShadow = true));
    scene.add(arch);
    const draw = () => {
      front.userData.redraw({ eyebrow: '→ ' + t('station') + ' 1', title: t('gameTitle'), accent: '#ff6b3d', titleSize: 60 });
      backB.userData.redraw({ eyebrow: t('hub'), title: t('gameTitle'), accent: '#b44dff', titleSize: 60 });
    };
    draw();
    langHooks.push(draw);
  }
  buildPad(-7.5, 11, 'hub');
  hub.adaSpot = { x: -2.8, z: 11.4 };
  reserve(-2.8, 11.4, 1.6);
  reserve(0, 13.5, 2);
  reserve(0, 24.5, 3.5);
  reserve(-15, -7, 8.5);

  // Physics playground balls.
  const hubBalls = [
    makeBall(physics, scene, 'soccer', -10, TOP + 0.3, -10.2),
    makeBall(physics, scene, 'basket', -9.2, TOP + 0.3, -8.8),
    makeBall(physics, scene, 'bowling', -10.8, TOP + 0.3, -11.8, '#2b2f6b'),
    makeBall(physics, scene, 'beach', -8.6, TOP + 0.5, -12.3),
    makeBall(physics, scene, 'big', -12.5, TOP + 0.5, -2.8, '#b44dff'),
    makeBall(physics, scene, 'beach', 18.4, TOP + 0.5, -15.2),
    makeBall(physics, scene, 'bowling', 17.2, TOP + 0.3, -16.8, '#2b2f6b'),
    makeBall(physics, scene, 'soccer', 16.2, TOP + 0.3, -15.6),
  ];
  reserve(-10, -10.5, 3);
  reserve(17.5, -16, 3);
  ctx.sign({ x: -8.4, z: -4.6, y: terrainHeight(-8.4, -4.6) }, {
    title: { en: 'Why do balls roll downhill?', ro: 'De ce se rostogolesc mingile la vale?' },
    text: {
      en: 'Gravity pulls everything down, speeding things up by 9.81 meters per second, every second. On a slope, part of that pull points along the slope, so balls speed up as they roll down. A rolling ball also has to spin, so it speeds up a bit slower than something sliding on ice. Push a ball up the hill and watch it come back!',
      ro: 'Gravitația trage totul în jos și mărește viteza cu 9,81 metri pe secundă, în fiecare secundă. Pe o pantă, o parte din această tragere e de-a lungul pantei, așa că mingile accelerează la vale. O minge care se rostogolește trebuie să se și învârtă, deci accelerează puțin mai încet decât ceva care alunecă pe gheață. Împinge o minge în sus pe deal și uită-te cum se întoarce!',
    },
  });
  ctx.sign({ x: -6.8, z: -12.2, y: terrainHeight(-6.8, -12.2) }, {
    title: { en: 'Same kick, different mass', ro: 'Aceeași lovitură, masă diferită' },
    text: {
      en: 'Press F next to a ball to kick it. Every kick gives the same push. Newton\'s second law says a lighter ball speeds up more: the beach ball (0.2 kg) flies away, the soccer ball (0.43 kg) rolls far, and the bowling ball (6.5 kg) barely moves. Air slows down big light balls the most.',
      ro: 'Apasă F lângă o minge ca s-o lovești. Fiecare lovitură dă aceeași împingere. A doua lege a lui Newton spune că o minge mai ușoară capătă viteză mai mare: mingea de plajă (0,2 kg) zboară, mingea de fotbal (0,43 kg) se rostogolește departe, iar bila de bowling (6,5 kg) abia se mișcă. Aerul frânează cel mai tare mingile mari și ușoare.',
    },
  });
  ctx.sign({ x: 15.6, z: -13.8, y: terrainHeight(15.6, -13.8) }, {
    title: { en: 'Float or sink?', ro: 'Plutește sau se scufundă?' },
    text: {
      en: 'Kick the balls into the sea! Things float when they are less dense than water (1000 kg in every cubic meter). The beach ball is mostly air, so it floats high. The bowling ball is denser than water, so it sinks to the bottom. Bip is made of metal... so Bip sinks too. Stay on land, Bip!',
      ro: 'Lovește mingile în mare! Lucrurile plutesc când sunt mai puțin dense decât apa (1000 kg în fiecare metru cub). Mingea de plajă e plină mai ales cu aer, așa că plutește sus. Bila de bowling e mai densă decât apa, așa că se scufundă. Bip e făcut din metal... deci și Bip se scufundă. Stai pe uscat, Bip!',
    },
  });
  ctx.sign({ x: 5.2, z: 9.8, y: terrainHeight(5.2, 9.8) }, {
    title: { en: 'The Core Tower', ro: 'Turnul Nucleului' },
    text: {
      en: "Each ring of this tower is one layer of Bip's brain. Pass a station's test to earn a Knowledge Core and light up a ring. Light all 13 rings to unlock the Final Challenge at the tower's terminal!",
      ro: 'Fiecare inel al acestui turn este un strat din creierul lui Bip. Trece testul unei stații ca să câștigi un Nucleu de cunoaștere și să aprinzi un inel. Aprinde toate cele 13 inele ca să deblochezi Provocarea Finală de la terminalul turnului!',
    },
  });

  // Trees, rocks and flowers go where nothing else is.
  const decor = buildDecorations(scene, physics, reserved);
  let cullDist = 118;
  const bridges = buildBridges(scene, physics);
  const crystals = buildCrystals(scene, physics);

  // Professor Ada: a hologram that appears at whatever island Bip is on.
  const ada = createRobot({ hologram: true, hover: true, glasses: true, accent: '#b388ff', body: '#e4dbff', eye: '#ffffff', tip: '#ff8fd0', scale: 1.18 });
  scene.add(ada.group);
  let adaIsland = null;
  let adaAppear = 1;
  const adaInteract = { x: 0, z: 0, y: TOP, r: 2.6, kind: 'ada', enabled: () => !!adaIsland, label: () => t('promptAda'), action: () => hooks.talkAda(adaIsland) };
  interactables.push(adaInteract);

  const beacon = createBeacon(scene);

  function isUnlocked(id) {
    const i = STATION_META.findIndex((m) => m.id === id);
    return i === 0 ? state.introDone : sp(STATION_META[i - 1].id).passed;
  }
  function passedCount() {
    return STATION_META.filter((m) => sp(m.id).passed).length;
  }

  function refreshProgress() {
    for (const br of bridges.items) {
      const open = br.bridge.unlockedBy === null || sp(br.bridge.unlockedBy).passed;
      if (open !== br.built && br.building < 0) br.setBuilt(open, false);
    }
    kiosks.forEach((k) => k.redraw());
    tower.setRings(STATION_META.map((m) => sp(m.id).passed), state.finalPassed);
    tower.redrawKiosk && tower.redrawKiosk();
    crystals.refresh();
  }

  let time = 0;
  return {
    env,
    particles,
    interactables,
    kiosks,
    pads,
    signs,
    bridges,
    crystals,
    beacon,
    tower,
    ada,
    hubBalls,
    isUnlocked,
    passedCount,
    refreshProgress,
    refreshLang() {
      langHooks.forEach((f) => f());
    },
    setLow(low) {
      env.setLow(low);
      decor.small.forEach((m) => (m.visible = !low));
      cullDist = low ? 70 : 118;
    },
    buildBridgeFor(stationId) {
      for (const br of bridges.byUnlock(stationId)) br.setBuilt(true, true);
    },
    update(dt, player) {
      time += dt;
      const p = player.pos;
      env.update(dt, time, p);
      bridges.update(dt);
      particles.update(dt);
      beacon.update(dt, p);
      tower.update(dt, time);
      crystals.update(dt, time);
      for (const u of updaters) u(dt, time, p);
      for (const pad of pads) pad.ring.rotation.z += dt;
      // Ada follows Bip from island to island.
      const isl = islandAt(p.x, p.z);
      if (isl && isl !== adaIsland && isl.adaSpot) {
        adaIsland = isl;
        adaAppear = 0;
        const y = terrainHeight(isl.adaSpot.x, isl.adaSpot.z);
        ada.group.position.set(isl.adaSpot.x, y, isl.adaSpot.z);
        adaInteract.x = isl.adaSpot.x;
        adaInteract.z = isl.adaSpot.z;
        adaInteract.y = y;
        particles.emit({ x: isl.adaSpot.x, y: y + 1, z: isl.adaSpot.z, count: 30, colors: ['#b388ff', '#ffffff', '#6fe7ff'], up: 2, spread: 1.5, size: 0.18, gravity: -0.1 });
      }
      if (adaIsland) {
        adaAppear = Math.min(1, adaAppear + dt * 1.5);
        ada.group.scale.set(1, adaAppear, 1);
        const dx = p.x - ada.group.position.x;
        const dz = p.z - ada.group.position.z;
        const want = Math.atan2(dx, dz);
        let diff = want - ada.group.rotation.y;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        ada.group.rotation.y += diff * Math.min(1, dt * 3);
        ada.update(dt, { speed: 0, onGround: true });
      }
      // Hide station details that are far away (the islands themselves stay visible).
      for (const c of cullables) c.obj.visible = Math.hypot(c.x - p.x, c.z - p.z) < cullDist;
      void rng;
    },
  };
}

function buildTower(scene, physics) {
  const g = new THREE.Group();
  const y0 = terrainHeight(0, 0);
  g.position.set(0, y0, 0);
  const plat = new THREE.Mesh(new THREE.CylinderGeometry(5.4, 5.8, 0.4, 40), std('#dfe6f7', { roughness: 0.5 }));
  plat.position.y = 0.2;
  plat.receiveShadow = true;
  g.add(plat);
  physics.addCircle(0, 0, 5.6, y0 - 1, y0 + 0.4, { walkable: true });
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2, 26, 24), std('#27305a', { metalness: 0.4, roughness: 0.35 }));
  pillar.position.y = 13.4;
  g.add(pillar);
  physics.addCircle(0, 0, 2.1, y0 + 0.3, y0 + 40);
  for (let i = 0; i < 4; i++) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5, 2.4), std('#3b4a7a'));
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    fin.position.set(Math.cos(a) * 2.6, 2.9, Math.sin(a) * 2.6);
    fin.rotation.y = -a;
    g.add(fin);
    physics.addBox(Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0.15, 1.2, a, y0, y0 + 5.4);
  }
  const rings = [];
  const ringGeo = new THREE.TorusGeometry(2.55, 0.34, 12, 48);
  for (let i = 0; i < 13; i++) {
    const m = new THREE.Mesh(ringGeo, new THREE.MeshStandardMaterial({ color: '#4a5580', metalness: 0.5, roughness: 0.3, emissive: '#000000' }));
    m.rotation.x = Math.PI / 2;
    m.position.y = 6.2 + i * 1.5;
    g.add(m);
    rings.push(m);
  }
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.3, 1),
    new THREE.MeshStandardMaterial({ color: '#8f9ac2', metalness: 0.3, roughness: 0.3, flatShading: true, emissive: '#000000' }),
  );
  core.position.y = 29.5;
  g.add(core);
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(3.4, 0.08, 8, 64),
    new THREE.MeshBasicMaterial({ color: '#ffd23f', transparent: true, opacity: 0, toneMapped: false }),
  );
  halo.position.y = 29.5;
  g.add(halo);
  g.traverse((o) => o.isMesh && (o.castShadow = true));
  scene.add(g);
  let lit = [];
  let final = false;
  return {
    setRings(passed, finalDone) {
      lit = passed;
      final = finalDone;
      passed.forEach((on, i) => {
        const m = rings[i].material;
        const c = STATION_META[i].color;
        m.color.set(on ? c : '#4a5580');
        m.emissive.set(on ? c : '#000000');
        m.emissiveIntensity = on ? 0.9 : 0;
      });
      core.material.emissive.set(finalDone ? '#ffd23f' : '#000000');
      core.material.emissiveIntensity = finalDone ? 1.2 : 0;
      core.material.color.set(finalDone ? '#fff3b0' : '#8f9ac2');
      halo.material.opacity = finalDone ? 0.9 : 0;
    },
    update(dt, time) {
      core.rotation.y += dt * (final ? 1.2 : 0.3);
      core.rotation.x += dt * 0.2;
      core.position.y = 29.5 + Math.sin(time * 0.8) * 0.4;
      halo.rotation.x = Math.PI / 2 + Math.sin(time) * 0.3;
      halo.rotation.y += dt;
      rings.forEach((r, i) => {
        if (lit[i]) r.material.emissiveIntensity = 0.7 + Math.sin(time * 3 - i * 0.5) * 0.3;
      });
    },
    ringWorldY(i) {
      return g.position.y + 6.2 + i * 1.5;
    },
  };
}

// Data Crystals: collectibles with a fun fact each.
function buildCrystals(scene, physics) {
  const positions = [];
  const R = rng(4242);
  const free = (x, z) => {
    for (const c of physics.colliders) {
      const r = (c.type === 'circle' ? c.r : c.br) + 1.2;
      if (Math.hypot(x - c.x, z - c.z) < r) return false;
    }
    return terrainHeight(x, z) > 1.5;
  };
  for (const isl of stationIslands) {
    let got = 0;
    for (let k = 0; k < 200 && got < 2; k++) {
      const a = R() * Math.PI * 2;
      const d = 5 + R() * 6;
      const x = isl.x + Math.cos(a) * d;
      const z = isl.z + Math.sin(a) * d;
      if (!free(x, z)) continue;
      if (positions.some((p) => Math.hypot(p.x - x, p.z - z) < 5)) continue;
      positions.push({ x, z, y: terrainHeight(x, z) + 1 });
      got++;
    }
  }
  positions.push({ x: -15, z: -7, y: terrainHeight(-15, -7) + 1 });
  for (const [x, z] of [[19, 9], [-13, 15], [7, -19]]) {
    let px = x;
    let pz = z;
    for (let k = 0; k < 30 && !free(px, pz); k++) {
      px = x + (R() - 0.5) * 6;
      pz = z + (R() - 0.5) * 6;
    }
    positions.push({ x: px, z: pz, y: terrainHeight(px, pz) + 1 });
  }
  const geo = new THREE.OctahedronGeometry(0.38, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#7ff6ff', emissive: '#22c3e6', emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.15, flatShading: true });
  const items = positions.map((p, i) => {
    const m = new THREE.Mesh(geo, mat);
    m.scale.set(1, 1.5, 1);
    m.position.set(p.x, p.y, p.z);
    m.castShadow = true;
    scene.add(m);
    return { ...p, i, mesh: m, taken: false };
  });
  return {
    items,
    total: items.length,
    refresh() {
      items.forEach((c) => {
        c.taken = state.crystals.includes(c.i);
        c.mesh.visible = !c.taken;
      });
    },
    update(dt, time) {
      for (const c of items) {
        if (c.taken) continue;
        c.mesh.rotation.y += dt * 1.6;
        c.mesh.position.y = c.y + Math.sin(time * 2 + c.i) * 0.15;
      }
    },
  };
}
