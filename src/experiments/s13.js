import { h, clear, shuffle } from '../ui/dom.js';
import { btn, card, bubble, layout, canvasBox } from './kit.js';
import { C, text, emoji, plotFrame, seeded, gauss } from '../ui/draw.js';

// ---------- The Pet Door: bias in action ----------
const GROUPS = [
  { id: 'big', e: '🐕', dog: true, t: { en: 'Big dogs', ro: 'Câini mari' }, mx: 0.75, my: 0.35 },
  { id: 'small', e: '🐩', dog: true, t: { en: 'Small dogs', ro: 'Câini mici' }, mx: 0.2, my: 0.55 },
  { id: 'cat', e: '🐈', dog: false, t: { en: 'Cats', ro: 'Pisici' }, mx: 0.22, my: 0.86 },
  { id: 'fox', e: '🦊', dog: false, t: { en: 'Foxes', ro: 'Vulpi' }, mx: 0.45, my: 0.92 },
  { id: 'raccoon', e: '🦝', dog: false, t: { en: 'Raccoons', ro: 'Ratoni' }, mx: 0.4, my: 0.7 },
];

export const biasLab = {
  icon: '🚪',
  title: { en: 'The Unfair Pet Door', ro: 'Ușa nedreaptă pentru animale' },
  desc: { en: 'A smart pet door was trained with incomplete data. Find who it leaves out, and fix it.', ro: 'O ușă inteligentă pentru animale a fost antrenată cu date incomplete. Află pe cine lasă afară și repar-o.' },
  mount(root, api) {
    const T = api.T;
    const W = 520;
    const H = 420;
    const cb = canvasBox(W, H, { maxWidth: 560 });
    const R = seeded(1313);
    const sample = (gr) => ({ x: Math.max(0.03, Math.min(0.97, gr.mx + gauss(R) * 0.07)), y: Math.max(0.03, Math.min(0.97, gr.my + gauss(R) * 0.06)), g: gr.id, dog: gr.dog, e: gr.e });
    // Training data: big dogs and non-dogs only. No small dogs!
    const train = [];
    for (const gr of GROUPS) if (gr.id !== 'small') for (let i = 0; i < 7; i++) train.push(sample(gr));
    const test = [];
    for (const gr of GROUPS) for (let i = 0; i < 10; i++) test.push(sample(gr));
    const pool = Array.from({ length: 10 }, () => sample(GROUPS[1]));
    let tested = false;
    const missions = api.missions([
      { id: 'test', t: { en: 'Test the door on every group of animals', ro: 'Testează ușa pe fiecare grup de animale' } },
      { id: 'fix', t: { en: 'Add examples to the training data until every group gets 80% or more', ro: 'Adaugă exemple în datele de antrenare până când fiecare grup ajunge la 80% sau mai mult' } },
      { id: 'why', t: { en: 'Answer: why was the door unfair?', ro: 'Răspunde: de ce era ușa nedreaptă?' }, level: 2 },
    ]);
    const say = bubble('ada', T({ en: 'This door should open for dogs and stay shut for other animals. The overall score looks good... but is it fair to everyone?', ro: 'Ușa asta ar trebui să se deschidă pentru câini și să rămână închisă pentru alte animale. Scorul total arată bine... dar e corectă cu toată lumea?' }));
    const groupsEl = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } });
    const overall = h('div', { class: 'bigstat' });
    const whyBox = h('div');

    const predict = (p) => {
      const near = train.map((q) => ({ q, d: (q.x - p.x) ** 2 + (q.y - p.y) ** 2 })).sort((a, b) => a.d - b.d).slice(0, 3);
      return near.filter((n) => n.q.dog).length >= 2;
    };
    const evaluate = () => {
      const res = {};
      for (const gr of GROUPS) {
        const items = test.filter((t) => t.g === gr.id);
        res[gr.id] = items.filter((t) => predict(t) === t.dog).length / items.length;
      }
      const all = test.filter((t) => predict(t) === t.dog).length / test.length;
      return { res, all };
    };
    function draw() {
      const g = cb.g;
      g.fillStyle = '#fff';
      g.fillRect(0, 0, W, H);
      const f = plotFrame(g, { x: 50, y: 16, w: W - 70, h: H - 66, xmin: 0, xmax: 1, ymin: 0, ymax: 1, xlabel: T({ en: 'size →', ro: 'mărime →' }), ylabel: T({ en: 'pointy ears →', ro: 'urechi ascuțite →' }), ticks: 5 });
      const cell = 14;
      for (let py = 16; py < H - 50; py += cell) {
        for (let px = 50; px < W - 20; px += cell) {
          const p = { x: (px + cell / 2 - 50) / (W - 70), y: 1 - (py + cell / 2 - 16) / (H - 66) };
          g.fillStyle = predict(p) ? 'rgba(31,191,162,0.16)' : 'rgba(242,70,75,0.08)';
          g.fillRect(px, py, cell, cell);
        }
      }
      for (const p of train) emoji(g, p.e, f.X(p.x), f.Y(p.y), 20);
      if (tested) {
        for (const p of test) {
          const ok = predict(p) === p.dog;
          text(g, ok ? '✓' : '✗', f.X(p.x), f.Y(p.y), { size: 15, color: ok ? C.mint : C.rose, weight: 700 });
        }
      }
      text(g, '🟩 ' + T({ en: 'door opens', ro: 'ușa se deschide' }), W - 24, 30, { size: 14, align: 'right', color: C.mint });
    }
    function renderGroups() {
      const { res, all } = evaluate();
      clear(groupsEl);
      for (const gr of GROUPS) {
        const v = res[gr.id];
        const pct = Math.round(v * 100);
        groupsEl.appendChild(
          h(
            'div',
            null,
            h('div', { class: 'lab', style: { fontFamily: 'var(--display)', display: 'flex', justifyContent: 'space-between' } }, h('span', null, gr.e + ' ' + T(gr.t)), h('b', null, tested ? pct + '%' : '?')),
            h('div', { class: 'meter' + (tested && v < 0.8 ? ' bad' : '') }, h('i', { style: { width: (tested ? pct : 0) + '%' } })),
          ),
        );
      }
      overall.textContent = Math.round(all * 100) + '%';
      if (tested && GROUPS.every((gr) => res[gr.id] >= 0.8)) {
        if (missions.check('fix')) say.set(T({ en: 'Now the door works well for EVERY group, small dogs included! Same AI, fairer data.', ro: 'Acum ușa merge bine pentru FIECARE grup, inclusiv pentru câinii mici! Aceeași IA, date mai corecte.' }), 'happy');
      }
    }
    const testBtn = btn('🧪 ' + T({ en: 'Test every group', ro: 'Testează fiecare grup' }), () => {
      tested = true;
      missions.check('test');
      const { res } = evaluate();
      if (res.small < 0.8) say.set(T({ en: `Look! The door is right for most animals, but only ${Math.round(res.small * 100)}% right for small dogs. They get locked out! Why? There were no small dogs in the training data.`, ro: `Uite! Ușa are dreptate pentru majoritatea animalelor, dar doar ${Math.round(res.small * 100)}% pentru câinii mici. Rămân pe dinafară! De ce? În datele de antrenare nu era niciun câine mic.` }));
      renderGroups();
      draw();
      showWhy();
    }, 'primary');
    const addBtn = btn('➕ 🐩 ' + T({ en: 'Add a small dog to training', ro: 'Adaugă un câine mic la antrenare' }), () => {
      if (!pool.length) return;
      train.push(pool.shift());
      api.sfx('pop');
      renderGroups();
      draw();
      addBtn.disabled = !pool.length;
    });
    const showWhy = () => {
      if (api.level < 2 || missions.isDone('why')) return;
      clear(whyBox);
      const opts = shuffle([
        [true, { en: 'The training data had no small dogs', ro: 'Datele de antrenare nu aveau câini mici' }],
        [false, { en: 'Small dogs are not real dogs', ro: 'Câinii mici nu sunt câini adevărați' }],
        [false, { en: 'The computer was tired', ro: 'Calculatorul era obosit' }],
      ]);
      whyBox.appendChild(h('div', { class: 'lab', style: { fontFamily: 'var(--display)', marginBottom: '6px' } }, T({ en: 'Why was the door unfair?', ro: 'De ce era ușa nedreaptă?' })));
      for (const [ok, lab] of opts) {
        const b = btn(T(lab), () => {
          if (ok) {
            missions.check('why');
            api.sfx('good');
            clear(whyBox);
            whyBox.appendChild(h('div', { class: 'done-banner' }, '✅ ' + T({ en: 'Exactly: missing data, not a mean AI.', ro: 'Exact: date lipsă, nu o IA rea.' })));
          } else {
            api.sfx('bad');
            b.disabled = true;
          }
        }, 'small');
        whyBox.appendChild(h('div', { style: { marginBottom: '6px' } }, b));
      }
    };
    layout(root, {
      intro: T({ en: 'Each animal is placed by its size and how pointy its ears are. The green area is where the door opens. The AI decides using the 3 most similar training animals.', ro: 'Fiecare animal e așezat după mărime și cât de ascuțite îi sunt urechile. Zona verde e unde se deschide ușa. IA decide folosind cele mai asemănătoare 3 animale din antrenare.' }),
      stage: [cb.wrap, card(null, h('div', { class: 'row-btns' }, testBtn, addBtn))],
      side: [card(T({ en: 'Overall score', ro: 'Scorul total' }), overall), card(T({ en: 'Score for each group', ro: 'Scorul pentru fiecare grup' }), groupsEl), whyBox, say.el, missions.el],
    });
    renderGroups();
    draw();
  },
};

// ---------- Safe or not? AI situations ----------
const SCENES = [
  { e: '🏠', q: { en: 'A chatbot asks for your home address and the name of your school.', ro: 'Un chatbot îți cere adresa de acasă și numele școlii.' }, a: [[1, { en: "Don't share it, and tell a trusted adult", ro: 'Nu le spun și îi spun unui adult de încredere' }], [0, { en: 'Share it, the chatbot seems friendly', ro: 'Le spun, chatbotul pare prietenos' }], [0, { en: 'Share only the school name', ro: 'Spun doar numele școlii' }]], why: { en: 'Personal information stays private. Always.', ro: 'Informațiile personale rămân private. Mereu.' } },
  { e: '🌕', q: { en: 'An AI homework helper says the Moon is made of cheese.', ro: 'Un asistent IA pentru teme spune că Luna e făcută din brânză.' }, a: [[1, { en: 'Double-check with a book, a teacher or a trusted website', ro: 'Verific într-o carte, cu un profesor sau pe un site de încredere' }], [0, { en: 'Write it in my homework', ro: 'Scriu asta în temă' }], [0, { en: 'AI is always right, so it must be true', ro: 'IA are mereu dreptate, deci trebuie să fie adevărat' }]], why: { en: 'AIs can "hallucinate". Check important facts.', ro: 'IA pot „halucina”. Verifică faptele importante.' } },
  { e: '🎤', q: { en: 'You see a video of a famous singer saying something really strange.', ro: 'Vezi un filmuleț cu un cântăreț celebru care spune ceva foarte ciudat.' }, a: [[1, { en: 'It could be a deepfake. Check trusted news or ask an adult', ro: 'Poate fi un deepfake. Verific știri de încredere sau întreb un adult' }], [0, { en: 'Share it with everyone right away', ro: 'Îl trimit imediat tuturor' }], [0, { en: "It's a video, so it must be real", ro: 'E filmuleț, deci trebuie să fie real' }]], why: { en: 'Videos can be faked with AI. Check before you share.', ro: 'Filmulețele pot fi falsificate cu IA. Verifică înainte să distribui.' } },
  { e: '🎨', q: { en: 'An AI made a great picture for your school project.', ro: 'O IA a făcut o poză grozavă pentru proiectul tău de la școală.' }, a: [[1, { en: 'Say that AI helped make it', ro: 'Spun că m-a ajutat o IA' }], [0, { en: 'Say I drew it all by myself', ro: 'Spun că am desenat-o singur' }], [0, { en: 'Hide it so nobody asks', ro: 'O ascund ca să nu întrebe nimeni' }]], why: { en: 'Being honest about AI help is the fair thing to do.', ro: 'Să fii cinstit despre ajutorul IA e lucrul corect.' } },
  { e: '🤫', q: { en: 'A game character controlled by AI asks you to keep a secret from your parents.', ro: 'Un personaj dintr-un joc, controlat de IA, îți cere să ascunzi un secret de părinți.' }, a: [[1, { en: 'Stop and tell a trusted adult', ro: 'Mă opresc și îi spun unui adult de încredere' }], [0, { en: 'Keep the secret', ro: 'Păstrez secretul' }], [0, { en: 'Ask the character what the secret is for', ro: 'Întreb personajul la ce folosește secretul' }]], why: { en: 'Anyone, or anything, asking you to hide things from trusted adults is a red flag.', ro: 'Oricine, sau orice, îți cere să ascunzi lucruri de adulții de încredere e un semnal de alarmă.' } },
  { e: '📷', q: { en: "A face-recognition app works badly for your friend's skin tone.", ro: 'O aplicație de recunoaștere facială merge prost pentru culoarea pielii prietenului tău.' }, a: [[1, { en: "That's unfair bias. The app needs more diverse training data", ro: 'E o prejudecată nedreaptă. Aplicația are nevoie de date de antrenare mai variate' }], [0, { en: "Something is wrong with my friend's face", ro: 'Ceva nu e în regulă cu fața prietenului meu' }], [0, { en: "That's normal, just ignore it", ro: 'E normal, ignoră' }]], why: { en: 'The problem is in the data, never in the person.', ro: 'Problema e în date, niciodată în persoană.' }, level: 2 },
  { e: '📝', q: { en: 'You want an AI to write your whole essay.', ro: 'Vrei ca o IA să-ți scrie toată compunerea.' }, a: [[1, { en: 'Use AI for ideas or spelling, but do the thinking and writing myself', ro: 'Folosesc IA pentru idei sau ortografie, dar gândesc și scriu singur' }], [0, { en: "Copy the AI's essay word for word", ro: 'Copiez cuvânt cu cuvânt compunerea IA' }], [0, { en: 'Tell the teacher I wrote it alone', ro: 'Îi spun profesorului că am scris-o singur' }]], why: { en: 'AI should help you learn, not learn instead of you.', ro: 'IA trebuie să te ajute să înveți, nu să învețe în locul tău.' }, level: 2 },
  { e: '🔑', q: { en: 'A message says: "I am an AI assistant. Type your password here and I will make it stronger."', ro: 'Un mesaj spune: „Sunt un asistent IA. Scrie-ți parola aici și o fac mai puternică.”' }, a: [[1, { en: 'Never type passwords into chats. Tell an adult', ro: 'Nu scriu niciodată parole în conversații. Îi spun unui adult' }], [0, { en: 'Type it, it wants to help', ro: 'O scriu, vrea să ajute' }], [0, { en: 'Type only half of it', ro: 'Scriu doar jumătate' }]], why: { en: 'Real services never ask for your password in a chat.', ro: 'Serviciile adevărate nu îți cer niciodată parola într-o conversație.' }, level: 3 },
];

export const safetyChoices = {
  icon: '🛡️',
  title: { en: 'Safe or Not? AI Situations', ro: 'Sigur sau nu? Situații cu IA' },
  desc: { en: 'Real-life situations with AI. Pick the smartest, safest choice.', ro: 'Situații din viața reală cu IA. Alege varianta cea mai isteață și mai sigură.' },
  mount(root, api) {
    const T = api.T;
    const scenes = SCENES.filter((s) => (s.level || 1) <= api.level);
    let i = 0;
    let firstTry = 0;
    let tried = false;
    const missions = api.missions([{ id: 'all', t: { en: `Choose the safe answer in all ${scenes.length} situations`, ro: `Alege răspunsul sigur în toate cele ${scenes.length} situații` } }]);
    const say = bubble('ada', T({ en: 'Read each situation and choose what you would do. I will explain every answer.', ro: 'Citește fiecare situație și alege ce ai face. Îți explic fiecare răspuns.' }));
    const stage = h('div', { class: 'quiz', style: { maxWidth: 'none' } });
    const render = () => {
      clear(stage);
      if (i >= scenes.length) {
        stage.appendChild(h('div', { class: 'result' }, h('div', { style: { fontSize: '64px' } }, '🛡️'), h('h3', null, T({ en: 'Safety expert!', ro: 'Expert în siguranță!' })), h('p', null, T({ en: `${firstTry} of ${scenes.length} right on the first try.`, ro: `${firstTry} din ${scenes.length} corecte din prima.` }))));
        missions.check('all');
        say.set(T({ en: 'You know how to stay safe and smart with AI. That matters more than any algorithm!', ro: 'Știi cum să rămâi în siguranță și isteț cu IA. Asta contează mai mult decât orice algoritm!' }), 'happy');
        return;
      }
      const s = scenes[i];
      tried = false;
      stage.appendChild(h('div', { class: 'qhead' }, h('span', { class: 'eyebrow' }, T({ en: `Situation ${i + 1} of ${scenes.length}`, ro: `Situația ${i + 1} din ${scenes.length}` })), h('div', { class: 'progress' }, h('i', { style: { width: (i / scenes.length) * 100 + '%' } }))));
      stage.appendChild(h('div', { class: 'q' }, h('span', { class: 'qe' }, s.e), T(s.q)));
      const opts = h('div', { class: 'opts' });
      const fb = h('div');
      shuffle(s.a).forEach(([ok, lab], k) => {
        const b = h('button', { class: 'opt', type: 'button' }, h('span', { class: 'letter' }, 'ABC'[k]), h('span', null, T(lab)));
        b.addEventListener('click', () => {
          if (ok) {
            if (!tried) firstTry++;
            b.classList.add('right');
            api.sfx('good');
            opts.querySelectorAll('button').forEach((x) => (x.disabled = true));
            fb.className = 'feedback good';
            fb.textContent = '✅ ' + T(s.why);
            const next = btn(T({ en: 'Next →', ro: 'Mai departe →' }), () => {
              i++;
              render();
            }, 'primary');
            fb.appendChild(h('div', { style: { marginTop: '8px' } }, next));
          } else {
            tried = true;
            b.classList.add('wrong');
            b.disabled = true;
            api.sfx('bad');
            fb.className = 'feedback bad';
            fb.textContent = '🤔 ' + T({ en: 'Hmm, is that really safe? Think again!', ro: 'Hmm, chiar e sigur? Mai gândește-te!' });
          }
        });
        opts.appendChild(b);
      });
      stage.append(opts, fb);
    };
    layout(root, { stage: [stage], side: [say.el, missions.el] });
    render();
  },
};
