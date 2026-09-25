import * as THREE from 'three';
import { terrainHeight, terrainNormal, WATER_Y } from '../world/layout.js';

// Real-world constants (SI units).
export const G = 9.81; // m/s^2
export const RHO_AIR = 1.225; // kg/m^3
export const RHO_WATER = 1000; // kg/m^3
export const PLAYER_MASS = 30; // kg, Bip is a light robot

const _n = new THREE.Vector3();
const _v = new THREE.Vector3();

// Static world colliders are vertical shapes: circles and rotated boxes with a
// bottom (y0) and top (y1). Surfaces are extra walkable floors such as bridges.
export class Physics {
  constructor() {
    this.colliders = [];
    this.surfaces = [];
    this.balls = [];
    this.onBallHit = null;
  }

  addCircle(x, z, r, y0, y1, opts = {}) {
    const c = { type: 'circle', x, z, r, y0, y1, walkable: !!opts.walkable, enabled: true };
    this.colliders.push(c);
    return c;
  }

  addBox(x, z, hx, hz, rot, y0, y1, opts = {}) {
    const c = {
      type: 'box', x, z, hx, hz, rot, y0, y1,
      cos: Math.cos(rot), sin: Math.sin(rot),
      br: Math.hypot(hx, hz),
      walkable: !!opts.walkable, enabled: true,
    };
    this.colliders.push(c);
    return c;
  }

  addSurface(s) {
    s.enabled = s.enabled ?? true;
    this.surfaces.push(s);
    return s;
  }

  // Highest floor under (x,z) that is not above feetY + stepUp.
  groundAt(x, z, feetY, stepUp = 0.45, out = null) {
    let g = terrainHeight(x, z);
    let kind = 'terrain';
    for (const s of this.surfaces) {
      if (!s.enabled) continue;
      if (x < s.minX || x > s.maxX || z < s.minZ || z > s.maxZ) continue;
      const h = s.heightAt(x, z);
      if (h != null && h <= feetY + stepUp && h > g) {
        g = h;
        kind = 'surface';
      }
    }
    for (const c of this.colliders) {
      if (!c.enabled || !c.walkable) continue;
      if (c.y1 > feetY + stepUp || c.y1 <= g) continue;
      if (inside2D(c, x, z, 0)) {
        g = c.y1;
        kind = 'collider';
      }
    }
    if (out) out.kind = kind;
    return g;
  }

  // Push a vertical cylinder (radius, feetY..headY) out of the colliders.
  // Returns the summed push normal (x,z) so callers can cancel velocity into walls.
  pushOut(pos, radius, feetY, headY, stepUp = 0.4) {
    let nx = 0;
    let nz = 0;
    for (const c of this.colliders) {
      if (!c.enabled) continue;
      if (headY <= c.y0 || feetY >= c.y1 - (c.walkable ? stepUp : 0)) continue;
      const qx = pos.x - c.x;
      const qz = pos.z - c.z;
      const reach = (c.type === 'circle' ? c.r : c.br) + radius;
      if (qx * qx + qz * qz > reach * reach) continue;
      if (c.type === 'circle') {
        const dx = pos.x - c.x;
        const dz = pos.z - c.z;
        const rr = c.r + radius;
        const d2 = dx * dx + dz * dz;
        if (d2 < rr * rr) {
          const d = Math.sqrt(d2) || 0.0001;
          const push = rr - d;
          const ux = dx / d;
          const uz = dz / d;
          pos.x += ux * push;
          pos.z += uz * push;
          nx += ux;
          nz += uz;
        }
      } else {
        // Transform into the box's local frame.
        const dx = pos.x - c.x;
        const dz = pos.z - c.z;
        const lx = dx * c.cos + dz * c.sin;
        const lz = -dx * c.sin + dz * c.cos;
        const cx = Math.max(-c.hx, Math.min(c.hx, lx));
        const cz = Math.max(-c.hz, Math.min(c.hz, lz));
        let ox = lx - cx;
        let oz = lz - cz;
        const d2 = ox * ox + oz * oz;
        let pushLx = 0;
        let pushLz = 0;
        if (d2 > 1e-10) {
          if (d2 < radius * radius) {
            const d = Math.sqrt(d2);
            const push = radius - d;
            pushLx = (ox / d) * push;
            pushLz = (oz / d) * push;
          }
        } else {
          // Center is inside the box: leave by the nearest face.
          const px = c.hx - Math.abs(lx);
          const pz = c.hz - Math.abs(lz);
          if (px < pz) pushLx = Math.sign(lx || 1) * (px + radius);
          else pushLz = Math.sign(lz || 1) * (pz + radius);
        }
        if (pushLx || pushLz) {
          const wx = pushLx * c.cos - pushLz * c.sin;
          const wz = pushLx * c.sin + pushLz * c.cos;
          pos.x += wx;
          pos.z += wz;
          const l = Math.hypot(wx, wz) || 1;
          nx += wx / l;
          nz += wz / l;
        }
      }
    }
    return { x: nx, z: nz };
  }

  addBall(ball) {
    this.balls.push(ball);
    return ball;
  }

  removeBall(ball) {
    const i = this.balls.indexOf(ball);
    if (i >= 0) this.balls.splice(i, 1);
  }

  step(dt, player) {
    const balls = this.balls;
    for (const b of balls) if (!b.sleeping) b.integrate(dt, this);
    // Ball vs ball (3D spheres, momentum-conserving impulses).
    for (let i = 0; i < balls.length; i++) {
      const a = balls[i];
      for (let j = i + 1; j < balls.length; j++) {
        const b = balls[j];
        if (a.sleeping && b.sleeping) continue;
        _v.subVectors(b.pos, a.pos);
        const rr = a.r + b.r;
        const d2 = _v.lengthSq();
        if (d2 >= rr * rr || d2 < 1e-12) continue;
        const d = Math.sqrt(d2);
        _n.copy(_v).divideScalar(d);
        const pen = rr - d;
        const ia = 1 / a.mass;
        const ib = 1 / b.mass;
        a.pos.addScaledVector(_n, (-pen * ia) / (ia + ib));
        b.pos.addScaledVector(_n, (pen * ib) / (ia + ib));
        const vrel = _v.subVectors(b.vel, a.vel).dot(_n);
        if (vrel < 0) {
          const e = Math.min(a.restitution, b.restitution);
          const j = (-(1 + e) * vrel) / (ia + ib);
          a.vel.addScaledVector(_n, -j * ia);
          b.vel.addScaledVector(_n, j * ib);
          a.wake();
          b.wake();
          if (Math.abs(vrel) > 1.5 && this.onBallHit) this.onBallHit(Math.abs(vrel));
        }
      }
    }
    // Player vs balls.
    if (player) {
      for (const b of balls) {
        const dx = b.pos.x - player.pos.x;
        const dz = b.pos.z - player.pos.z;
        const rr = b.r + player.radius;
        const d2 = dx * dx + dz * dz;
        if (d2 >= rr * rr) continue;
        if (b.pos.y + b.r < player.pos.y + 0.05 || b.pos.y - b.r > player.pos.y + player.height) continue;
        const d = Math.sqrt(d2) || 0.0001;
        const nx = dx / d;
        const nz = dz / d;
        const pen = rr - d;
        const ib = 1 / b.mass;
        const ip = 1 / PLAYER_MASS;
        b.pos.x += (nx * pen * ib) / (ib + ip);
        b.pos.z += (nz * pen * ib) / (ib + ip);
        player.pos.x -= (nx * pen * ip) / (ib + ip);
        player.pos.z -= (nz * pen * ip) / (ib + ip);
        const vrel = (b.vel.x - player.vel.x) * nx + (b.vel.z - player.vel.z) * nz;
        if (vrel < 0) {
          const e = 0.5;
          const j = (-(1 + e) * vrel) / (ib + ip);
          b.vel.x += nx * j * ib;
          b.vel.z += nz * j * ib;
          player.vel.x -= nx * j * ip;
          player.vel.z -= nz * j * ip;
          b.wake();
        }
      }
    }
  }
}

function inside2D(c, x, z, margin) {
  if (c.type === 'circle') {
    const dx = x - c.x;
    const dz = z - c.z;
    return dx * dx + dz * dz <= (c.r + margin) * (c.r + margin);
  }
  const dx = x - c.x;
  const dz = z - c.z;
  const lx = dx * c.cos + dz * c.sin;
  const lz = -dx * c.sin + dz * c.cos;
  return Math.abs(lx) <= c.hx + margin && Math.abs(lz) <= c.hz + margin;
}

// A rigid sphere with real mass, air drag, buoyancy and rolling.
// inertia: 2/5 for a solid ball, 2/3 for a hollow shell.
export class Ball {
  constructor(opts) {
    this.r = opts.r ?? 0.2;
    this.mass = opts.mass ?? 0.5;
    this.restitution = opts.restitution ?? 0.6;
    this.rollResist = opts.rollResist ?? 0.02; // rolling resistance coefficient
    this.cd = opts.cd ?? 0.47; // drag coefficient of a sphere
    this.inertia = opts.inertia ?? 0.4;
    this.pos = new THREE.Vector3(opts.x ?? 0, opts.y ?? 5, opts.z ?? 0);
    this.vel = new THREE.Vector3();
    this.omegaAxis = new THREE.Vector3(1, 0, 0);
    this.omega = 0;
    this.mesh = opts.mesh || null;
    this.sleeping = false;
    this.still = 0;
    this.onGround = false;
    this.inWater = false;
    this.home = this.pos.clone();
    this.name = opts.name || '';
    this.onLand = null;
    this.onWater = null;
    this.userData = {};
    const area = Math.PI * this.r * this.r;
    this.kAir = (0.5 * RHO_AIR * this.cd * area) / this.mass;
    this.kWater = (0.5 * RHO_WATER * this.cd * area) / this.mass;
    this.volume = (4 / 3) * Math.PI * this.r ** 3;
  }

  get density() {
    return this.mass / this.volume;
  }

  wake() {
    this.sleeping = false;
    this.still = 0;
  }

  reset() {
    this.pos.copy(this.home);
    this.vel.set(0, 0, 0);
    this.omega = 0;
    this.wake();
  }

  integrate(dt, world) {
    const v = this.vel;
    const speed = v.length();
    // Gravity.
    v.y -= G * dt;
    // Quadratic air drag: a = (1/2 rho Cd A / m) v^2, opposite to motion.
    if (speed > 0.01) {
      const f = Math.min(1, this.kAir * speed * dt);
      v.multiplyScalar(1 - f);
    }
    // Buoyancy (Archimedes): the fluid pushes up with its density * displaced volume * g.
    // Water pushes on the submerged part, air on the rest (it matters for a light beach ball).
    const depth = WATER_Y - (this.pos.y - this.r);
    const wasInWater = this.inWater;
    this.inWater = depth > 0;
    let vSub = 0;
    if (this.inWater) {
      const hh = Math.min(depth, 2 * this.r);
      vSub = (Math.PI * hh * hh * (3 * this.r - hh)) / 3;
    }
    v.y += ((RHO_AIR * (this.volume - vSub) * G) / this.mass) * dt;
    if (this.inWater) {
      const h = Math.min(depth, 2 * this.r);
      v.y += ((RHO_WATER * vSub * G) / this.mass) * dt;
      const frac = h / (2 * this.r);
      const f = Math.min(0.9, this.kWater * frac * speed * dt + 0.8 * frac * dt);
      v.multiplyScalar(1 - f);
      if (!wasInWater && this.onWater) this.onWater(this, speed);
    }
    this.pos.addScaledVector(v, dt);

    // Ground contact.
    const g = world.groundAt(this.pos.x, this.pos.z, this.pos.y - this.r, 0.25, groundInfo);
    if (groundInfo.kind === 'terrain') terrainNormal(this.pos.x, this.pos.z, _n);
    else _n.set(0, 1, 0);
    const gap = (this.pos.y - g) * _n.y;
    const wasOnGround = this.onGround;
    this.onGround = false;
    if (gap < this.r + 0.02) {
      const pen = this.r - gap;
      if (pen > 0) this.pos.addScaledVector(_n, pen);
      const vn = v.dot(_n);
      if (vn < 0) {
        if (vn < -0.8) {
          v.addScaledVector(_n, -(1 + this.restitution) * vn);
          if (vn < -2 && world.onBallHit) world.onBallHit(-vn);
          if (!wasOnGround && this.onLand) this.onLand(this);
        } else {
          v.addScaledVector(_n, -vn);
        }
      }
      if (gap < this.r + 0.02) this.onGround = v.dot(_n) < 0.5;
      if (this.onGround) {
        // Rolling without slipping: only a fraction of the downhill pull speeds
        // a ball up, the rest spins it. a = g sin(theta) / (1 + I/(m r^2)).
        const roll = 1 / (1 + this.inertia);
        const gtx = -G * -_n.x * _n.y;
        const gtz = -G * -_n.z * _n.y;
        const gty = -G * (1 - _n.y * _n.y);
        v.x -= (1 - roll) * gtx * dt;
        v.y -= (1 - roll) * gty * dt;
        v.z -= (1 - roll) * gtz * dt;
        // Rolling resistance.
        const vt = Math.hypot(v.x, v.z);
        if (vt > 0) {
          const dec = Math.min(vt, this.rollResist * G * dt);
          v.x -= (v.x / vt) * dec;
          v.z -= (v.z / vt) * dec;
        }
      }
    }

    // Walls.
    const push = world.pushOut(this.pos, this.r, this.pos.y - this.r, this.pos.y + this.r, 0.1);
    if (push.x || push.z) {
      const l = Math.hypot(push.x, push.z);
      const nx = push.x / l;
      const nz = push.z / l;
      const vn = v.x * nx + v.z * nz;
      if (vn < 0) {
        v.x -= (1 + this.restitution) * vn * nx;
        v.z -= (1 + this.restitution) * vn * nz;
        if (vn < -2 && world.onBallHit) world.onBallHit(-vn);
      }
    }

    // Spin: rolling balls turn at omega = v / r; in the air they keep spinning.
    const vt = Math.hypot(v.x, v.z);
    if (this.onGround && vt > 0.001) {
      this.omegaAxis.set(v.z, 0, -v.x).normalize();
      this.omega = vt / this.r;
    } else if (this.inWater) {
      this.omega *= 1 - Math.min(1, 2 * dt);
    }

    // Sleep when resting.
    if (speed < 0.06 && (this.onGround || this.inWater)) {
      this.still += dt;
      if (this.still > 1.2 && this.onGround) {
        this.sleeping = true;
        v.set(0, 0, 0);
        this.omega = 0;
      }
    } else this.still = 0;

    if (this.pos.y < -30) this.reset();
  }

  syncMesh(dt) {
    if (!this.mesh) return;
    this.mesh.position.copy(this.pos);
    if (this.omega > 0.0001) {
      _q.setFromAxisAngle(this.omegaAxis, this.omega * dt);
      this.mesh.quaternion.premultiply(_q);
    }
  }

  kick(dirX, dirZ, impulse, up = 0.5) {
    // Same impulse J gives a change in speed dv = J / m (Newton's second law).
    const dv = Math.min(16, impulse / this.mass);
    this.vel.x += dirX * dv;
    this.vel.z += dirZ * dv;
    this.vel.y += dv * up;
    this.wake();
    return dv;
  }
}

const groundInfo = { kind: 'terrain' };
const _q = new THREE.Quaternion();
