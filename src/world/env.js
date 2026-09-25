import * as THREE from 'three';
import { SEABED } from './layout.js';

export const SUN_DIR = new THREE.Vector3(0.55, 0.62, 0.36).normalize();
export const FOG_COLOR = new THREE.Color('#cdeaf7');

export function createEnvironment(scene) {
  scene.fog = new THREE.Fog(FOG_COLOR, 110, 430);
  scene.background = FOG_COLOR.clone();

  // Sky dome with a soft sun.
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      uTop: { value: new THREE.Color('#3d8fe0') },
      uHorizon: { value: new THREE.Color('#cdeaf7') },
      uSun: { value: SUN_DIR },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop; uniform vec3 uHorizon; uniform vec3 uSun;
      varying vec3 vDir;
      void main() {
        float h = max(vDir.y, 0.0);
        vec3 col = mix(uHorizon, uTop, pow(h, 0.55));
        float s = max(dot(normalize(vDir), uSun), 0.0);
        col += vec3(1.0, 0.93, 0.75) * (pow(s, 900.0) * 1.6 + pow(s, 12.0) * 0.18);
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1000, 32, 16), skyMat);
  sky.frustumCulled = false;
  sky.renderOrder = -10;
  scene.add(sky);

  // Lights.
  const hemi = new THREE.HemisphereLight('#e3f4ff', '#8c7b58', 1.15);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#fff0d4', 2.5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera;
  sc.left = -38;
  sc.right = 38;
  sc.top = 38;
  sc.bottom = -38;
  sc.near = 1;
  sc.far = 180;
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.04;
  scene.add(sun);
  scene.add(sun.target);

  // Deep seabed under everything.
  const seabed = new THREE.Mesh(
    new THREE.PlaneGeometry(1600, 1600),
    new THREE.MeshLambertMaterial({ color: '#2d7482' }),
  );
  seabed.rotation.x = -Math.PI / 2;
  seabed.position.y = SEABED - 0.35;
  scene.add(seabed);

  const water = createWater();
  scene.add(water);

  const clouds = createClouds();
  scene.add(clouds.group);

  return {
    sun,
    hemi,
    water,
    sky,
    seabed,
    // Fast mode skips the full-screen layers that cost the most on weak graphics.
    setLow(low) {
      sky.visible = !low;
      seabed.visible = !low;
      scene.background.set(low ? '#a9dbf5' : FOG_COLOR);
      water.material.transparent = !low;
      water.material.needsUpdate = true;
    },
    update(dt, t, focus) {
      water.material.uniforms.uTime.value = t;
      sun.position.set(focus.x + SUN_DIR.x * 90, focus.y + SUN_DIR.y * 90, focus.z + SUN_DIR.z * 90);
      sun.target.position.copy(focus);
      sky.position.copy(focus);
      clouds.update(dt, focus);
    },
  };
}

function createWater() {
  const geo = new THREE.PlaneGeometry(1400, 1400, 1, 1);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    fog: true,
    uniforms: THREE.UniformsUtils.merge([
      THREE.UniformsLib.fog,
      {
        uTime: { value: 0 },
        uDeep: { value: new THREE.Color('#1c7fa6') },
        uShallow: { value: new THREE.Color('#4fd1d0') },
        uSky: { value: new THREE.Color('#bfe6fb') },
        uSun: { value: SUN_DIR },
      },
    ]),
    vertexShader: /* glsl */ `
      #include <fog_pars_vertex>
      varying vec3 vWorld;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorld = wp.xyz;
        vec4 mvPosition = viewMatrix * wp;
        gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: /* glsl */ `
      #include <fog_pars_fragment>
      uniform float uTime; uniform vec3 uDeep; uniform vec3 uShallow; uniform vec3 uSky; uniform vec3 uSun;
      varying vec3 vWorld;
      vec2 waveGrad(vec2 p, float t) {
        vec2 g = vec2(0.0);
        // Sum of travelling waves: slope = amplitude * k * cos(k.x - w t)
        g += vec2(0.8, 0.6) * 0.10 * cos(dot(p, vec2(0.8, 0.6)) * 0.9 - t * 1.3);
        g += vec2(-0.5, 0.86) * 0.08 * cos(dot(p, vec2(-0.5, 0.86)) * 1.7 - t * 1.9);
        g += vec2(0.2, -0.98) * 0.05 * cos(dot(p, vec2(0.2, -0.98)) * 3.1 - t * 2.6);
        g += vec2(-0.9, -0.3) * 0.035 * cos(dot(p, vec2(-0.9, -0.3)) * 5.3 - t * 3.4);
        return g;
      }
      void main() {
        vec2 g = waveGrad(vWorld.xz, uTime);
        vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
        vec3 v = normalize(cameraPosition - vWorld);
        float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
        float dist = length(cameraPosition.xz - vWorld.xz);
        vec3 col = mix(uShallow, uDeep, clamp(0.35 + fres * 1.2, 0.0, 1.0));
        col = mix(col, uSky, fres * 0.7);
        vec3 r = reflect(-uSun, n);
        float spec = pow(max(dot(r, v), 0.0), 160.0) * 2.2;
        float sparkle = step(0.985, fract(sin(dot(floor(vWorld.xz * 3.0), vec2(12.9898, 78.233))) * 43758.5453 + uTime * 0.2)) * 0.15;
        col += vec3(1.0, 0.95, 0.85) * (spec + sparkle * spec * 4.0);
        float alpha = clamp(0.62 + fres * 0.4 + dist * 0.0015, 0.0, 0.94);
        gl_FragColor = vec4(col, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
  });
  const water = new THREE.Mesh(geo, mat);
  water.renderOrder = -1;
  water.frustumCulled = false;
  return water;
}

function createClouds() {
  const group = new THREE.Group();
  const mat = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#dfefff', emissiveIntensity: 0.35, flatShading: true });
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const clouds = [];
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 16; i++) {
    const c = new THREE.Group();
    const n = 4 + Math.floor(rnd() * 4);
    for (let k = 0; k < n; k++) {
      const m = new THREE.Mesh(geo, mat);
      const s = 5 + rnd() * 7;
      m.scale.set(s * 1.4, s * 0.8, s);
      m.position.set((k - n / 2) * 6 + rnd() * 4, rnd() * 3, rnd() * 6 - 3);
      c.add(m);
    }
    c.position.set(rnd() * 600 - 300, 70 + rnd() * 35, rnd() * 600 - 300);
    c.userData.speed = 1.2 + rnd() * 1.5;
    group.add(c);
    clouds.push(c);
  }
  return {
    group,
    update(dt, focus) {
      for (const c of clouds) {
        c.position.x += c.userData.speed * dt;
        if (c.position.x - focus.x > 320) c.position.x -= 640;
        if (c.position.x - focus.x < -320) c.position.x += 640;
        if (c.position.z - focus.z > 320) c.position.z -= 640;
        if (c.position.z - focus.z < -320) c.position.z += 640;
      }
    },
  };
}
