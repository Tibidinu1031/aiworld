import { h, clear } from '../ui/dom.js';
import { btn, card, bubble, layout, slider } from './kit.js';
import { state } from '../state.js';

const CORPUS = {
  en: `the cat sat on the mat .
the cat sat on the sofa .
the dog sat on the mat .
the dog ran in the park .
the cat ran after the ball .
the robot likes the ball .
the robot can jump .
the robot can learn .
the robot can learn from data .
i like my cat .
i like to play in the park .
we play in the park after school .
the sun is hot .
the sun is bright today .
the moon is bright at night .
my dog likes to play .
my cat likes to sleep .
the bird can fly .
the bird sat on the tree .
the fish can swim .
robots can learn from examples .
the robot learns from examples .
i can read a book .
i can ride a bike .
we read a book at school .
once upon a time there was a robot .
once upon a time there was a cat .
once upon a time there was a dragon .
the cat likes fish .
the dog likes the ball .
the ball is red .
the sky is blue .
the sea is blue .
the grass is green .
i am happy today .
the robot is happy .
we are happy .
the cat is sleeping .
the dog is running in the park .
the robot is my friend .
my friend likes to read .`,
  ro: `pisica stă pe covor .
pisica stă pe canapea .
câinele stă pe covor .
câinele aleargă în parc .
pisica aleargă după minge .
robotul iubește mingea .
robotul poate să sară .
robotul poate să învețe .
robotul poate să învețe din date .
eu iubesc pisica mea .
mie îmi place să mă joc în parc .
ne jucăm în parc după școală .
soarele este fierbinte .
soarele este strălucitor azi .
luna este strălucitoare noaptea .
câinele meu vrea să se joace .
pisica mea vrea să doarmă .
pasărea poate să zboare .
pasărea stă pe copac .
peștele poate să înoate .
roboții pot învăța din exemple .
robotul învață din exemple .
eu pot să citesc o carte .
eu pot să merg pe bicicletă .
citim o carte la școală .
a fost odată ca niciodată un robot .
a fost odată ca niciodată o pisică .
a fost odată ca niciodată un dragon .
pisica iubește peștele .
câinele iubește mingea .
mingea este roșie .
cerul este albastru .
marea este albastră .
iarba este verde .
eu sunt fericit azi .
robotul este fericit .
noi suntem fericiți .
pisica doarme .
câinele aleargă prin parc .
robotul este prietenul meu .
prietenul meu vrea să citească .`,
};

const tokenize = (s) =>
  s
    .toLowerCase()
    .replace(/([.,!?])/g, ' $1 ')
    .split(/\s+/)
    .filter(Boolean);

export const nextWord = {
  icon: '💬',
  title: { en: 'Next Word Machine', ro: 'Mașina cuvântului următor' },
  desc: { en: 'Build sentences with a mini language model, teach it new sentences and play with temperature.', ro: 'Construiește propoziții cu un mini model de limbaj, învață-l propoziții noi și joacă-te cu temperatura.' },
  mount(root, api) {
    const T = api.T;
    const lang = state.lang === 'ro' ? 'ro' : 'en';
    const sentences = CORPUS[lang].split('\n').map(tokenize);
    let words = [];
    let temp = 1;
    let twoWords = false;
    let lowGen = false;
    let highGen = false;
    let learnedWord = null;
    let big = {};
    let tri = {};
    const build = () => {
      big = {};
      tri = {};
      for (const s of sentences) {
        const seq = ['^', ...s];
        for (let i = 1; i < seq.length; i++) {
          const a = seq[i - 1];
          ((big[a] ||= {})[seq[i]] ||= 0);
          big[a][seq[i]]++;
          if (i >= 2) {
            const k = seq[i - 2] + ' ' + a;
            ((tri[k] ||= {})[seq[i]] ||= 0);
            tri[k][seq[i]]++;
          }
        }
      }
    };
    build();
    const missions = api.missions([
      { id: 'sentence', t: { en: 'Build a whole sentence by clicking suggestions until you reach "."', ro: 'Construiește o propoziție întreagă apăsând pe sugestii până ajungi la „.”' } },
      { id: 'teach', t: { en: 'Teach the AI a new sentence and see its predictions change', ro: 'Învață IA o propoziție nouă și vezi cum se schimbă predicțiile' } },
      { id: 'temp', t: { en: 'Generate once with temperature 0.3 and once with 2.0. Compare!', ro: 'Generează o dată cu temperatura 0,3 și o dată cu 2,0. Compară!' }, level: 2 },
      { id: 'two', t: { en: 'Switch on "Look at 2 words" and generate a sentence', ro: 'Pornește „Se uită la 2 cuvinte” și generează o propoziție' }, level: 3 },
    ]);
    const say = bubble('bip', T({ en: 'I learned from a tiny book of sentences. Click a word and I will guess the next one!', ro: 'Am învățat dintr-o cărticică de propoziții. Apasă un cuvânt și ghicesc următorul!' }));
    const sentEl = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', minHeight: '52px', alignItems: 'center', fontFamily: 'var(--display)', fontSize: '22px' } });
    const barsEl = h('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } });
    const bookEl = h('div', { class: 'note', style: { maxHeight: '180px', overflow: 'auto', fontSize: '14px', columns: '2', columnGap: '20px' } });

    const probs = () => {
      const last = words.length ? words[words.length - 1] : '^';
      let table = big[last] || {};
      if (twoWords) {
        const prev = words.length >= 2 ? words[words.length - 2] : '^';
        const k = (words.length >= 1 ? prev : '^') + ' ' + last;
        if (words.length >= 1 && tri[k]) table = tri[k];
      }
      const entries = Object.entries(table);
      const total = entries.reduce((s, [, c]) => s + c, 0);
      return entries.map(([w, c]) => ({ w, p: c / total, c })).sort((a, b) => b.p - a.p);
    };
    const sample = (list) => {
      const ws = list.map((x) => Math.pow(x.p, 1 / Math.max(0.05, temp)));
      const s = ws.reduce((a, b) => a + b, 0);
      let r = Math.random() * s;
      for (let i = 0; i < list.length; i++) {
        r -= ws[i];
        if (r <= 0) return list[i].w;
      }
      return list[0].w;
    };
    const add = (w, byClick) => {
      words.push(w);
      if (w === '.') {
        if (byClick) {
          missions.check('sentence');
          say.set(T({ en: 'A whole sentence, one predicted word at a time! That is exactly how chatbots write.', ro: 'O propoziție întreagă, câte un cuvânt prezis pe rând! Exact așa scriu chatboții.' }), 'happy');
        }
      }
      render();
    };
    const render = () => {
      clear(sentEl);
      sentEl.appendChild(h('span', { style: { color: '#8a92b5' } }, '▶'));
      words.forEach((w) => sentEl.appendChild(h('span', { style: { background: w === learnedWord ? '#ffe36b' : '#e8eefc', border: '2.5px solid #1d2340', borderRadius: '10px', padding: '2px 10px' } }, w)));
      clear(barsEl);
      if (words[words.length - 1] === '.') {
        barsEl.appendChild(h('div', { class: 'note' }, T({ en: 'The sentence is finished. Press "Start over" for a new one.', ro: 'Propoziția s-a terminat. Apasă „De la capăt” pentru una nouă.' })));
        return;
      }
      const list = probs();
      if (!list.length) {
        barsEl.appendChild(h('div', { class: 'note' }, T({ en: 'I never saw anything after this word! Teach me a sentence with it.', ro: 'N-am văzut niciodată nimic după acest cuvânt! Învață-mă o propoziție cu el.' })));
        return;
      }
      for (const it of list.slice(0, 6)) {
        const b = h(
          'button',
          { class: 'opt', type: 'button', style: { minHeight: '44px', padding: '6px 12px' } },
          h('span', { style: { minWidth: '90px', fontFamily: 'var(--display)', fontWeight: 600, background: it.w === learnedWord ? '#ffe36b' : 'transparent', borderRadius: '6px', padding: '0 4px' } }, it.w),
          h('span', { style: { flex: 1, height: '18px', background: '#e8eefc', borderRadius: '9px', overflow: 'hidden', border: '2px solid #1d2340' } }, h('i', { style: { display: 'block', height: '100%', width: Math.round(it.p * 100) + '%', background: '#ff6b3d' } })),
          h('span', { style: { minWidth: '48px', textAlign: 'right', fontFamily: 'var(--display)' } }, Math.round(it.p * 100) + '%'),
        );
        b.addEventListener('click', () => {
          if (generating) return;
          api.sfx('click');
          add(it.w, true);
        });
        barsEl.appendChild(b);
      }
    };
    let generating = false;
    const gen = async () => {
      if (generating) return;
      generating = true;
      words = [];
      render();
      for (let i = 0; i < 16; i++) {
        const list = probs();
        if (!list.length) break;
        const w = sample(list);
        await new Promise((r) => api.timeout(r, 220));
        add(w, false);
        api.sfx('blip');
        if (w === '.') break;
      }
      generating = false;
      if (temp <= 0.4) lowGen = true;
      if (temp >= 1.8) highGen = true;
      if (lowGen && highGen) {
        if (missions.check('temp')) say.set(T({ en: 'Low temperature: safe, common sentences. High temperature: wild and surprising, sometimes silly!', ro: 'Temperatură mică: propoziții sigure, obișnuite. Temperatură mare: sălbatice și surprinzătoare, uneori caraghioase!' }));
      }
      if (twoWords) {
        if (missions.check('two')) say.set(T({ en: 'Looking at 2 words gives more context, so the sentences make more sense. Real AIs look at thousands of words at once!', ro: 'Când se uită la 2 cuvinte are mai mult context, deci propozițiile au mai mult sens. IA adevărate se uită la mii de cuvinte deodată!' }), 'happy');
      }
    };
    const input = h('input', { type: 'text', placeholder: T({ en: 'e.g. the robot likes pizza', ro: 'de ex. robotul iubește pizza' }), maxlength: 80 });
    const teachBtn = btn('📖 ' + T({ en: 'Teach this sentence', ro: 'Învață propoziția' }), () => {
      const toks = tokenize(input.value);
      if (toks.length < 3) {
        say.set(T({ en: 'Write at least 3 words, please!', ro: 'Scrie măcar 3 cuvinte, te rog!' }));
        return;
      }
      if (toks[toks.length - 1] !== '.') toks.push('.');
      const known = new Set(sentences.flat());
      learnedWord = toks.find((w) => !known.has(w)) || null;
      sentences.push(toks);
      build();
      input.value = '';
      words = toks.slice(0, Math.max(1, toks.length - 2));
      missions.check('teach');
      say.set(T({ en: 'Learned! My counts changed. Look at the predictions now: your words are in there.', ro: 'Am învățat! Numărătorile mele s-au schimbat. Uită-te acum la predicții: cuvintele tale sunt acolo.' }), 'happy');
      renderBook();
      render();
    }, 'small');
    const sTemp = slider({ label: '🌡️ ' + T({ en: 'Temperature', ro: 'Temperatură' }), min: 0.1, max: 2.5, step: 0.1, value: 1, fmt: (v) => v.toFixed(1), onInput: (v) => (temp = v) });
    if (api.level < 2) sTemp.el.hidden = true;
    const twoBtn = btn('👀 ' + T({ en: 'Look at 2 words', ro: 'Se uită la 2 cuvinte' }), () => {
      twoWords = !twoWords;
      twoBtn.classList.toggle('sun', twoWords);
      render();
    }, 'small');
    if (api.level < 3) twoBtn.hidden = true;
    const renderBook = () => {
      clear(bookEl);
      sentences.forEach((s) => bookEl.appendChild(h('div', null, s.join(' '))));
    };
    layout(root, {
      intro: T({ en: 'This mini language model counted which word comes after which in its little book. The bars show its guesses for the next word.', ro: 'Acest mini model de limbaj a numărat ce cuvânt urmează după care în cărticica lui. Barele arată ce ghicește pentru cuvântul următor.' }),
      stage: [
        card(T({ en: 'Your sentence', ro: 'Propoziția ta' }), sentEl, h('div', { class: 'row-btns', style: { marginTop: '10px' } }, btn('🔁 ' + T({ en: 'Start over', ro: 'De la capăt' }), () => { words = []; render(); }, 'small'), btn('⌫ ' + T({ en: 'Remove last', ro: 'Șterge ultimul' }), () => { words.pop(); render(); }, 'small'), btn('🎲 ' + T({ en: 'Let the AI write', ro: 'Lasă IA să scrie' }), gen, 'primary'), twoBtn)),
        card(T({ en: 'What comes next?', ro: 'Ce urmează?' }), barsEl),
        card(T({ en: 'The AI\'s whole book', ro: 'Toată cartea IA' }), bookEl),
      ],
      side: [card(T({ en: 'Teach it', ro: 'Învață-l' }), input, h('div', { class: 'row-btns', style: { marginTop: '8px' } }, teachBtn)), card(null, sTemp.el), say.el, missions.el],
    });
    renderBook();
    render();
  },
};

// ---------- Token Chopper ----------
const VOCAB = {
  en: ['the', 'a', 'an', 'robot', 'cat', 'dog', 'is', 'are', 'was', 'play', 'learn', 'happy', 'friend', 'love', 'like', 'read', 'book', 'school', 'park', 'ball', 'fast', 'slow', 'quick', 'i', 'you', 'we', 'they', 'my', 'and', 'to', 'in', 'on', 'it', 'believe', 'amaz', 'incred', 'extra', 'ordin', 'artific', 'intellig', 'comput', 'machine', 'data', 'model', 'train', 'token', 'word', 'fun', 'teach', 'jump', 'run', 'walk', 'talk', 'dino', 'saur', 'super', 'hero', 'un', 're', 'pre', 'dis', 'ing', 'ed', 'er', 'est', 'ly', 's', 'es', 'ness', 'able', 'ible', 'tion', 'ful', 'less', 'ment', 'ence', 'ance', 'ial', 'al', 'ary', 'ize', 'y', 'ie', 'believ', 'ably', 'ibly'],
  ro: ['robot', 'pisic', 'câin', 'este', 'sunt', 'era', 'mă', 'joc', 'învăț', 'fericit', 'priet', 'iub', 'citesc', 'carte', 'școal', 'parc', 'ming', 'repede', 'eu', 'tu', 'noi', 'ei', 'meu', 'mea', 'și', 'la', 'în', 'pe', 'cu', 'de', 'un', 'o', 'inteligen', 'artific', 'calculat', 'mașin', 'date', 'model', 'antren', 'cuvânt', 'dinozaur', 'super', 'erou', 'ne', 're', 'pre', 'ul', 'ului', 'le', 'ile', 'lor', 'ii', 'ți', 'ea', 'ește', 'ează', 'esc', 'ăm', 'ați', 'ă', 'e', 'i', 'a', 'uri', 'ție', 'țe', 'ța', 'ele', 'or', 'abil', 'ință', 'ian', 'ic', 'oare', 'oarele', 'ilor', 'bilitate'],
};

export const tokenizer = {
  icon: '✂️',
  title: { en: 'The Token Chopper', ro: 'Tăietorul de tokeni' },
  desc: { en: 'See how a language AI chops your sentences into tokens and numbers.', ro: 'Vezi cum taie o IA de limbaj propozițiile tale în tokeni și numere.' },
  mount(root, api) {
    const T = api.T;
    const lang = state.lang === 'ro' ? 'ro' : 'en';
    const vocab = [...new Set(VOCAB[lang])].sort((a, b) => b.length - a.length);
    const idOf = (piece) => {
      let hsh = 7;
      for (const ch of piece) hsh = (hsh * 31 + ch.codePointAt(0)) % 50000;
      return hsh + 100;
    };
    let showIds = false;
    const missions = api.missions([
      { id: 'own', t: { en: 'Type your own sentence and count its tokens', ro: 'Scrie propria propoziție și numără-i tokenii' } },
      { id: 'long', t: { en: 'Find a long word that gets chopped into 3 or more pieces', ro: 'Găsește un cuvânt lung care e tăiat în 3 sau mai multe bucăți' } },
      { id: 'ids', t: { en: 'Switch on "Show numbers" to see what the AI really receives', ro: 'Pornește „Arată numerele” ca să vezi ce primește de fapt IA' }, level: 3 },
    ]);
    const say = bubble('ada', T({ en: 'Type anything. The chopper cuts each word into known pieces, trying the longest pieces first.', ro: 'Scrie orice. Tăietorul taie fiecare cuvânt în bucăți cunoscute, încercând mai întâi bucățile cele mai lungi.' }));
    const input = h('input', { type: 'text', value: T({ en: 'The robots are learning fast!', ro: 'Roboții învață repede!' }), maxlength: 120 });
    const out = h('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' } });
    const stats = h('div', { class: 'note', style: { marginTop: '10px' } });
    const colors = ['#ffe9a8', '#d7f6ff', '#ecdfff', '#e4f8ef', '#ffe0ea', '#fff0d9', '#dfe7ff'];
    const chop = (word) => {
      const pieces = [];
      let i = 0;
      const w = word.toLowerCase();
      while (i < w.length) {
        let found = null;
        for (const v of vocab) {
          if (w.startsWith(v, i)) {
            found = v;
            break;
          }
        }
        if (!found) found = w[i];
        pieces.push(word.substr(i, found.length));
        i += found.length;
      }
      return pieces;
    };
    let typed = false;
    const update = () => {
      const text = input.value;
      const parts = text.match(/[\p{L}\p{N}]+|[^\s\p{L}\p{N}]/gu) || [];
      clear(out);
      let count = 0;
      let longest = 0;
      parts.forEach((p, wi) => {
        const pieces = /[\p{L}\p{N}]/u.test(p) ? chop(p) : [p];
        longest = Math.max(longest, pieces.length);
        pieces.forEach((pc, k) => {
          count++;
          out.appendChild(
            h(
              'span',
              { style: { background: colors[count % colors.length], border: '2.5px solid #1d2340', borderRadius: '10px', padding: '4px 10px', fontFamily: 'var(--display)', fontSize: '20px', fontWeight: 600, marginLeft: k === 0 && wi > 0 ? '8px' : '0' } },
              showIds ? String(idOf(pc.toLowerCase())) : pc,
            ),
          );
        });
      });
      const nWords = parts.filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
      stats.textContent = T({ en: `${text.length} characters · ${nWords} words · ${count} tokens`, ro: `${text.length} caractere · ${nWords} cuvinte · ${count} tokeni` });
      if (typed && count > 0) missions.check('own');
      if (longest >= 3) {
        if (missions.check('long')) say.set(T({ en: 'Long or rare words get chopped into several pieces. Common words are usually a single token.', ro: 'Cuvintele lungi sau rare sunt tăiate în mai multe bucăți. Cuvintele obișnuite sunt de obicei un singur token.' }));
      }
    };
    input.addEventListener('input', () => {
      typed = true;
      update();
    });
    const idsBtn = btn('🔢 ' + T({ en: 'Show numbers', ro: 'Arată numerele' }), () => {
      showIds = !showIds;
      idsBtn.classList.toggle('sun', showIds);
      if (showIds) {
        missions.check('ids');
        say.set(T({ en: 'This is what the AI really gets: a list of numbers. Each number points to a token in its vocabulary.', ro: 'Asta primește de fapt IA: o listă de numere. Fiecare număr arată spre un token din vocabularul ei.' }));
      }
      update();
    }, 'small');
    if (api.level < 3) idsBtn.hidden = true;
    layout(root, {
      intro: T({ en: 'Language AIs read text as tokens: whole words or pieces of words. (Real AIs learn their pieces from huge amounts of text; this chopper is a simplified version.)', ro: 'IA de limbaj citesc textul ca tokeni: cuvinte întregi sau bucăți de cuvinte. (IA adevărate își învață bucățile din cantități uriașe de text; acest tăietor este o versiune simplificată.)' }),
      stage: [card(T({ en: 'Type a sentence', ro: 'Scrie o propoziție' }), input, out, stats, h('div', { class: 'row-btns', style: { marginTop: '8px' } }, idsBtn))],
      side: [say.el, missions.el],
    });
    update();
  },
};
