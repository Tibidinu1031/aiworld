import * as THREE from 'three';
import { islands, terrainHeight, bridges, TOP, lossValley, rng, hub } from './layout.js';

// Path segments run from each bridge end to the middle of its island.
export const paths = [];
for (const b of bridges) {
  const A = islands.find((i) => i.id === b.from);
  const B = islands.find((i) => i.id === b.to);
  paths.push({ ax: b.sx, az: b.sz, bx: A.x, bz: A.z, isl: A.id });
  paths.push({ ax: b.ex, az: b.ez, bx: B.x, bz: B.z, isl: B.id });
}

export function distToPath(x, z) {
  let best = Infinity;
  for (const p of paths) {
    const dx = p.bx - p.ax;
    const dz = p.bz - p.az;
    const l2 = dx * dx + dz * dz;
    let t = ((x - p.ax) * dx + (z - p.az) * dz) / l2;
    t = Math.max(0, Math.min(1, t));
    const d = Math.hypot(x - (p.ax + dx * t), z - (p.az + dz * t));
    if (d < best) best = d;
  }
  // A circular walkway around the Core Tower.
  const dh = Math.abs(Math.hypot(x - hub.x, z - hub.z) - 8.5);
  return Math.min(best, dh);
}

const C = {
  deep: new THREE.Color('#2f7d86'),
  seabed: new THREE.Color('#b8a372'),
  wet: new THREE.Color('#d8c38a'),
  sand: new THREE.Color('#f0dfa8'),
  grassA: new THREE.Color('#7cc75a'),
  grassB: new THREE.Color('#5daf45'),
  grassC: new THREE.Color('#9bd46a'),
  path: new THREE.Color('#dcc9a0'),
  lossHigh: new THREE.Color('#ff8a5c'),
  lossLow: new THREE.Color('#5a67d8'),
};

function colorAt(x, z, h, out) {
  if (h < -0.25) {
    const t = Math.min(1, (-0.25 - h) / 3.2);
    return out.copy(C.seabed).lerp(C.deep, t);
  }
  if (h < 0.35) return out.copy(C.wet);
  if (h < 1.25) return out.copy(C.sand).lerp(C.grassA, Math.max(0, (h - 1.0) / 0.25));
  // Loss Valley: color the bowl like a heat map of the error.
  const lv = Math.hypot(x - lossValley.x, z - lossValley.z);
  if (lv < lossValley.r) {
    const depth = Math.min(1, Math.max(0, (TOP - h) / 1.85));
    return out.copy(C.lossHigh).lerp(C.lossLow, depth);
  }
  const n = Math.sin(x * 0.37 + z * 0.11) * Math.cos(z * 0.29 - x * 0.07) * 0.5 + 0.5;
  out.copy(C.grassA).lerp(C.grassB, n * 0.7);
  if (n > 0.85) out.lerp(C.grassC, 0.5);
  const dp = distToPath(x, z);
  if (dp < 1.25) out.lerp(C.path, dp < 0.95 ? 1 : 0.5);
  return out;
}

export function buildTerrain(scene) {
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95, metalness: 0 });
  const tmp = new THREE.Color();
  const group = new THREE.Group();
  for (const isl of islands) {
    const ext = isl.r + isl.a1 + isl.a2 + isl.w + 1;
    const res = isl.id === 'hub' ? 1.15 : 0.8;
    const n = Math.ceil((ext * 2) / res);
    const geo = new THREE.PlaneGeometry(ext * 2, ext * 2, n, n);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i) + isl.x;
      const z = pos.getZ(i) + isl.z;
      const h = terrainHeight(x, z);
      pos.setXYZ(i, x, h, z);
      colorAt(x, z, h, tmp);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  scene.add(group);
  return group;
}

// Trees, rocks, flowers and grass, kept away from reserved spots.
export function buildDecorations(scene, physics, reserved) {
  const trees = [];
  const rocks = [];
  const flowers = [];
  const tufts = [];
  const blocked = (x, z, pad) => {
    for (const r of reserved) if (Math.hypot(x - r.x, z - r.z) < r.r + pad) return true;
    return false;
  };
  for (const isl of islands) {
    const R = rng(Math.floor(isl.seed * 1000) + 17);
    const isHub = isl.id === 'hub';
    const wantTrees = isHub ? 34 : 10;
    let tries = 0;
    let placed = 0;
    while (placed < wantTrees && tries < 600) {
      tries++;
      const a = R() * Math.PI * 2;
      const d = (isHub ? 9 : 5) + R() * (isl.r - (isHub ? 9.5 : 5.5));
      const x = isl.x + Math.cos(a) * d;
      const z = isl.z + Math.sin(a) * d;
      const h = terrainHeight(x, z);
      if (h < 1.6) continue;
      if (distToPath(x, z) < 2.4) continue;
      if (blocked(x, z, 1.6)) continue;
      if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 3.2)) continue;
      trees.push({ x, z, y: h, s: 0.8 + R() * 0.55, kind: R() < 0.35 ? 'pine' : 'round', hue: R() });
      placed++;
    }
    // Rocks on the beach.
    const wantRocks = isHub ? 14 : 6;
    tries = 0;
    placed = 0;
    while (placed < wantRocks && tries < 400) {
      tries++;
      const a = R() * Math.PI * 2;
      const d = isl.r + R() * (isl.w * 0.55);
      const x = isl.x + Math.cos(a) * d;
      const z = isl.z + Math.sin(a) * d;
      const h = terrainHeight(x, z);
      if (h < -0.6 || h > 1.9) continue;
      if (distToPath(x, z) < 3) continue;
      if (blocked(x, z, 1)) continue;
      if (bridgeNear(x, z, 3.5)) continue;
      rocks.push({ x, z, y: h, s: 0.4 + R() * 0.9, rot: R() * 6, tone: R() });
      placed++;
    }
    // Flowers and grass tufts.
    const wantF = isHub ? 160 : 55;
    let got = 0;
    for (let k = 0; k < wantF * 4 && got < wantF; k++) {
      const a = R() * Math.PI * 2;
      const d = R() * (isl.r - 0.5);
      const x = isl.x + Math.cos(a) * d;
      const z = isl.z + Math.sin(a) * d;
      const h = terrainHeight(x, z);
      if (h < 1.5 || distToPath(x, z) < 1.4 || blocked(x, z, 0.3)) continue;
      if (R() < 0.3) flowers.push({ x, z, y: h, c: Math.floor(R() * 5) });
      else tufts.push({ x, z, y: h, s: 0.7 + R() * 0.8, r: R() * 6 });
      got++;
    }
  }

  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const v = new THREE.Vector3();
  const sc = new THREE.Vector3();
  const col = new THREE.Color();

  // Trunks.
  const trunkGeo = new THREE.CylinderGeometry(0.16, 0.26, 1.8, 7);
  trunkGeo.translate(0, 0.9, 0);
  const trunk = new THREE.InstancedMesh(trunkGeo, new THREE.MeshStandardMaterial({ color: '#8a5a3b', roughness: 0.9, flatShading: true }), trees.length);
  const roundGeo = new THREE.IcosahedronGeometry(1.35, 0);
  const pineGeo = new THREE.ConeGeometry(1.25, 2.8, 7);
  const leafMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85, flatShading: true });
  const rounds = trees.filter((t) => t.kind === 'round');
  const pines = trees.filter((t) => t.kind === 'pine');
  const roundMesh = new THREE.InstancedMesh(roundGeo, leafMat, rounds.length);
  const pineMesh = new THREE.InstancedMesh(pineGeo, leafMat, pines.length);
  const leafColors = ['#4cae4f', '#63bf5a', '#3f9e58', '#79c95c', '#2f8f57'];
  trees.forEach((t, i) => {
    m4.compose(v.set(t.x, t.y - 0.1, t.z), q.identity(), sc.setScalar(t.s));
    trunk.setMatrixAt(i, m4);
    physics.addCircle(t.x, t.z, 0.32 * t.s, t.y - 1, t.y + 3.5 * t.s);
  });
  rounds.forEach((t, i) => {
    e.set(t.hue * 3, t.hue * 5, 0);
    m4.compose(v.set(t.x, t.y + 2.3 * t.s, t.z), q.setFromEuler(e), sc.set(t.s, t.s * 1.05, t.s));
    roundMesh.setMatrixAt(i, m4);
    roundMesh.setColorAt(i, col.set(leafColors[Math.floor(t.hue * leafColors.length)]));
  });
  pines.forEach((t, i) => {
    m4.compose(v.set(t.x, t.y + 2.6 * t.s, t.z), q.identity(), sc.setScalar(t.s));
    pineMesh.setMatrixAt(i, m4);
    pineMesh.setColorAt(i, col.set(leafColors[Math.floor(t.hue * leafColors.length)]).multiplyScalar(0.85));
  });
  for (const m of [trunk, roundMesh, pineMesh]) {
    m.castShadow = true;
    m.receiveShadow = true;
    m.computeBoundingSphere();
    scene.add(m);
  }

  // Rocks (you can climb on them).
  const rockMesh = new THREE.InstancedMesh(
    new THREE.DodecahedronGeometry(1, 0),
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95, flatShading: true }),
    rocks.length,
  );
  rocks.forEach((r, i) => {
    e.set(r.rot, r.rot * 2, r.rot * 0.5);
    m4.compose(v.set(r.x, r.y + r.s * 0.25, r.z), q.setFromEuler(e), sc.set(r.s * 1.2, r.s * 0.8, r.s));
    rockMesh.setMatrixAt(i, m4);
    rockMesh.setColorAt(i, col.set('#9aa3ad').lerp(new THREE.Color('#c7b9a3'), r.tone));
    physics.addCircle(r.x, r.z, r.s * 0.95, r.y - 2, r.y + r.s * 0.95, { walkable: true });
  });
  rockMesh.castShadow = true;
  rockMesh.receiveShadow = true;
  scene.add(rockMesh);

  // Flowers.
  const flowerMesh = new THREE.InstancedMesh(
    new THREE.IcosahedronGeometry(0.12, 0),
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, flatShading: true }),
    flowers.length,
  );
  const fc = ['#ffffff', '#ffd23f', '#ff7aa2', '#b388ff', '#ff8a5c'];
  flowers.forEach((f, i) => {
    m4.compose(v.set(f.x, f.y + 0.12, f.z), q.identity(), sc.setScalar(1));
    flowerMesh.setMatrixAt(i, m4);
    flowerMesh.setColorAt(i, col.set(fc[f.c]));
  });
  scene.add(flowerMesh);

  const tuftMesh = new THREE.InstancedMesh(
    new THREE.ConeGeometry(0.09, 0.42, 3),
    new THREE.MeshStandardMaterial({ color: '#4f9e3d', roughness: 1, flatShading: true }),
    tufts.length,
  );
  tufts.forEach((f, i) => {
    e.set(0.15, f.r, 0.1);
    m4.compose(v.set(f.x, f.y + 0.15 * f.s, f.z), q.setFromEuler(e), sc.setScalar(f.s));
    tuftMesh.setMatrixAt(i, m4);
  });
  scene.add(tuftMesh);

  return { trees, rocks, small: [flowerMesh, tuftMesh] };
}

function bridgeNear(x, z, pad) {
  for (const b of bridges) {
    const s = (x - b.sx) * b.ux + (z - b.sz) * b.uz;
    const q = -(x - b.sx) * b.uz + (z - b.sz) * b.ux;
    if (s > -3 && s < b.length + 3 && Math.abs(q) < b.halfWidth + pad) return true;
  }
  return false;
}
