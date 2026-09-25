import * as THREE from 'three';
import { Ball } from '../engine/physics.js';

// Real ball types with realistic sizes and masses.
// density = mass / volume decides whether a ball floats (less than 1000 kg/m^3) or sinks.
export const BALL_TYPES = {
  beach: { r: 0.25, mass: 0.2, restitution: 0.75, inertia: 2 / 3, rollResist: 0.03, name: { en: 'Beach ball', ro: 'Minge de plajă' } },
  soccer: { r: 0.11, mass: 0.43, restitution: 0.7, inertia: 2 / 3, rollResist: 0.02, name: { en: 'Soccer ball', ro: 'Minge de fotbal' } },
  basket: { r: 0.12, mass: 0.62, restitution: 0.8, inertia: 2 / 3, rollResist: 0.02, name: { en: 'Basketball', ro: 'Minge de baschet' } },
  bowling: { r: 0.109, mass: 6.5, restitution: 0.2, inertia: 2 / 5, rollResist: 0.01, name: { en: 'Bowling ball', ro: 'Bilă de bowling' } },
  rubber: { r: 0.25, mass: 0.6, restitution: 0.72, inertia: 2 / 3, rollResist: 0.015, name: { en: 'Rubber ball', ro: 'Minge de cauciuc' } },
  cannon: { r: 0.18, mass: 1.5, restitution: 0.5, inertia: 2 / 5, rollResist: 0.02, name: { en: 'Launcher ball', ro: 'Minge de lansator' } },
  big: { r: 0.4, mass: 1.2, restitution: 0.65, inertia: 2 / 3, rollResist: 0.02, name: { en: 'Big ball', ro: 'Minge mare' } },
};

const texCache = {};
function ballTexture(kind, color) {
  const key = kind + color;
  if (texCache[key]) return texCache[key];
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 128;
  const g = c.getContext('2d');
  if (kind === 'beach') {
    const cols = ['#ff5a5f', '#ffffff', '#2a9df4', '#ffffff', '#ffd23f', '#ffffff'];
    cols.forEach((cc, i) => {
      g.fillStyle = cc;
      g.fillRect((i * 256) / 6, 0, 256 / 6 + 1, 128);
    });
    g.fillStyle = '#fff';
    g.fillRect(0, 0, 256, 10);
    g.fillRect(0, 118, 256, 10);
  } else if (kind === 'soccer') {
    g.fillStyle = '#f7f7f7';
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = '#1d2340';
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        const x = i * 44 + (j % 2) * 22 + 10;
        const y = j * 44 + 20;
        g.beginPath();
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2 - Math.PI / 2;
          g.lineTo(x + Math.cos(a) * 11, y + Math.sin(a) * 11);
        }
        g.fill();
      }
    }
  } else if (kind === 'basket') {
    g.fillStyle = '#e8772e';
    g.fillRect(0, 0, 256, 128);
    g.strokeStyle = '#2b1a10';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(0, 64);
    g.lineTo(256, 64);
    g.moveTo(64, 0);
    g.lineTo(64, 128);
    g.moveTo(192, 0);
    g.lineTo(192, 128);
    g.stroke();
  } else {
    g.fillStyle = color;
    g.fillRect(0, 0, 256, 128);
    g.fillStyle = 'rgba(255,255,255,0.25)';
    g.fillRect(0, 56, 256, 16);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache[key] = t;
  return t;
}

const geoCache = {};
export function makeBall(physics, scene, type, x, y, z, color = '#ff6b3d') {
  const spec = BALL_TYPES[type];
  const geo = (geoCache[spec.r] ||= new THREE.SphereGeometry(spec.r, 20, 14));
  let mat;
  if (type === 'bowling') mat = new THREE.MeshStandardMaterial({ color: color || '#2b2f6b', roughness: 0.15, metalness: 0.2 });
  else mat = new THREE.MeshStandardMaterial({ map: ballTexture(type, color), roughness: type === 'beach' ? 0.45 : 0.6 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.position.set(x, y, z);
  scene.add(mesh);
  const ball = new Ball({ ...spec, x, y, z, mesh });
  ball.type = type;
  physics.addBall(ball);
  return ball;
}
