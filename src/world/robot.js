import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Bip: a friendly robot balancing on a ball wheel, like a real self-balancing robot.
// It leans into acceleration (an inverted pendulum) and its wheel turns at w = v / r.
export const WHEEL_R = 0.26;

function stripeTexture(base, stripe) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = base;
  g.fillRect(0, 0, 128, 64);
  g.fillStyle = stripe;
  for (let i = 0; i < 8; i++) g.fillRect(i * 16, 0, 7, 64);
  g.fillStyle = 'rgba(255,255,255,0.15)';
  g.fillRect(0, 28, 128, 8);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createRobot(opts = {}) {
  const hologram = !!opts.hologram;
  const accent = new THREE.Color(opts.accent || '#ff6b3d');
  const bodyColor = new THREE.Color(opts.body || '#f4f6fb');
  const eyeColor = new THREE.Color(opts.eye || '#5ff3ff');
  const scale = opts.scale || 1;

  const mat = (color, extra = {}) =>
    hologram
      ? new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false, ...extra })
      : new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.1, ...extra });

  const white = mat(bodyColor);
  const orange = mat(accent);
  const dark = hologram ? mat('#2a1d5c') : new THREE.MeshStandardMaterial({ color: '#1b2238', roughness: 0.2, metalness: 0.3 });
  const glow = new THREE.MeshBasicMaterial({ color: eyeColor });
  const tipGlow = new THREE.MeshBasicMaterial({ color: opts.tip || '#ffd23f' });

  const root = new THREE.Group();
  const inner = new THREE.Group();
  inner.scale.setScalar(scale);
  root.add(inner);

  // Wheel or hover base.
  const wheelPivot = new THREE.Group();
  wheelPivot.position.y = WHEEL_R;
  inner.add(wheelPivot);
  let wheel = null;
  if (!opts.hover) {
    wheel = new THREE.Mesh(
      new THREE.SphereGeometry(WHEEL_R, 24, 16),
      new THREE.MeshStandardMaterial({ map: stripeTexture('#2b3150', '#' + accent.getHexString()), roughness: 0.6 }),
    );
    wheel.rotation.z = Math.PI / 2; // stripes run around the rolling direction
    const wheelSpin = new THREE.Group();
    wheelSpin.add(wheel);
    wheelPivot.add(wheelSpin);
    wheel = wheelSpin;
  } else {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.1, 24), mat(accent));
    pad.position.y = -WHEEL_R + 0.08;
    wheelPivot.add(pad);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.4, 0.03, 8, 32),
      new THREE.MeshBasicMaterial({ color: eyeColor, transparent: true, opacity: 0.7 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -WHEEL_R + 0.02;
    wheelPivot.add(ring);
  }

  // Everything above the wheel leans around the wheel axle.
  const body = new THREE.Group();
  body.position.y = WHEEL_R;
  inner.add(body);

  const fork = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.26, 12), dark);
  fork.position.y = 0.2;
  body.add(fork);

  const torso = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 18), white);
  torso.scale.set(1, 0.95, 0.88);
  torso.position.y = 0.52;
  body.add(torso);

  const belly = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), orange);
  belly.position.set(0, 0.5, 0.3);
  belly.rotation.x = -0.08;
  body.add(belly);

  const chest = new THREE.Mesh(new THREE.CircleGeometry(0.07, 20), new THREE.MeshBasicMaterial({ color: '#7bf7c9' }));
  chest.position.set(0, 0.52, 0.312);
  chest.rotation.x = -0.08;
  body.add(chest);

  // Head.
  const headPivot = new THREE.Group();
  headPivot.position.y = 0.98;
  body.add(headPivot);
  const head = new THREE.Mesh(new RoundedBoxGeometry(0.66, 0.5, 0.52, 5, 0.16), white);
  headPivot.add(head);
  const screen = new THREE.Mesh(new RoundedBoxGeometry(0.52, 0.34, 0.06, 4, 0.08), dark);
  screen.position.z = 0.25;
  headPivot.add(screen);

  const eyes = new THREE.Group();
  eyes.position.z = 0.285;
  headPivot.add(eyes);
  const eyeGeo = new THREE.CapsuleGeometry(0.045, 0.07, 4, 10);
  const eyeL = new THREE.Mesh(eyeGeo, glow);
  const eyeR = new THREE.Mesh(eyeGeo, glow);
  eyeL.position.set(-0.11, 0.03, 0);
  eyeR.position.set(0.11, 0.03, 0);
  eyes.add(eyeL, eyeR);

  const happy = new THREE.Group();
  happy.position.z = 0.285;
  happy.visible = false;
  headPivot.add(happy);
  const arcGeo = new THREE.TorusGeometry(0.055, 0.018, 6, 16, Math.PI);
  const hL = new THREE.Mesh(arcGeo, glow);
  const hR = new THREE.Mesh(arcGeo, glow);
  hL.position.set(-0.11, 0.01, 0);
  hR.position.set(0.11, 0.01, 0);
  happy.add(hL, hR);

  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.014, 6, 16, Math.PI), glow);
  mouth.rotation.z = Math.PI;
  mouth.position.set(0, -0.08, 0.285);
  headPivot.add(mouth);

  for (const sx of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16), orange);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(sx * 0.35, 0, 0);
    headPivot.add(ear);
  }

  if (opts.glasses) {
    const gm = new THREE.MeshBasicMaterial({ color: '#ffe082' });
    for (const sx of [-1, 1]) {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.012, 6, 20), gm);
      rim.position.set(sx * 0.11, 0.03, 0.3);
      headPivot.add(rim);
    }
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.012, 0.012), gm);
    bridge.position.set(0, 0.05, 0.3);
    headPivot.add(bridge);
  }

  // Antenna on a spring.
  const antPivot = new THREE.Group();
  antPivot.position.y = 0.25;
  headPivot.add(antPivot);
  const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.28, 8), dark);
  stalk.position.y = 0.14;
  antPivot.add(stalk);
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 10), tipGlow);
  tip.position.y = 0.3;
  antPivot.add(tip);

  // Arms.
  const arms = [];
  for (const sx of [-1, 1]) {
    const shoulder = new THREE.Group();
    shoulder.position.set(sx * 0.33, 0.66, 0);
    body.add(shoulder);
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.22, 4, 10), white);
    arm.position.y = -0.15;
    shoulder.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.075, 14, 10), orange);
    hand.position.y = -0.31;
    shoulder.add(hand);
    shoulder.rotation.z = sx * 0.25;
    arms.push({ shoulder, sx });
  }

  root.traverse((o) => {
    if (o.isMesh && !hologram) {
      o.castShadow = true;
      o.receiveShadow = false;
    }
  });

  // --- animation state ---
  let t = Math.random() * 10;
  let lean = 0;
  let leanVel = 0;
  let antX = 0;
  let antXv = 0;
  let antZ = 0;
  let antZv = 0;
  let squash = 1;
  let squashV = 0;
  let blink = 0;
  let nextBlink = 2 + Math.random() * 3;
  let moodTimer = 0;
  let wheelAngle = 0;
  let talk = 0;
  let wave = 0;

  function update(dt, s = {}) {
    t += dt;
    const speed = s.speed || 0;
    const accel = s.accel || 0; // forward acceleration m/s^2
    // Inverted pendulum lean toward the acceleration.
    const targetLean = Math.max(-0.4, Math.min(0.4, accel * 0.045 + speed * 0.02));
    leanVel += ((targetLean - lean) * 60 - leanVel * 11) * dt;
    lean += leanVel * dt;
    body.rotation.x = lean;
    // Wheel: omega = v / r.
    if (wheel) {
      wheelAngle += ((s.signedSpeed ?? speed) / WHEEL_R) * dt;
      wheel.rotation.x = wheelAngle;
    }
    // Antenna: damped spring driven by the lean motion.
    antXv += (-antX * 90 - antXv * 5 - leanVel * 25) * dt;
    antX += antXv * dt;
    antZv += (-antZ * 90 - antZv * 5 - (s.turn || 0) * 3) * dt;
    antZ += antZv * dt;
    antPivot.rotation.x = antX;
    antPivot.rotation.z = antZ;
    // Squash and stretch on landing / jumping.
    if (s.landed) squashV -= Math.min(4, s.landed * 0.35);
    if (s.jumped) squashV += 2.2;
    squashV += (-(squash - 1) * 160 - squashV * 12) * dt;
    squash += squashV * dt;
    body.scale.set(1 / Math.sqrt(Math.max(0.6, squash)), squash, 1 / Math.sqrt(Math.max(0.6, squash)));
    // Head bob and look.
    headPivot.position.y = 0.98 + Math.sin(t * 2.2) * 0.012 + (s.onGround === false ? 0.02 : 0);
    headPivot.rotation.y = Math.sin(t * 0.6) * 0.08 + (s.lookYaw || 0);
    headPivot.rotation.z = Math.sin(t * 0.9) * 0.03;
    // Arms swing with speed.
    for (const a of arms) {
      const swing = Math.sin(t * (4 + speed * 1.5)) * Math.min(0.6, speed * 0.12);
      a.shoulder.rotation.x = a.sx * swing - lean * 0.8;
      let lift = s.onGround === false ? 1.2 : 0.25;
      if (wave > 0 && a.sx === 1) {
        a.shoulder.rotation.x = 0;
        lift = 2.6 + Math.sin(t * 14) * 0.3;
      }
      a.shoulder.rotation.z += (a.sx * lift - a.shoulder.rotation.z) * Math.min(1, dt * 8);
    }
    if (wave > 0) wave -= dt;
    // Blink.
    nextBlink -= dt;
    if (nextBlink < 0) {
      blink = 0.14;
      nextBlink = 2.5 + Math.random() * 3.5;
    }
    if (blink > 0) blink -= dt;
    const bs = blink > 0 ? 0.15 : 1;
    eyeL.scale.y = eyeR.scale.y = bs;
    // Talking mouth.
    if (talk > 0) {
      talk -= dt;
      mouth.scale.y = 1 + Math.abs(Math.sin(t * 18)) * 1.2;
    } else mouth.scale.y = 1;
    if (moodTimer > 0) {
      moodTimer -= dt;
      if (moodTimer <= 0) {
        happy.visible = false;
        eyes.visible = true;
      }
    }
    tip.scale.setScalar(1 + Math.sin(t * 4) * 0.12);
    if (opts.hover) wheelPivot.position.y = WHEEL_R + Math.sin(t * 2) * 0.03;
  }

  return {
    group: root,
    update,
    setHappy(sec = 2) {
      happy.visible = true;
      eyes.visible = false;
      moodTimer = sec;
    },
    talk(sec = 1.5) {
      talk = sec;
    },
    wave(sec = 1.5) {
      wave = sec;
    },
    setChest(color) {
      chest.material.color.set(color);
    },
    head: headPivot,
  };
}
