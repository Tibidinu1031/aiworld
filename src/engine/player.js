import * as THREE from 'three';
import { G } from './physics.js';
import { WATER_Y } from '../world/layout.js';
import { sfx } from '../audio.js';

// Bip's movement. Real gravity (9.81 m/s^2), a jump of about 1.3 m, and
// acceleration limited like a real wheeled robot.
const WALK = 4.2; // m/s
const RUN = 7.2; // m/s
const JUMP_V = 5.1; // m/s  -> apex = v^2 / 2g = 1.33 m
const GROUND_ACCEL = 22; // m/s^2
const AIR_ACCEL = 5;

export class Player {
  constructor(physics, robot) {
    this.physics = physics;
    this.robot = robot;
    this.pos = new THREE.Vector3(0, 3, 13.5);
    this.vel = new THREE.Vector3();
    this.radius = 0.42;
    this.height = 1.45;
    this.onGround = false;
    this.coyote = 0;
    this.jumpBuffer = 0;
    this.yaw = Math.PI; // facing -z
    this.lastSafe = this.pos.clone();
    this.safeTimer = 0;
    this.prevForwardSpeed = 0;
    this.fallSpeed = 0;
    this.inWater = false;
    this.onSplash = null;
    this.frozen = false;
    this.stepTimer = 0;
  }

  teleport(x, y, z, yaw) {
    this.pos.set(x, y, z);
    this.vel.set(0, 0, 0);
    if (yaw != null) this.yaw = yaw;
    this.lastSafe.copy(this.pos);
    this.onGround = false;
  }

  update(dt, input, camYaw) {
    const ax = this.frozen ? { x: 0, y: 0 } : input.axis();
    // Camera-relative direction. Forward is where the camera looks.
    const fx = -Math.sin(camYaw);
    const fz = -Math.cos(camYaw);
    const rx = -fz;
    const rz = fx;
    let dx = fx * ax.y + rx * ax.x;
    let dz = fz * ax.y + rz * ax.x;
    const mag = Math.hypot(dx, dz);
    const running = input.down('ShiftLeft') || input.down('ShiftRight');
    let speed = (running ? RUN : WALK) * Math.min(1, mag);
    if (this.inWater) speed *= 0.45;
    if (mag > 0.001) {
      dx /= mag;
      dz /= mag;
    }
    const tvx = dx * speed;
    const tvz = dz * speed;
    const accel = (this.onGround ? GROUND_ACCEL : AIR_ACCEL) * dt;
    const ddx = tvx - this.vel.x;
    const ddz = tvz - this.vel.z;
    const dl = Math.hypot(ddx, ddz);
    if (dl > accel) {
      this.vel.x += (ddx / dl) * accel;
      this.vel.z += (ddz / dl) * accel;
    } else {
      this.vel.x = tvx;
      this.vel.z = tvz;
    }

    // Jumping (with a little forgiveness).
    if (!this.frozen && input.pressed('Space')) this.jumpBuffer = 0.15;
    this.jumpBuffer -= dt;
    this.coyote -= dt;
    let jumped = false;
    if (this.jumpBuffer > 0 && (this.onGround || this.coyote > 0) && !this.inWater) {
      this.vel.y = JUMP_V;
      this.onGround = false;
      this.coyote = 0;
      this.jumpBuffer = 0;
      jumped = true;
      sfx('jump');
    }

    // Gravity and motion (fixed sub-steps for stable collisions).
    const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / steps;
    let landed = 0;
    for (let i = 0; i < steps; i++) {
      this.vel.y -= G * h;
      this.pos.addScaledVector(this.vel, h);
      const push = this.physics.pushOut(this.pos, this.radius, this.pos.y, this.pos.y + this.height);
      if (push.x || push.z) {
        const l = Math.hypot(push.x, push.z);
        const nx = push.x / l;
        const nz = push.z / l;
        const vn = this.vel.x * nx + this.vel.z * nz;
        if (vn < 0) {
          this.vel.x -= vn * nx;
          this.vel.z -= vn * nz;
        }
      }
      const snap = this.onGround && this.vel.y <= 0.01 ? 0.35 : 0;
      const g = this.physics.groundAt(this.pos.x, this.pos.z, this.pos.y + snap);
      if (this.pos.y <= g + snap && this.vel.y <= 0.01) {
        if (!this.onGround && this.vel.y < -3) landed = Math.max(landed, -this.vel.y);
        this.pos.y = g;
        this.vel.y = 0;
        this.onGround = true;
        this.coyote = 0.12;
      } else if (this.pos.y > g + snap) {
        this.onGround = false;
      }
    }
    if (landed) sfx('land');

    // Water: Bip is metal and sinks, so wading slows him and deep water resets him.
    this.inWater = this.pos.y < WATER_Y - 0.15;
    if (this.pos.y < WATER_Y - 1.1) {
      if (this.onSplash) this.onSplash(this.pos.clone());
      this.teleport(this.lastSafe.x, this.lastSafe.y + 0.5, this.lastSafe.z);
      return { speed: 0 };
    }
    this.safeTimer -= dt;
    if (this.onGround && this.pos.y > 1.2 && this.safeTimer <= 0) {
      this.lastSafe.copy(this.pos);
      this.safeTimer = 0.4;
    }

    // Face the direction of travel.
    const hs = Math.hypot(this.vel.x, this.vel.z);
    let turn = 0;
    if (hs > 0.3) {
      const want = Math.atan2(this.vel.x, this.vel.z);
      let d = want - this.yaw;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      turn = d;
      this.yaw += d * Math.min(1, dt * 10);
    }
    const fwdSpeed = this.vel.x * Math.sin(this.yaw) + this.vel.z * Math.cos(this.yaw);
    const fwdAccel = (fwdSpeed - this.prevForwardSpeed) / Math.max(dt, 1e-4);
    this.prevForwardSpeed = fwdSpeed;

    if (this.onGround && hs > 0.5) {
      this.stepTimer -= dt * hs;
      if (this.stepTimer < 0) {
        this.stepTimer = 1.8;
      }
    }

    this.robot.group.position.copy(this.pos);
    this.robot.group.rotation.y = this.yaw;
    this.robot.update(dt, {
      speed: hs,
      signedSpeed: fwdSpeed,
      accel: Math.max(-12, Math.min(12, fwdAccel)),
      onGround: this.onGround,
      landed,
      jumped,
      turn,
    });
    return { speed: hs, landed };
  }
}
