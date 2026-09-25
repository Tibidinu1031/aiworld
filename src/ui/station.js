import { h, clear, md } from './dom.js';
import { L, t, levelName } from '../i18n.js';
import { state, sp, save } from '../state.js';
import { STATIONS } from '../content/index.js';
import { metaById } from '../content/meta.js';
import { EXPERIMENTS } from '../experiments/index.js';
import { pagesFor, expsFor, requiredExps, learnDone, expsDone, testUnlocked } from '../content/progress.js';
import { renderVisual } from './visuals.js';
import { face } from './avatars.js';
import { makeApi } from '../experiments/kit.js';
import { pickQuestions, runQuiz, passMark } from './quiz.js';
import { sfx, speak, stopSpeaking, canSpeak } from '../audio.js';

// The window that opens at a station's terminal.
export function openStationPanel(game, stationId, startTab) {
  const content = STATIONS[stationId];
  const meta = metaById(stationId);
  const prog = sp(stationId);
  prog.visited = true;
  save();

  let tab = startTab || (prog.passed ? 'learn' : !learnDone(stationId) ? 'learn' : !expsDone(stationId) ? 'exp' : 'test');
  let pageIdx = 0;
  let openExp = null;
  let cleanup = null;
  let quizActive = false;

  const overlay = h('div', { class: 'overlay' });
  const panel = h('div', { class: 'panel', role: 'dialog', 'aria-modal': 'true' });
  overlay.appendChild(panel);
  const badge = h('div', { class: 'badge', style: { background: meta.color } }, String(meta.num));
  const eyebrow = h('div', { class: 'eyebrow' });
  const title = h('h2');
  const tabs = h('div', { class: 'tabs', role: 'tablist' });
  const closeBtn = h('button', { class: 'btn icon x-btn', 'aria-label': t('close') }, '✕');
  const head = h('div', { class: 'panel-head' }, badge, h('div', { style: { flex: 1, minWidth: '160px' } }, eyebrow, title), tabs, closeBtn);
  const body = h('div', { class: 'panel-body' });
  const foot = h('div', { class: 'panel-foot', hidden: true });
  panel.append(head, body, foot);
  game.ui.appendChild(overlay);

  closeBtn.addEventListener('click', close);
  const onKey = (e) => {
    if (e.code === 'Escape' && !document.querySelector('.dialog')) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (openExp) {
        openExp = null;
        render();
      } else close();
    }
  };
  window.addEventListener('keydown', onKey, true);

  function doCleanup() {
    if (cleanup) cleanup();
    cleanup = null;
    stopSpeaking();
  }

  function close() {
    doCleanup();
    window.removeEventListener('keydown', onKey, true);
    overlay.remove();
    sfx('close');
    game.closePanel();
  }

  function renderTabs() {
    clear(tabs);
    const items = [
      ['learn', '📖 ' + t('tabLearn'), learnDone(stationId), false],
      ['exp', '🧪 ' + t('tabExperiments'), expsDone(stationId), false],
      ['test', '📝 ' + t('tabTest'), prog.passed, !testUnlocked(stationId) && !prog.passed],
    ];
    for (const [id, label, done, locked] of items) {
      const b = h(
        'button',
        { class: 'tab' + (tab === id ? ' on' : ''), role: 'tab', 'aria-selected': tab === id ? 'true' : 'false' },
        label,
        done ? h('span', { class: 'tick' }, '✓') : locked ? h('span', { class: 'lock' }, '🔒') : null,
      );
      b.addEventListener('click', () => {
        if (quizActive && id !== 'test') quizActive = false;
        tab = id;
        openExp = null;
        sfx('click');
        render();
      });
      tabs.appendChild(b);
    }
  }

  function render() {
    doCleanup();
    eyebrow.textContent = t('station') + ' ' + meta.num + ' · ' + levelName(state.level);
    title.textContent = L(meta.title);
    closeBtn.setAttribute('aria-label', t('close'));
    renderTabs();
    clear(body);
    clear(foot);
    foot.hidden = true;
    body.scrollTop = 0;
    if (tab === 'learn') renderLearn();
    else if (tab === 'exp') (openExp ? renderExperiment(openExp) : renderExpList());
    else renderTest();
  }

  // ---------- Learn ----------
  function renderLearn() {
    const pages = pagesFor(stationId);
    if (pageIdx >= pages.length) pageIdx = pages.length - 1;
    const page = pages[pageIdx];
    if (!prog.seen.includes(page.id)) {
      prog.seen.push(page.id);
      save();
      renderTabs();
    }
    const vis = h('div', { class: 'visual' });
    const lvl = page.level || 1;
    const text = h(
      'div',
      { class: 'lesson-text' },
      lvl > 1 ? h('div', { class: 'level-pill l' + lvl }, lvl === 2 ? '🔬 ' : '🚀 ', t('levelOnly', { level: levelName(lvl) })) : null,
      h('h3', null, L(page.title)),
      h('div', { class: 'prose', html: md(L(page.text)) }),
      page.bip ? h('div', { class: 'speaker' }, h('div', { class: 'av', html: face('bip', 52, page.bipMood) }), h('div', { class: 'bubble bip' }, h('b', { class: 'who' }, t('bip')), L(page.bip, { name: state.name }))) : null,
    );
    body.appendChild(h('div', { class: 'lesson' }, vis, text));
    cleanup = renderVisual(vis, page.visual);

    foot.hidden = false;
    const prev = h('button', { class: 'btn', disabled: pageIdx === 0 }, '← ' + t('prev'));
    prev.addEventListener('click', () => {
      pageIdx--;
      sfx('click');
      render();
    });
    const dots = h('div', { class: 'page-dots', 'aria-label': t('pageOf', { a: pageIdx + 1, b: pages.length }) });
    pages.forEach((p, i) => {
      const d = h('button', { class: (i === pageIdx ? 'on ' : '') + (prog.seen.includes(p.id) ? 'seen' : ''), 'aria-label': t('pageOf', { a: i + 1, b: pages.length }) });
      d.addEventListener('click', () => {
        pageIdx = i;
        render();
      });
      dots.appendChild(d);
    });
    const counter = h('span', { class: 'eyebrow' }, t('pageOf', { a: pageIdx + 1, b: pages.length }));
    let reading = false;
    const readBtn = canSpeak() ? h('button', { class: 'btn small ghost' }, '🔊 ' + t('readPage')) : null;
    if (readBtn) {
      readBtn.addEventListener('click', () => {
        if (reading) {
          stopSpeaking();
          reading = false;
          readBtn.textContent = '🔊 ' + t('readPage');
          return;
        }
        reading = true;
        readBtn.textContent = '⏹ ' + t('stopReading');
        speak(L(page.title) + '. ' + L(page.text) + (page.bip ? ' ' + L(page.bip, { name: state.name }) : ''), () => {
          reading = false;
          readBtn.textContent = '🔊 ' + t('readPage');
        });
      });
    }
    const last = pageIdx === pages.length - 1;
    const next = h('button', { class: 'btn primary' }, last ? '🧪 ' + t('toExperiments') : t('next') + ' →');
    next.addEventListener('click', () => {
      sfx('click');
      if (last) {
        tab = 'exp';
      } else pageIdx++;
      render();
    });
    foot.append(prev, h('div', { class: 'row-btns' }, counter, dots, readBtn), next);
    if (state.tts) speak(L(page.title) + '. ' + L(page.text));
  }

  // ---------- Experiments ----------
  function renderExpList() {
    const list = expsFor(stationId);
    const req = requiredExps(stationId).map((e) => e.id);
    const grid = h('div', { class: 'exp-grid' });
    for (const e of list) {
      const mod = EXPERIMENTS[e.id];
      if (!mod) continue;
      const done = prog.exps.includes(e.id);
      const c = h(
        'button',
        { class: 'exp-card', type: 'button' },
        h('div', { class: 'ico' }, mod.icon),
        h('h4', null, L(mod.title)),
        h('p', null, L(mod.desc)),
        h(
          'div',
          { class: 'row' },
          req.includes(e.id) ? h('span', { class: 'chip req' }, t('required')) : h('span', { class: 'chip opt' }, t('optional')),
          done ? h('span', { class: 'chip done' }, '✓ ' + t('done')) : null,
        ),
      );
      c.addEventListener('click', () => {
        openExp = e.id;
        sfx('open');
        render();
      });
      grid.appendChild(c);
    }
    body.appendChild(grid);
    if (expsDone(stationId) && !prog.passed) {
      foot.hidden = false;
      const go = h('button', { class: 'btn primary' }, '📝 ' + t('tabTest') + ' →');
      go.addEventListener('click', () => {
        tab = 'test';
        render();
      });
      foot.append(h('span'), go);
    }
  }

  function renderExperiment(id) {
    const mod = EXPERIMENTS[id];
    const back = h('button', { class: 'btn small' }, '← ' + t('backToList'));
    back.addEventListener('click', () => {
      openExp = null;
      render();
    });
    const banner = h('div');
    const top = h('div', { class: 'row-btns', style: { marginBottom: '14px', justifyContent: 'space-between' } }, back, h('h3', { style: { fontSize: '22px', flex: 1 } }, mod.icon + ' ' + L(mod.title)));
    const root = h('div');
    body.append(top, banner, root);
    const api = makeApi({
      level: state.level,
      sfx,
      alreadyDone: prog.exps.includes(id),
      onComplete: () => {
        if (!prog.exps.includes(id)) {
          prog.exps.push(id);
          save();
        }
        renderTabs();
        clear(banner);
        const next = h('button', { class: 'btn small good' }, testUnlocked(stationId) && !prog.passed ? '📝 ' + t('tabTest') + ' →' : '← ' + t('backToList'));
        next.addEventListener('click', () => {
          if (testUnlocked(stationId) && !prog.passed) tab = 'test';
          openExp = null;
          render();
        });
        banner.appendChild(h('div', { class: 'done-banner', style: { marginBottom: '14px', justifyContent: 'space-between', flexWrap: 'wrap' } }, h('span', null, '🎉 ' + t('experimentDone')), next));
        game.robotHappy();
      },
    });
    try {
      mod.mount(root, api);
    } catch (err) {
      console.error(err);
      root.appendChild(h('p', null, 'Oops: ' + err.message));
    }
    cleanup = () => api.destroy();
  }

  // ---------- Test ----------
  function renderTest() {
    quizActive = false;
    const wrap = h('div', { class: 'quiz' });
    body.appendChild(wrap);
    if (!testUnlocked(stationId) && !prog.passed) {
      const list = h('div', { class: 'lock-list' });
      const pages = pagesFor(stationId);
      const seenCount = pages.filter((p) => prog.seen.includes(p.id)).length;
      list.appendChild(h('div', { class: 'mission' + (learnDone(stationId) ? ' done' : '') }, h('div', { class: 'box' }, learnDone(stationId) ? '✓' : ''), h('div', { class: 'txt' }, t('testReadAll', { n: pages.length }) + ` (${seenCount}/${pages.length})`)));
      for (const e of requiredExps(stationId)) {
        const done = prog.exps.includes(e.id);
        list.appendChild(h('div', { class: 'mission' + (done ? ' done' : '') }, h('div', { class: 'box' }, done ? '✓' : ''), h('div', { class: 'txt' }, t('testDoExp', { title: L(EXPERIMENTS[e.id].title) }))));
      }
      wrap.append(h('div', { class: 'say' }, h('div', { class: 'av', html: face('ada', 56) }), h('div', { class: 'bubble' }, h('b', { class: 'who' }, t('ada')), t('testLockedTitle'))), h('div', { class: 'card' }, list));
      return;
    }
    const pool = content.quiz;
    const n = { 1: 4, 2: 6, 3: 8 }[state.level];
    const p = passMark(n);
    const intro = h(
      'div',
      { class: 'result' },
      h('div', { html: face('ada', 96) }),
      h('h3', null, '📝 ' + t('tabTest')),
      prog.passed ? h('p', null, t('alreadyPassed', { a: prog.best, b: prog.bestOf || n })) : null,
      h('p', { style: { fontSize: '19px' } }, t('testIntro', { n, p })),
    );
    const start = h('button', { class: 'btn primary big' }, prog.passed ? t('testRetake') : t('testStart'));
    intro.appendChild(start);
    wrap.appendChild(intro);
    start.addEventListener('click', () => {
      quizActive = true;
      sfx('open');
      const qs = pickQuestions(pool, state.level, n);
      runQuiz(body, qs, {
        onFinish: (score, total) => {
          quizActive = false;
          showResult(score, total, passMark(total));
        },
      });
    });
  }

  function showResult(score, total, need) {
    clear(body);
    const passed = score >= need;
    prog.attempts++;
    const firstPass = passed && !prog.passed;
    if (passed) {
      if (score > prog.best || !prog.passed) {
        prog.best = score;
        prog.bestOf = total;
      }
      prog.passed = true;
    }
    save();
    renderTabs();
    const stars = passed ? (score === total ? 3 : score >= total - 1 ? 2 : 1) : 0;
    const res = h(
      'div',
      { class: 'result' },
      h('div', { html: passed ? face('bip', 110, 'happy') : face('ada', 110) }),
      h('div', { class: 'stars', 'aria-label': stars + '/3' }, '★'.repeat(stars) + '☆'.repeat(3 - stars)),
      h('h3', null, passed ? t('resultPass') : t('resultFail')),
      h('p', { style: { fontSize: '20px' } }, t('resultScore', { a: score, b: total })),
      h('p', { style: { maxWidth: '52ch' } }, passed ? t('resultPassMsg') : t('resultFailMsg', { p: need })),
    );
    const row = h('div', { class: 'row-btns', style: { justifyContent: 'center' } });
    if (passed) {
      const b = h('button', { class: 'btn primary big' }, '🏝️ ' + t('backToIsland'));
      b.addEventListener('click', () => {
        close();
        if (firstPass) game.onStationPassed(stationId);
      });
      row.appendChild(b);
      sfx('fanfare');
      const burst = h('div', { class: 'core-burst' }, h('div', { class: 'gem', style: { background: meta.color } }));
      panel.appendChild(burst);
      setTimeout(() => burst.remove(), 1700);
    } else {
      const review = h('button', { class: 'btn' }, '📖 ' + t('reviewLessons'));
      review.addEventListener('click', () => {
        tab = 'learn';
        pageIdx = 0;
        render();
      });
      const again = h('button', { class: 'btn primary' }, '🔁 ' + t('testRetake'));
      again.addEventListener('click', () => {
        tab = 'test';
        render();
      });
      row.append(review, again);
      sfx('bad');
    }
    res.appendChild(row);
    body.appendChild(res);
  }

  // First visit: Ada introduces the station.
  render();
  sfx('open');
  if (content.intro && !prog.introSeen) {
    prog.introSeen = true;
    save();
    game.dialog(content.intro);
  }

  return {
    refresh() {
      if (quizActive) return; // don't wipe a test in progress
      render();
    },
    close,
  };
}
