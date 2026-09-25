import * as THREE from 'three';
import { G } from '../engine/physics.js';

// Small CPU particle system. Particles obey gravity (and a little air drag).
export function createParticles(scene, max = 1500) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(max * 3);
  const col = new Float32Array(max * 3);
  const size = new Float32Array(max);
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setAttribute('size', new THREE.BufferAttribute(size, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexColors: true,
    uniforms: { uScale: { value: 300 } },
    vertexShader: /* glsl */ `
      attribute float size; varying vec3 vColor; uniform float uScale;
      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uScale / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float d = length(c);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vColor, smoothstep(0.5, 0.3, d));
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);
  const parts = [];
  for (let i = 0; i < max; i++) parts.push({ life: 0 });
  let cursor = 0;
  const c = new THREE.Color();

  function emit(o) {
    const n = o.count || 20;
    for (let k = 0; k < n; k++) {
      const p = parts[cursor];
      cursor = (cursor + 1) % max;
      const a = Math.random() * Math.PI * 2;
      const up = o.up ?? 3;
      const spread = o.spread ?? 2;
      p.x = o.x + (Math.random() - 0.5) * (o.jitter || 0.2);
      p.y = o.y + (Math.random() - 0.5) * (o.jitter || 0.2);
      p.z = o.z + (Math.random() - 0.5) * (o.jitter || 0.2);
      const sp = spread * (0.3 + Math.random() * 0.7);
      p.vx = Math.cos(a) * sp + (o.vx || 0);
      p.vz = Math.sin(a) * sp + (o.vz || 0);
      p.vy = up * (0.5 + Math.random() * 0.8);
      p.life = p.max = (o.life || 1) * (0.6 + Math.random() * 0.6);
      p.g = o.gravity ?? 1;
      p.size = (o.size || 0.2) * (0.6 + Math.random() * 0.8);
      const colors = o.colors || [o.color || '#ffffff'];
      c.set(colors[Math.floor(Math.random() * colors.length)]);
      p.r = c.r;
      p.gg = c.g;
      p.b = c.b;
    }
  }

  function update(dt) {
    for (let i = 0; i < max; i++) {
      const p = parts[i];
      if (p.life > 0) {
        p.life -= dt;
        p.vy -= G * p.g * dt;
        const drag = 1 - Math.min(1, 1.2 * dt);
        p.vx *= drag;
        p.vz *= drag;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        pos[i * 3] = p.x;
        pos[i * 3 + 1] = p.y;
        pos[i * 3 + 2] = p.z;
        col[i * 3] = p.r;
        col[i * 3 + 1] = p.gg;
        col[i * 3 + 2] = p.b;
        size[i] = p.size * Math.min(1, (p.life / p.max) * 2.5);
      } else size[i] = 0;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
    geo.attributes.size.needsUpdate = true;
  }

  return {
    emit,
    update,
    setScale(h) {
      mat.uniforms.uScale.value = h * 0.5;
    },
  };
}

// A tall soft light beam that marks the current goal.
export function createBeacon(scene) {
  const geo = new THREE.CylinderGeometry(0.7, 0.7, 70, 20, 1, true);
  geo.translate(0, 35, 0);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color('#ffd23f') } },
    vertexShader: /* glsl */ `
      varying float vH; varying vec3 vN; varying vec3 vView;
      void main() {
        vH = position.y / 70.0;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }`,
    fragmentShader: /* glsl */ `
      uniform float uTime; uniform vec3 uColor; varying float vH; varying vec3 vN; varying vec3 vView;
      void main() {
        float edge = abs(dot(normalize(vN), normalize(vView)));
        float a = pow(edge, 1.5) * (1.0 - vH) * 0.55;
        a *= 0.75 + 0.25 * sin(vH * 40.0 - uTime * 4.0);
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });
  const beam = new THREE.Mesh(geo, mat);
  beam.frustumCulled = false;
  scene.add(beam);

  // Bouncing arrow above the target.
  const arrowShape = new THREE.Shape();
  arrowShape.moveTo(-0.5, 0.5);
  arrowShape.lineTo(0.5, 0.5);
  arrowShape.lineTo(0.5, 0);
  arrowShape.lineTo(1, 0);
  arrowShape.lineTo(0, -1);
  arrowShape.lineTo(-1, 0);
  arrowShape.lineTo(-0.5, 0);
  arrowShape.closePath();
  const arrow = new THREE.Mesh(
    new THREE.ExtrudeGeometry(arrowShape, { depth: 0.25, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.06, bevelSegments: 2 }),
    new THREE.MeshStandardMaterial({ color: '#ffd23f', emissive: '#ff9f1a', emissiveIntensity: 0.6, roughness: 0.4 }),
  );
  arrow.scale.setScalar(0.45);
  arrow.castShadow = true;
  scene.add(arrow);

  let t = 0;
  return {
    set(x, y, z, arrowY) {
      beam.position.set(x, y, z);
      arrow.position.set(x, arrowY ?? y + 3.2, z);
      arrow.userData.baseY = arrowY ?? y + 3.2;
      beam.visible = arrow.visible = true;
    },
    hide() {
      beam.visible = arrow.visible = false;
    },
    update(dt, playerPos) {
      t += dt;
      mat.uniforms.uTime.value = t;
      arrow.position.y = (arrow.userData.baseY || 0) + Math.abs(Math.sin(t * 3)) * 0.5;
      arrow.rotation.y += dt * 1.5;
      // Fade the beam when the player is right next to it.
      if (playerPos) {
        const d = Math.hypot(playerPos.x - beam.position.x, playerPos.z - beam.position.z);
        beam.visible = arrow.visible && d > 6;
      }
    },
  };
}
