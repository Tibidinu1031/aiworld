// Keyboard, mouse and touch input for the 3D world.
export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = new Set();
    this.pressedSet = new Set();
    this.lookX = 0;
    this.lookY = 0;
    this.zoom = 0;
    this.joy = { x: 0, y: 0, active: false };
    this.enabled = true;
    this.lastLookTime = -10;
    this.touchMode = false;
    this.dragging = false;

    window.addEventListener('keydown', (e) => {
      if (isTyping(e)) return;
      if (!this.keys.has(e.code)) this.pressedSet.add(e.code);
      this.keys.add(e.code);
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code) && this.enabled) e.preventDefault();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    let lastX = 0;
    let lastY = 0;
    let pid = null;
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'touch') return; // touch handled by the touch layer
      this.dragging = true;
      pid = e.pointerId;
      lastX = e.clientX;
      lastY = e.clientY;
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!this.dragging || e.pointerId !== pid) return;
      this.lookX += e.clientX - lastX;
      this.lookY += e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      this.lastLookTime = performance.now() / 1000;
    });
    const end = (e) => {
      if (e.pointerId === pid) {
        this.dragging = false;
        pid = null;
      }
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener(
      'wheel',
      (e) => {
        this.zoom += Math.sign(e.deltaY);
        e.preventDefault();
      },
      { passive: false },
    );
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  // Touch controls: a joystick on the left, camera drag on the right.
  attachTouch(root, handlers) {
    this.touchMode = true;
    const stick = root.querySelector('.joy');
    const knob = root.querySelector('.joy-knob');
    let joyId = null;
    let camId = null;
    let cx = 0;
    let cy = 0;
    let lx = 0;
    let ly = 0;
    const R = 55;
    const onStart = (e) => {
      for (const t of e.changedTouches) {
        const target = t.target;
        if (target.closest && target.closest('button, .panel, .hud-top, .dialog')) continue;
        if (t.clientX < window.innerWidth * 0.45 && joyId === null) {
          joyId = t.identifier;
          cx = t.clientX;
          cy = t.clientY;
          stick.style.left = cx - 70 + 'px';
          stick.style.top = cy - 70 + 'px';
          stick.classList.add('on');
        } else if (camId === null) {
          camId = t.identifier;
          lx = t.clientX;
          ly = t.clientY;
        }
      }
    };
    const onMove = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joyId) {
          let dx = t.clientX - cx;
          let dy = t.clientY - cy;
          const l = Math.hypot(dx, dy);
          if (l > R) {
            dx = (dx / l) * R;
            dy = (dy / l) * R;
          }
          knob.style.transform = `translate(${dx}px, ${dy}px)`;
          this.joy.x = dx / R;
          this.joy.y = -dy / R;
          this.joy.active = true;
        } else if (t.identifier === camId) {
          this.lookX += (t.clientX - lx) * 1.3;
          this.lookY += (t.clientY - ly) * 1.3;
          lx = t.clientX;
          ly = t.clientY;
          this.lastLookTime = performance.now() / 1000;
        }
      }
      if (joyId !== null || camId !== null) e.preventDefault();
    };
    const onEnd = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joyId) {
          joyId = null;
          this.joy.x = 0;
          this.joy.y = 0;
          this.joy.active = false;
          knob.style.transform = '';
          stick.classList.remove('on');
        } else if (t.identifier === camId) camId = null;
      }
    };
    this.canvas.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    for (const [sel, code] of [['.tb-jump', 'Space'], ['.tb-use', 'KeyE'], ['.tb-kick', 'KeyF']]) {
      const b = root.querySelector(sel);
      if (!b) continue;
      b.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.pressedSet.add(code);
        this.keys.add(code);
      });
      b.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.keys.delete(code);
      });
    }
    if (handlers && handlers.map) root.querySelector('.tb-map')?.addEventListener('click', handlers.map);
  }

  down(code) {
    return this.enabled && this.keys.has(code);
  }

  pressed(code) {
    if (!this.enabled) return false;
    if (this.pressedSet.has(code)) {
      this.pressedSet.delete(code);
      return true;
    }
    return false;
  }

  // Movement axis from keyboard or joystick: x = right, y = forward.
  axis() {
    if (!this.enabled) return { x: 0, y: 0 };
    let x = 0;
    let y = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y += 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y -= 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.joy.active) {
      x += this.joy.x;
      y += this.joy.y;
    }
    const l = Math.hypot(x, y);
    if (l > 1) {
      x /= l;
      y /= l;
    }
    return { x, y };
  }

  endFrame() {
    this.pressedSet.clear();
    this.lookX = 0;
    this.lookY = 0;
    this.zoom = 0;
  }

  clear() {
    this.keys.clear();
    this.pressedSet.clear();
    this.joy.x = 0;
    this.joy.y = 0;
  }
}

function isTyping(e) {
  const t = e.target;
  return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable);
}
