// Island layout and the terrain height function shared by rendering and physics.
// Units are meters. Water surface is at y = 0.

export const WATER_Y = 0;
export const TOP = 2.2; // height of the island plateaus
export const SEABED = -4.2;
export const RING_R = 92;
export const N_STATIONS = 13;
export const STEP = (Math.PI * 2) / N_STATIONS;
export const THETA0 = Math.PI / 2;

export const STATION_COLORS = [
  '#ff6b3d', '#ffb400', '#8cc63f', '#1fbfa2', '#2a9df4', '#7b5cff', '#b44dff',
  '#ff4d9d', '#f2464b', '#00b3d6', '#43b05c', '#ff8a1f', '#5c7cfa',
];

function smooth(t) {
  t = Math.min(1, Math.max(0, t));
  return t * t * (3 - 2 * t);
}

export const islands = [];

islands.push({ id: 'hub', x: 0, z: 0, r: 26, w: 12, seed: 1.3, a1: 1.6, a2: 1.0, features: [] });

for (let i = 0; i < N_STATIONS; i++) {
  const a = THETA0 + i * STEP;
  const x = Math.cos(a) * RING_R;
  const z = Math.sin(a) * RING_R;
  islands.push({
    id: 's' + (i + 1),
    idx: i,
    angle: a,
    x,
    z,
    r: 13,
    w: 8,
    seed: 2.1 + i * 1.7,
    a1: 0.8,
    a2: 0.5,
    radial: { x: Math.cos(a), z: Math.sin(a) },
    tangent: { x: -Math.sin(a), z: Math.cos(a) },
    features: [],
  });
}

export const hub = islands[0];
export const stationIslands = islands.slice(1);

// Terrain features: smooth bumps (h > 0) and dips (h < 0).
// A small hill on the hub for rolling balls.
hub.features.push({ x: -15, z: -7, r: 7.5, h: 2.4 });

// Station 5 (training) has the Loss Valley: a big bowl with a small side dip,
// so rolling balls can show both the global and a local minimum.
export const lossValley = (() => {
  const s = stationIslands[4];
  const cx = s.x + s.radial.x * 6.2;
  const cz = s.z + s.radial.z * 6.2;
  // The side dip sits high on the bowl where the slope is gentle, and is deep enough
  // to hold a ball: a true local minimum.
  const side = { x: cx + s.tangent.x * 4.5, z: cz + s.tangent.z * 4.5 };
  s.features.push({ x: cx, z: cz, r: 5.6, h: -1.85 });
  s.features.push({ x: side.x, z: side.z, r: 1.3, h: -0.75 });
  return { x: cx, z: cz, r: 5.6, side };
})();

// Island challenges sit on the free side of each island, around this anchor
// (rad = outward, tan = along the path toward the next island).
export const CH_ANCHOR = { rad: 2.6, tan: 6.6 };
// a = along the tangent, b = outward, both relative to the anchor.
export function chPoint(isl, a, b) {
  return {
    x: isl.x + isl.radial.x * (CH_ANCHOR.rad + b) + isl.tangent.x * (CH_ANCHOR.tan + a),
    z: isl.z + isl.radial.z * (CH_ANCHOR.rad + b) + isl.tangent.z * (CH_ANCHOR.tan + a),
  };
}
// Shallow dips (sorting circles, pressure plates, scale pans) so balls settle inside them.
export const CH_DIPS = {
  1: [[-1.9, 1.0, 1.3], [1.9, 1.0, 1.3]],
  2: [[0, 2.2, 1.1]],
  5: [[-2.2, 0.6, 1.0], [0, 1.2, 1.0], [2.2, 0.6, 1.0]],
  6: [[-1.6, -0.6, 1.0], [1.6, -0.6, 1.0]],
  9: [[-2.4, 1.2, 1.25], [2.4, 1.2, 1.25], [0, -1.6, 1.25]],
  12: [[-2.2, 0.5, 1.15], [2.2, 0.5, 1.15]],
};
for (const [idx, dips] of Object.entries(CH_DIPS)) {
  const isl = stationIslands[idx];
  for (const [a, b, r] of dips) {
    const p = chPoint(isl, a, b);
    isl.features.push({ x: p.x, z: p.z, r: r + 0.35, h: -0.24 });
  }
}

function featureOffset(isl, x, z) {
  let o = 0;
  for (const f of isl.features) {
    const dx = x - f.x;
    const dz = z - f.z;
    const d2 = dx * dx + dz * dz;
    if (d2 < f.r * f.r) {
      const q = 1 - d2 / (f.r * f.r);
      o += f.h * q * q;
    }
  }
  return o;
}

function plateauNoise(isl, x, z) {
  const s = isl.seed;
  return 0.16 * Math.sin(0.31 * x + s) * Math.cos(0.27 * z - s) + 0.08 * Math.sin(0.73 * x + 0.61 * z + 2 * s);
}

export function edgeRadius(isl, phi) {
  return isl.r + isl.a1 * Math.sin(3 * phi + isl.seed) + isl.a2 * Math.sin(5 * phi + 2 * isl.seed);
}

function islandHeight(isl, x, z) {
  const dx = x - isl.x;
  const dz = z - isl.z;
  const d2 = dx * dx + dz * dz;
  const maxR = isl.r + isl.a1 + isl.a2 + isl.w;
  if (d2 > maxR * maxR) return -Infinity;
  const d = Math.sqrt(d2);
  const re = edgeRadius(isl, Math.atan2(dz, dx));
  const plateau = TOP + plateauNoise(isl, x, z) + featureOffset(isl, x, z);
  if (d <= re) return plateau;
  const s = (d - re) / isl.w;
  if (s >= 1) return -Infinity;
  return SEABED + (plateau - SEABED) * (1 - smooth(s));
}

function seabed(x, z) {
  return SEABED + 0.35 * Math.sin(x * 0.05) * Math.cos(z * 0.043) + 0.15 * Math.sin((x + z) * 0.11);
}

export function terrainHeight(x, z) {
  let h = seabed(x, z);
  for (let i = 0; i < islands.length; i++) {
    const v = islandHeight(islands[i], x, z);
    if (v > h) h = v;
  }
  return h;
}

export function terrainNormal(x, z, out) {
  const e = 0.08;
  const hx = terrainHeight(x + e, z) - terrainHeight(x - e, z);
  const hz = terrainHeight(x, z + e) - terrainHeight(x, z - e);
  let nx = -hx / (2 * e);
  let ny = 1;
  let nz = -hz / (2 * e);
  const len = Math.hypot(nx, ny, nz);
  out.x = nx / len;
  out.y = ny / len;
  out.z = nz / len;
  return out;
}

// Which island (if any) contains this point on its plateau.
export function islandAt(x, z) {
  for (const isl of islands) {
    const d = Math.hypot(x - isl.x, z - isl.z);
    if (d < isl.r + 2) return isl;
  }
  return null;
}

// Local helper: point on an island in its radial/tangent frame.
export function local(isl, rad, tan) {
  return {
    x: isl.x + isl.radial.x * rad + isl.tangent.x * tan,
    z: isl.z + isl.radial.z * rad + isl.tangent.z * tan,
  };
}

// Bridges: hub -> station 1, station i -> i+1, and station 13 -> hub (the final bridge).
export const bridges = [];
function addBridge(a, b, unlockedBy) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const len = Math.hypot(dx, dz);
  const ux = dx / len;
  const uz = dz / len;
  const inset = 1.8;
  const sx = a.x + ux * (a.r - inset);
  const sz = a.z + uz * (a.r - inset);
  const ex = b.x - ux * (b.r - inset);
  const ez = b.z - uz * (b.r - inset);
  bridges.push({
    id: a.id + '-' + b.id,
    from: a.id,
    to: b.id,
    sx, sz, ex, ez,
    ux, uz,
    length: Math.hypot(ex - sx, ez - sz),
    halfWidth: 1.5,
    unlockedBy, // null = always open, else station id that must be passed
  });
}
addBridge(hub, stationIslands[0], null);
for (let i = 0; i < N_STATIONS - 1; i++) addBridge(stationIslands[i], stationIslands[i + 1], 's' + (i + 1));
addBridge(stationIslands[N_STATIONS - 1], hub, 's13');

export function bridgeDeckY(br, s) {
  const arch = Math.min(1.3, br.length * 0.045);
  return TOP + 0.14 + arch * Math.sin((Math.PI * s) / br.length);
}

// Deterministic pseudo-random numbers for world decoration.
export function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}
