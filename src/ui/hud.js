import { h, clear } from './dom.js';
import { t } from '../i18n.js';
import { STATION_META } from '../content/meta.js';

// Heads-up display: goal, counters, prompt, toasts, physics readout, touch controls.
export function createHud(root, handlers) {
  const layer = h('div', { class: 'hud-layer' });
  root.appendChild(layer);

  const goalChip = h('div', { class: 'goal-chip' }, '1');
  const goalLabel = h('div', { class: 'goal-label' });
  const goalText = h('div', { class: 'goal-text' });
  const goal = h('div', { class: 'goal' }, goalChip, h('div', null, goalLabel, goalText));
  const coreBars = h('div', { class: 'cores-row' });
  const coreCount = h('span');
  const crystalCount = h('span');
  const starCount = h('span');
  const counters = h(
    'div',
    { class: 'counters' },
    h('div', { class: 'counter', title: '' }, coreBars, coreCount),
    h('div', { class: 'counter' }, h('span', { class: 'ci' }, h('svg', null)), crystalCount),
    h('div', { class: 'counter' }, h('span', { class: 'ci' }, '⭐'), starCount),
  );
  counters.children[1].querySelector('.ci').innerHTML =
    '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 2 L20 12 L12 22 L4 12 Z" fill="#7ff6ff" stroke="#1d2340" stroke-width="2"/></svg>';

  const mapBtn = h('button', { class: 'btn interactive', title: t('ctrlMap'), 'aria-label': t('ctrlMap') }, '🗺️');
  const langBtn = h('button', { class: 'btn interactive lang-btn', 'aria-label': t('language') }, 'RO');
  const menuBtn = h('button', { class: 'btn interactive', title: t('menu'), 'aria-label': t('menu') }, '☰');
  mapBtn.addEventListener('click', () => handlers.map());
  langBtn.addEventListener('click', () => handlers.lang());
  menuBtn.addEventListener('click', () => handlers.menu());

  const top = h('div', { class: 'hud-top' }, h('div', { class: 'hud-left' }, goal, counters), h('div', { class: 'hud-right' }, mapBtn, langBtn, menuBtn));
  layer.appendChild(top);

  const promptKey = h('kbd', null, 'E');
  const promptText = h('span');
  const prompt = h('div', { class: 'prompt interactive', hidden: true }, promptKey, promptText);
  prompt.addEventListener('click', () => handlers.use());
  layer.appendChild(prompt);

  const speed = h('b');
  const height = h('b');
  const speedLab = h('span');
  const heightLab = h('span');
  const readout = h('div', { class: 'readout' }, h('div', null, speedLab, ' ', speed), h('div', null, heightLab, ' ', height));
  layer.appendChild(readout);

  const keys = h('div', { class: 'keys' });
  layer.appendChild(keys);

  const toasts = h('div', { class: 'toasts' });
  layer.appendChild(toasts);

  const touch = h(
    'div',
    { class: 'touch', hidden: true },
    h('div', { class: 'joy' }, h('div', { class: 'joy-knob' })),
    h(
      'div',
      { class: 'tbtns' },
      h('button', { class: 'tb-kick', 'aria-label': t('ctrlKick') }, '⚽'),
      h('button', { class: 'tb-use', 'aria-label': t('ctrlUse') }, 'E'),
      h('button', { class: 'tb-map', 'aria-label': t('ctrlMap') }, '🗺️'),
      h('button', { class: 'tb-jump', 'aria-label': t('ctrlJump') }, '⤒'),
    ),
  );
  layer.appendChild(touch);

  function renderKeys() {
    clear(keys);
    const rows = [
      ['W A S D', t('ctrlMove')],
      ['🖱️', t('dragMouse')],
      ['Space', t('ctrlJump')],
      ['Shift', t('ctrlRun')],
      ['E', t('ctrlUse')],
      ['F', t('ctrlKick')],
      ['M', t('ctrlMap')],
      ['Esc', t('ctrlMenu')],
    ];
    for (const [k, v] of rows) keys.append(h('kbd', null, k), h('span', null, v));
  }

  const api = {
    layer,
    touch,
    show(on) {
      layer.hidden = !on;
    },
    setGoal(label, text, chip, color) {
      goalLabel.textContent = label;
      goalText.textContent = text;
      goalChip.textContent = chip;
      goalChip.style.background = color;
    },
    setCounts(passedFlags, crystals, total) {
      clear(coreBars);
      passedFlags.forEach((on, i) => {
        const b = h('i');
        if (on) b.style.background = STATION_META[i].color;
        coreBars.appendChild(b);
      });
      coreCount.textContent = passedFlags.filter(Boolean).length + '/13';
      crystalCount.textContent = crystals + '/' + total;
    },
    setStars(n, total) {
      starCount.textContent = n + '/' + total;
      starCount.parentElement.title = t('stars');
    },
    setPrompt(label, touchMode) {
      if (!label) {
        prompt.hidden = true;
        return;
      }
      promptKey.textContent = touchMode ? t('tapUse') : 'E';
      promptText.textContent = label;
      prompt.hidden = false;
    },
    setReadout(v, y) {
      speed.textContent = v.toFixed(1) + ' m/s';
      height.textContent = y.toFixed(1) + ' m';
    },
    toast(title, body, ms = 3200, kind = '') {
      const el = h('div', { class: 'toast ' + (body ? 'fact ' : '') + kind }, h('div', { class: 't-title' }, title), body ? h('div', { class: 't-body' }, body) : null);
      toasts.appendChild(el);
      while (toasts.children.length > 3) toasts.firstChild.remove();
      setTimeout(() => {
        el.classList.add('out');
        setTimeout(() => el.remove(), 320);
      }, ms);
    },
    refreshLang(lang) {
      langBtn.textContent = lang === 'en' ? 'RO' : 'EN';
      mapBtn.title = t('ctrlMap');
      menuBtn.title = t('menu');
      speedLab.textContent = t('speed');
      heightLab.textContent = t('height');
      renderKeys();
    },
  };
  return api;
}
