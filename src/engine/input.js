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

  // Touch controls: a floating joystick on the left half, camera drag on the right half,
  // two fingers on the right half pinch to zoom, and big buttons for jump / use / kick / map / nitro.
  attachTouch(root, handlers) {
    this.touchMode = true;
    const stick = root.querySelector('.joy');
    const knob = root.querySelector('.joy-knob');
    let joyId = null;
    let cx = 0;
    let cy = 0;
    const cams = new Map(); // touch id -> {x, y}
    let pinchDist = 0;
    const R = 55;
    const resetStick = () => {
      stick.style.left = '';
      stick.style.top = '';
      knob.style.transform = '';
      stick.classList.remove('on');
    };
    const onStart = (e) => {
      for (const t of e.changedTouches) {
        if (t.clientX < window.innerWidth * 0.45 && joyId === null) {
          joyId = t.identifier;
          cx = t.clientX;
          cy = t.clientY;
          stick.style.left = cx - 70 + 'px';
          stick.style.top = cy - 70 + 'px';
          stick.classList.add('on');
          this.joy.active = true;
          this.joy.x = 0;
          this.joy.y = 0;
        } else if (cams.size < 2) {
          cams.set(t.identifier, { x: t.clientX, y: t.clientY });
          if (cams.size === 2) {
            const [a, b] = [...cams.values()];
            pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
          }
        }
      }
      e.preventDefault();
    };
    const onMove = (e) => {
      let handled = false;
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
          handled = true;
        } else if (cams.has(t.identifier)) {
          const c = cams.get(t.identifier);
          if (cams.size === 1) {
            this.lookX += (t.clientX - c.x) * 1.4;
            this.lookY += (t.clientY - c.y) * 1.4;
            this.lastLookTime = performance.now() / 1000;
          }
          c.x = t.clientX;
          c.y = t.clientY;
          handled = true;
        }
      }
      if (cams.size === 2) {
        const [a, b] = [...cams.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        this.zoom += (pinchDist - d) * 0.03;
        pinchDist = d;
      }
      if (handled) e.preventDefault();
    };
    const onEnd = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === joyId) {
          joyId = null;
          this.joy.x = 0;
          this.joy.y = 0;
          this.joy.active = false;
          resetStick();
        } else cams.delete(t.identifier);
      }
    };
    this.canvas.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    // Buttons use pointer events, so they work with fingers, pens and mice alike.
    for (const [sel, code] of [['.tb-jump', 'Space'], ['.tb-use', 'KeyE'], ['.tb-kick', 'KeyF']]) {
      const b = root.querySelector(sel);
      if (!b) continue;
      const release = () => {
        this.keys.delete(code);
        b.classList.remove('pressed');
      };
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        try {
          b.setPointerCapture(e.pointerId);
        } catch {
          /* ignore */
        }
        this.pressedSet.add(code);
        this.keys.add(code);
        b.classList.add('pressed');
      });
      b.addEventListener('pointerup', release);
      b.addEventListener('pointercancel', release);
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    // Tap buttons (act once on release): map, nitro on/off.
    for (const [sel, name] of [['.tb-map', 'map'], ['.tb-nitro', 'nitro']]) {
      const b = root.querySelector(sel);
      if (!b || !handlers || !handlers[name]) continue;
      b.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        b.classList.add('pressed');
      });
      b.addEventListener('pointerup', () => {
        b.classList.remove('pressed');
        handlers[name]();
      });
      b.addEventListener('pointercancel', () => b.classList.remove('pressed'));
      b.addEventListener('contextmenu', (e) => e.preventDefault());
    }
  }

  // Pushing the joystick all the way makes Bip run.
  get joyRun() {
    return this.joy.active && Math.hypot(this.joy.x, this.joy.y) > 0.92;
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
