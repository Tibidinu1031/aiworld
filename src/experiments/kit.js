import { h } from '../ui/dom.js';
import { L } from '../i18n.js';
import { setupCanvas, toLogical } from '../ui/draw.js';
import { face } from '../ui/avatars.js';

// A canvas with a fixed logical size that scales to its container.
export function canvasBox(W, H, opts = {}) {
  const canvas = h('canvas', { width: W, height: H, 'aria-label': opts.label || '' });
  const wrap = h('div', { class: 'exp-canvas' }, canvas);
  if (opts.maxWidth) wrap.style.maxWidth = opts.maxWidth + 'px';
  const g = setupCanvas(canvas, W, H);
  return { wrap, canvas, g, W, H, pos: (e) => toLogical(canvas, e, W, H) };
}

export function slider({ label, min, max, step = 1, value, fmt = (v) => v, onInput }) {
  const val = h('span', { class: 'val' }, fmt(value));
  const input = h('input', { type: 'range', min, max, step, value });
  const lab = h('div', { class: 'lab' }, h('span', null, label), val);
  input.addEventListener('input', () => {
    const v = parseFloat(input.value);
    val.textContent = fmt(v);
    onInput && onInput(v);
  });
  return {
    el: h('div', { class: 'ctl' }, lab, input),
    input,
    get: () => parseFloat(input.value),
    set(v) {
      input.value = v;
      val.textContent = fmt(parseFloat(input.value));
    },
    setLabel(s) {
      lab.firstChild.textContent = s;
    },
  };
}

export function seg(options, value, onChange) {
  const el = h('div', { class: 'seg', role: 'group' });
  const btns = options.map((o) => {
    const b = h('button', { type: 'button', class: o.v === value ? 'on' : '' }, o.label);
    b.addEventListener('click', () => {
      set(o.v);
      onChange && onChange(o.v);
    });
    el.appendChild(b);
    return b;
  });
  function set(v) {
    value = v;
    btns.forEach((b, i) => b.classList.toggle('on', options[i].v === v));
  }
  return { el, set, get: () => value };
}

export function btn(label, onClick, cls = '') {
  const b = h('button', { type: 'button', class: 'btn ' + cls }, label);
  b.addEventListener('click', onClick);
  return b;
}

export function card(title, ...kids) {
  return h('div', { class: 'card' }, title ? h('h4', null, title) : null, ...kids);
}

export function bubble(who, textStr) {
  const txt = h('div', { class: 'bubble' + (who === 'bip' ? ' bip' : '') }, textStr);
  const el = h('div', { class: 'say' }, h('div', { class: 'av', html: face(who, 46) }), txt);
  return {
    el,
    set(s, mood) {
      txt.textContent = s;
      if (mood) el.querySelector('.av').innerHTML = face(who, 46, mood);
    },
  };
}

// Creates the API object each experiment receives.
export function makeApi({ level, onComplete, sfx, alreadyDone }) {
  const cleanups = [];
  let completed = false;
  const api = {
    level,
    T: L,
    sfx,
    alreadyDone,
    complete() {
      if (completed) return;
      completed = true;
      sfx('win');
      onComplete && onComplete();
    },
    get completed() {
      return completed;
    },
    onDestroy(fn) {
      cleanups.push(fn);
    },
    // Animation loop that stops when the experiment closes.
    raf(fn) {
      let alive = true;
      let last = performance.now();
      const loop = (now) => {
        if (!alive) return;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        fn(dt, now / 1000);
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      cleanups.push(() => (alive = false));
    },
    timeout(fn, ms) {
      const id = setTimeout(fn, ms);
      cleanups.push(() => clearTimeout(id));
      return id;
    },
    // Mission checklist. Missions above the chosen level are hidden.
    missions(list) {
      const visible = list.filter((m) => (m.level || 1) <= level);
      const doneSet = new Set();
      const rows = {};
      const el = h('div', { class: 'card' }, h('h4', null, L({ en: 'Missions', ro: 'Misiuni' })));
      const box = h('div', { class: 'missions' });
      el.appendChild(box);
      for (const m of visible) {
        const row = h(
          'div',
          { class: 'mission' },
          h('div', { class: 'box' }, ''),
          h('div', { class: 'txt' }, L(m.t), (m.level || 1) === 3 ? h('span', { class: 'lvl' }, L({ en: 'Inventor', ro: 'Inventator' })) : null),
        );
        rows[m.id] = row;
        box.appendChild(row);
      }
      return {
        el,
        check(id) {
          if (!rows[id] || doneSet.has(id)) return false;
          doneSet.add(id);
          rows[id].classList.add('done');
          rows[id].querySelector('.box').textContent = '✓';
          sfx('good');
          if (visible.every((m) => doneSet.has(m.id))) api.complete();
          return true;
        },
        isDone: (id) => doneSet.has(id),
        has: (id) => !!rows[id],
      };
    },
    destroy() {
      cleanups.forEach((f) => {
        try {
          f();
        } catch {
          /* ignore */
        }
      });
    },
  };
  return api;
}

// Standard two-column experiment layout.
export function layout(root, { intro, stage, side, wide }) {
  const introEl = intro ? h('div', { class: 'card intro' }, intro) : null;
  const el = h(
    'div',
    { class: 'exp' + (wide ? ' wide' : '') },
    h('div', { class: 'exp-stage' }, ...[].concat(stage)),
    h('div', { class: 'exp-side' }, introEl, ...[].concat(side)),
  );
  root.appendChild(el);
  return el;
}
