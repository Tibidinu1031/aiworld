import * as THREE from 'three';
import { bridges, bridgeDeckY } from './layout.js';
import { sfx } from '../audio.js';

const PLANK = 0.55;

export function buildBridges(scene, physics) {
  const plankGeo = new THREE.BoxGeometry(3.2, 0.14, PLANK * 0.86);
  const plankMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85, flatShading: true });
  const postGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.25, 6);
  postGeo.translate(0, 0.62, 0);
  const postMat = new THREE.MeshStandardMaterial({ color: '#7a4f33', roughness: 0.9 });
  const railGeo = new THREE.CylinderGeometry(0.05, 0.05, 1, 6);
  railGeo.rotateX(Math.PI / 2);
  const railMat = new THREE.MeshStandardMaterial({ color: '#c9874f', roughness: 0.8 });
  const ghostMat = new THREE.MeshBasicMaterial({
    color: '#6fe7ff',
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const v = new THREE.Vector3();
  const s1 = new THREE.Vector3(1, 1, 1);
  const col = new THREE.Color();
  const items = [];

  for (const br of bridges) {
    const L = br.length;
    const n = Math.floor(L / PLANK);
    const yaw = Math.atan2(br.ux, br.uz); // plank long side across the bridge
    const planks = new THREE.InstancedMesh(plankGeo, plankMat, n);
    planks.castShadow = true;
    planks.receiveShadow = true;
    const targets = [];
    for (let i = 0; i < n; i++) {
      const s = (i + 0.5) * PLANK;
      const y = bridgeDeckY(br, s) - 0.07;
      const slope = (bridgeDeckY(br, s + 0.1) - bridgeDeckY(br, s - 0.1)) / 0.2;
      const eul = new THREE.Euler(-Math.atan(slope), yaw, 0, 'YXZ');
      const pos = new THREE.Vector3(br.sx + br.ux * s, y, br.sz + br.uz * s);
      const quat = new THREE.Quaternion().setFromEuler(eul);
      targets.push({ pos, quat });
      m4.compose(pos, quat, s1);
      planks.setMatrixAt(i, m4);
      const tone = 0.85 + ((i * 7919) % 13) / 60;
      planks.setColorAt(i, col.set('#b37a4c').multiplyScalar(tone));
    }
    scene.add(planks);

    // Posts and rails.
    const postCount = Math.floor(L / 2.2) + 1;
    const posts = new THREE.InstancedMesh(postGeo, postMat, postCount * 2);
    const rails = new THREE.InstancedMesh(railGeo, railMat, (postCount - 1) * 2);
    const px = -br.uz;
    const pz = br.ux;
    const postPos = [[], []];
    for (let i = 0; i < postCount; i++) {
      const s = Math.min(L, i * 2.2);
      const y = bridgeDeckY(br, s) - 0.02;
      for (const side of [0, 1]) {
        const sgn = side ? 1 : -1;
        const p = new THREE.Vector3(br.sx + br.ux * s + px * sgn * 1.55, y, br.sz + br.uz * s + pz * sgn * 1.55);
        postPos[side].push(p);
        m4.compose(p, q.identity(), s1);
        posts.setMatrixAt(i * 2 + side, m4);
      }
    }
    let ri = 0;
    for (const side of [0, 1]) {
      for (let i = 0; i < postCount - 1; i++) {
        const a = postPos[side][i].clone();
        const b = postPos[side][i + 1].clone();
        a.y += 1.12;
        b.y += 1.12;
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const len = a.distanceTo(b);
        const dir = b.clone().sub(a).normalize();
        q.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
        m4.compose(mid, q, v.set(1, 1, len));
        rails.setMatrixAt(ri++, m4);
      }
    }
    posts.castShadow = true;
    rails.castShadow = true;
    scene.add(posts, rails);

    // Hologram outline shown before the bridge is built.
    const ghostGeo = new THREE.BufferGeometry();
    const verts = [];
    const segs = 40;
    for (let i = 0; i < segs; i++) {
      const sa = (i / segs) * L;
      const sb = ((i + 1) / segs) * L;
      const ya = bridgeDeckY(br, sa);
      const yb = bridgeDeckY(br, sb);
      const ax = br.sx + br.ux * sa;
      const az = br.sz + br.uz * sa;
      const bx = br.sx + br.ux * sb;
      const bz = br.sz + br.uz * sb;
      const w = 1.5;
      verts.push(
        ax - px * w, ya, az - pz * w, bx - px * w, yb, bz - pz * w, bx + px * w, yb, bz + pz * w,
        ax - px * w, ya, az - pz * w, bx + px * w, yb, bz + pz * w, ax + px * w, ya, az + pz * w,
      );
    }
    ghostGeo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const ghost = new THREE.Mesh(ghostGeo, ghostMat);
    scene.add(ghost);

    // Physics: walkable deck + side rails over the water.
    const surface = physics.addSurface({
      minX: Math.min(br.sx, br.ex) - 2,
      maxX: Math.max(br.sx, br.ex) + 2,
      minZ: Math.min(br.sz, br.ez) - 2,
      maxZ: Math.max(br.sz, br.ez) + 2,
      heightAt(x, z) {
        const s = (x - br.sx) * br.ux + (z - br.sz) * br.uz;
        const qd = -(x - br.sx) * br.uz + (z - br.sz) * br.ux;
        if (s < 0 || s > L || Math.abs(qd) > br.halfWidth) return null;
        return bridgeDeckY(br, s);
      },
    });
    const rot = Math.atan2(br.uz, br.ux);
    const railLen = Math.max(1, L - 6);
    const railCols = [-1, 1].map((sgn) =>
      physics.addBox(
        br.sx + br.ux * (L / 2) + px * sgn * 1.62,
        br.sz + br.uz * (L / 2) + pz * sgn * 1.62,
        railLen / 2,
        0.08,
        rot,
        -10,
        bridgeDeckY(br, L / 2) + 1.2,
      ),
    );

    const item = {
      bridge: br,
      built: false,
      building: -1,
      setBuilt(on, animate = false) {
        if (on && animate) {
          this.building = 0;
          planks.count = 0;
          planks.visible = true;
          posts.visible = rails.visible = false;
          ghost.visible = true;
          return;
        }
        this.built = on;
        this.building = -1;
        planks.count = n;
        for (let i = 0; i < n; i++) {
          m4.compose(targets[i].pos, targets[i].quat, s1);
          planks.setMatrixAt(i, m4);
        }
        planks.instanceMatrix.needsUpdate = true;
        planks.visible = on;
        posts.visible = rails.visible = on;
        ghost.visible = !on;
        surface.enabled = on;
        railCols.forEach((c) => (c.enabled = on));
      },
      update(dt) {
        if (this.building < 0) return;
        const prev = this.building;
        this.building += dt * 26; // planks per second
        const shown = Math.min(n, Math.floor(this.building) + 1);
        planks.count = shown;
        for (let i = Math.max(0, Math.floor(prev) - 8); i < shown; i++) {
          const age = this.building - i;
          const fall = Math.max(0, 1 - age / 6);
          v.copy(targets[i].pos);
          v.y += fall * fall * 3;
          m4.compose(v, targets[i].quat, s1);
          planks.setMatrixAt(i, m4);
        }
        planks.instanceMatrix.needsUpdate = true;
        if (Math.floor(this.building / 3) !== Math.floor(prev / 3) && this.building < n) sfx('build');
        if (this.building >= n + 6) this.setBuilt(true, false);
      },
    };
    item.setBuilt(false);
    items.push(item);
  }

  return {
    items,
    byUnlock(stationId) {
      return items.filter((i) => i.bridge.unlockedBy === stationId);
    },
    update(dt) {
      for (const it of items) it.update(dt);
    },
  };
}
