import { h, clear, shuffle, md } from './dom.js';
import { L, t } from '../i18n.js';
import { sfx, speak } from '../audio.js';
import { state } from '../state.js';

export const TEST_SIZE = { 1: 4, 2: 6, 3: 8 };
export const passMark = (n) => Math.round(n * 0.7);

// Pick a fresh set of questions for the player's level.
export function pickQuestions(pool, level, n = TEST_SIZE[level]) {
  const avail = pool.filter((q) => (q.level || 1) <= level);
  const chosen = [];
  const take = (arr, k) => {
    for (const q of shuffle(arr)) {
      if (chosen.length >= n || k <= 0) break;
      if (!chosen.includes(q)) {
        chosen.push(q);
        k--;
      }
    }
  };
  if (level === 3) take(avail.filter((q) => q.level === 3), 3);
  if (level >= 2) take(avail.filter((q) => q.level === 2), 2);
  take(avail, n);
  return shuffle(chosen);
}

// Turn a question into { text, emoji, options[], correct, why }.
function prepare(q) {
  if (q.tf) {
    return {
      text: L(q.q),
      e: q.e,
      options: [t('tf_true'), t('tf_false')],
      correct: q.c ? 0 : 1,
      why: L(q.why),
    };
  }
  const idx = shuffle(q.a.map((_, i) => i));
  return {
    text: L(q.q),
    e: q.e,
    options: idx.map((i) => L(q.a[i])),
    correct: idx.indexOf(q.c ?? 0),
    why: L(q.why),
  };
}

// Runs the quiz in `root`. Calls onFinish(score, total).
export function runQuiz(root, questions, { onFinish }) {
  const qs = questions.map(prepare);
  let i = 0;
  let score = 0;
  const render = () => {
    clear(root);
    const q = qs[i];
    const prog = h('div', { class: 'progress' }, h('i', { style: { width: (i / qs.length) * 100 + '%' } }));
    const head = h('div', { class: 'qhead' }, h('span', { class: 'eyebrow' }, t('questionOf', { a: i + 1, b: qs.length })), prog);
    const qEl = h('div', { class: 'q' }, q.e ? h('span', { class: 'qe' }, q.e) : null, q.text);
    const opts = h('div', { class: 'opts' });
    const fb = h('div');
    const nextBtn = h('button', { class: 'btn primary big', hidden: true }, i < qs.length - 1 ? t('next') + ' →' : t('finish'));
    const buttons = q.options.map((o, k) => {
      const b = h('button', { class: 'opt', type: 'button' }, h('span', { class: 'letter' }, 'ABCD'[k]), h('span', null, o));
      b.addEventListener('click', () => {
        buttons.forEach((bb) => (bb.disabled = true));
        const right = k === q.correct;
        if (right) {
          score++;
          b.classList.add('right');
          sfx('good');
        } else {
          b.classList.add('wrong');
          buttons[q.correct].classList.add('right');
          sfx('bad');
        }
        fb.className = 'feedback ' + (right ? 'good' : 'bad');
        fb.innerHTML = '';
        fb.append(
          h('b', null, right ? '✅ ' + t('correct') : '💡 ' + t('notQuite')),
          right ? null : h('div', null, t('rightAnswer') + ' ', h('b', { style: { fontSize: '17px' } }, q.options[q.correct])),
          q.why ? h('div', { html: md(q.why) }) : null,
        );
        if (state.tts && q.why) speak(q.why);
        nextBtn.hidden = false;
        nextBtn.focus();
      });
      opts.appendChild(b);
      return b;
    });
    nextBtn.addEventListener('click', () => {
      i++;
      if (i < qs.length) render();
      else onFinish(score, qs.length);
    });
    root.append(h('div', { class: 'quiz' }, head, qEl, opts, fb, h('div', { class: 'row-btns', style: { justifyContent: 'flex-end' } }, nextBtn)));
    if (state.tts) speak(q.text + '. ' + q.options.join('. '));
  };
  render();
}
