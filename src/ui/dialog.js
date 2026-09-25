import { h } from './dom.js';
import { L, t } from '../i18n.js';
import { face } from './avatars.js';
import { sfx, speak, stopSpeaking } from '../audio.js';
import { state } from '../state.js';

// Shows a sequence of speech lines. Resolves when finished or skipped.
export function runDialog(root, lines, opts = {}) {
  return new Promise((resolve) => {
    let i = -1;
    let shown = 0;
    let full = '';
    let timer = 0;
    const av = h('div', { class: 'av' });
    const who = h('div', { class: 'who' });
    const lineEl = h('div', { class: 'line' });
    const skip = h('button', { class: 'skip', type: 'button' }, t('skip'));
    const hint = h('div', { class: 'hint' }, h('span', null, t('clickToContinue')), skip);
    const box = h('div', { class: 'dialog', role: 'dialog', 'aria-live': 'polite' }, av, h('div', { style: { flex: 1 } }, who, lineEl, hint));
    root.appendChild(box);

    const finish = () => {
      clearInterval(timer);
      stopSpeaking();
      window.removeEventListener('keydown', onKey, true);
      box.remove();
      resolve();
    };
    const next = () => {
      if (shown < full.length) {
        shown = full.length;
        lineEl.textContent = full;
        return;
      }
      i++;
      if (i >= lines.length) return finish();
      const ln = lines[i];
      const whoKey = ln.who || 'bip';
      av.innerHTML = face(whoKey, 64, ln.mood);
      who.textContent = whoKey === 'ada' ? t('ada') : whoKey === 'bip' ? t('bip') : L(ln.name);
      who.className = 'who ' + whoKey;
      full = L(ln.text, { name: state.name || 'Explorer' });
      shown = 0;
      lineEl.textContent = '';
      clearInterval(timer);
      timer = setInterval(() => {
        shown = Math.min(full.length, shown + 2);
        lineEl.textContent = full.slice(0, shown);
        if (shown % 6 === 0) sfx(whoKey === 'ada' ? 'blip' : 'beep');
        if (shown >= full.length) clearInterval(timer);
      }, 28);
      if (state.tts) speak(full);
      if (opts.onLine) opts.onLine(ln, i);
    };
    const onKey = (e) => {
      if (['Space', 'Enter', 'KeyE'].includes(e.code)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        next();
      } else if (e.code === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        finish();
      }
    };
    box.addEventListener('click', (e) => {
      if (e.target === skip) return finish();
      next();
    });
    window.addEventListener('keydown', onKey, true);
    next();
  });
}
