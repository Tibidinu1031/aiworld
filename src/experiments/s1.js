import { h, clear, shuffle } from '../ui/dom.js';
import { L } from '../i18n.js';
import { btn, card, bubble, layout } from './kit.js';

// ---------- Sort it: fixed rules or learning? ----------
const THINGS = [
  { e: '🧮', n: { en: 'Calculator', ro: 'Calculator de buzunar' }, a: 'rules', why: { en: 'A calculator follows the same math rules every time. It never learns anything new.', ro: 'Un calculator de buzunar urmează mereu aceleași reguli de matematică. Nu învață niciodată ceva nou.' } },
  { e: '💡', n: { en: 'Light switch', ro: 'Întrerupător' }, a: 'rules', why: { en: 'One simple rule: up = on, down = off.', ro: 'O singură regulă simplă: sus = aprins, jos = stins.' } },
  { e: '📧', n: { en: 'Spam filter', ro: 'Filtru de spam' }, a: 'learn', why: { en: 'It learned from millions of emails that people marked as spam.', ro: 'A învățat din milioane de e-mailuri pe care oamenii le-au marcat drept spam.' } },
  { e: '🤳', n: { en: 'Face unlock', ro: 'Deblocare cu fața' }, a: 'learn', why: { en: 'A neural network learned what faces look like from many examples.', ro: 'O rețea neuronală a învățat cum arată fețele din multe exemple.' } },
  { e: '⏲️', n: { en: 'Microwave timer', ro: 'Cronometru de cuptor' }, a: 'rules', why: { en: 'It just counts down. Rules, not learning.', ro: 'Doar numără invers. Reguli, nu învățare.' } },
  { e: '📺', n: { en: 'Video suggestions', ro: 'Sugestii de filme' }, a: 'learn', why: { en: 'It learns what you might like from what millions of people watched.', ro: 'Învață ce ți-ar putea plăcea din ce au urmărit milioane de oameni.' } },
  { e: '🗣️', n: { en: 'Voice assistant', ro: 'Asistent vocal' }, a: 'learn', why: { en: 'It learned to understand speech from thousands of hours of recordings.', ro: 'A învățat să înțeleagă vorbirea din mii de ore de înregistrări.' } },
  { e: '🚦', n: { en: 'Timer traffic light', ro: 'Semafor cu cronometru' }, a: 'rules', why: { en: 'A traffic light on a timer just repeats: green, yellow, red.', ro: 'Un semafor cu cronometru doar repetă: verde, galben, roșu.' } },
  { e: '🌍', n: { en: 'Translation app', ro: 'Aplicație de traducere' }, a: 'learn', why: { en: 'It learned from huge amounts of text in many languages.', ro: 'A învățat din cantități uriașe de text în multe limbi.' } },
  { e: '⏰', n: { en: 'Alarm clock', ro: 'Ceas deșteptător' }, a: 'rules', why: { en: 'It rings at the time you set. Always the same rule.', ro: 'Sună la ora pe care o setezi. Mereu aceeași regulă.' } },
];

export const aiOrNot = {
  icon: '🗂️',
  title: { en: 'Rules or Learning? Sort it!', ro: 'Reguli sau învățare? Sortează!' },
  desc: { en: 'Sort 10 everyday machines: do they follow fixed rules, or did they learn from data?', ro: 'Sortează 10 aparate de zi cu zi: urmează reguli fixe sau au învățat din date?' },
  mount(root, api) {
    const T = api.T;
    let pile = [];
    let placed = { rules: [], learn: [] };
    let sel = null;
    let mistakes = 0;
    const missions = api.missions([
      { id: 'all', t: { en: 'Put all 10 cards in the right box', ro: 'Pune toate cele 10 cartonașe în cutia potrivită' } },
      { id: 'clean', t: { en: 'Sort all 10 with 2 mistakes or fewer (use "Start again" to retry)', ro: 'Sortează toate 10 cu cel mult 2 greșeli (folosește „Ia-o de la capăt” ca să reîncerci)' }, level: 2 },
    ]);
    const say = bubble('ada', T({ en: 'Click a card, then click the box where it belongs.', ro: 'Apasă pe un cartonaș, apoi pe cutia în care se potrivește.' }));
    const pileEl = h('div', { class: 'cards' });
    const binEls = {};
    const bins = h('div', { class: 'bins' });
    for (const [key, e, title] of [
      ['rules', '📜', { en: 'Follows fixed rules', ro: 'Urmează reguli fixe' }],
      ['learn', '🧠', { en: 'Learned from data', ro: 'A învățat din date' }],
    ]) {
      const inner = h('div', { class: 'cards' });
      const bin = h('div', { class: 'bin', role: 'button', tabindex: 0 }, h('h4', null, e + ' ' + T(title)), inner);
      bin.addEventListener('click', () => drop(key));
      bin.addEventListener('keydown', (ev) => ev.key === 'Enter' && drop(key));
      binEls[key] = { bin, inner };
      bins.appendChild(bin);
    }
    const counter = h('div', { class: 'note' });
    const reset = btn('🔁 ' + T({ en: 'Start again', ro: 'Ia-o de la capăt' }), () => start(), 'small');

    function start() {
      pile = shuffle(THINGS);
      placed = { rules: [], learn: [] };
      sel = null;
      mistakes = 0;
      say.set(T({ en: 'Click a card, then click the box where it belongs.', ro: 'Apasă pe un cartonaș, apoi pe cutia în care se potrivește.' }));
      render();
    }
    function render() {
      clear(pileEl);
      for (const it of pile) {
        const c = h('button', { class: 'pick' + (sel === it ? ' sel' : ''), type: 'button' }, h('span', { class: 'e' }, it.e), T(it.n));
        c.addEventListener('click', () => {
          sel = sel === it ? null : it;
          api.sfx('click');
          render();
        });
        pileEl.appendChild(c);
      }
      if (!pile.length) pileEl.appendChild(h('div', { class: 'note' }, '🎉 ' + T({ en: 'All sorted!', ro: 'Totul e sortat!' })));
      for (const k of ['rules', 'learn']) {
        clear(binEls[k].inner);
        binEls[k].bin.classList.toggle('ready', !!sel);
        for (const it of placed[k]) binEls[k].inner.appendChild(h('span', { class: 'pick ok' }, h('span', { class: 'e' }, it.e), T(it.n)));
      }
      counter.textContent = T({ en: `Sorted: ${10 - pile.length}/10 · Mistakes: ${mistakes}`, ro: `Sortate: ${10 - pile.length}/10 · Greșeli: ${mistakes}` });
    }
    function drop(key) {
      if (!sel) return;
      const it = sel;
      if (it.a === key) {
        pile = pile.filter((x) => x !== it);
        placed[key].push(it);
        sel = null;
        api.sfx('good');
        say.set('✅ ' + T(it.why), 'happy');
        render();
        if (!pile.length) {
          missions.check('all');
          if (mistakes <= 2) missions.check('clean');
          else say.set(T({ en: `All sorted with ${mistakes} mistakes. Can you do it with 2 or fewer? Press "Start again".`, ro: `Totul sortat cu ${mistakes} greșeli. Poți cu 2 sau mai puține? Apasă „Ia-o de la capăt”.` }));
        }
      } else {
        mistakes++;
        api.sfx('bad');
        say.set('🤔 ' + T({ en: 'Hmm, not that box. Think: does it change what it does after seeing examples? ', ro: 'Hmm, nu în cutia asta. Gândește-te: își schimbă comportamentul după ce vede exemple? ' }));
        sel = null;
        render();
      }
    }
    layout(root, {
      intro: T({ en: 'Some machines just follow rules that a person wrote. Others learned from lots of examples (data). Sort them!', ro: 'Unele aparate doar urmează reguli scrise de un om. Altele au învățat din multe exemple (date). Sortează-le!' }),
      stage: [card(null, pileEl), bins],
      side: [say.el, missions.el, card(null, counter, h('div', { style: { marginTop: '8px' } }, reset))],
    });
    start();
  },
};

// ---------- Build a cat detector with rules ----------
const FEATURES = [
  { id: 'fur', t: { en: 'Has fur', ro: 'Are blană' } },
  { id: 'whiskers', t: { en: 'Has whiskers', ro: 'Are mustăți' } },
  { id: 'pointy', t: { en: 'Has pointy ears', ro: 'Are urechi ascuțite' } },
  { id: 'legs4', t: { en: 'Has four legs', ro: 'Are patru picioare' } },
  { id: 'tail', t: { en: 'Has a tail', ro: 'Are coadă' } },
  { id: 'small', t: { en: 'Is small', ro: 'Este mic' } },
];
const ANIMALS = [
  { e: '🐱', n: { en: 'Ginger cat', ro: 'Pisică roșcată' }, cat: true, f: { fur: 1, whiskers: 1, pointy: 1, legs4: 1, tail: 1, small: 1 } },
  { e: '🐈‍⬛', n: { en: 'Black cat', ro: 'Pisică neagră' }, cat: true, f: { fur: 1, whiskers: 1, pointy: 1, legs4: 1, tail: 1, small: 1 } },
  { e: '🐈', n: { en: 'Cat with no tail', ro: 'Pisică fără coadă' }, cat: true, f: { fur: 1, whiskers: 1, pointy: 1, legs4: 1, tail: 0, small: 1 } },
  { e: '🦊', n: { en: 'Fox', ro: 'Vulpe' }, cat: false, f: { fur: 1, whiskers: 1, pointy: 1, legs4: 1, tail: 1, small: 0 } },
  { e: '🐶', n: { en: 'Dog', ro: 'Câine' }, cat: false, f: { fur: 1, whiskers: 1, pointy: 0, legs4: 1, tail: 1, small: 0 } },
  { e: '🐰', n: { en: 'Rabbit', ro: 'Iepure' }, cat: false, f: { fur: 1, whiskers: 1, pointy: 1, legs4: 1, tail: 1, small: 1 } },
  { e: '🐭', n: { en: 'Mouse', ro: 'Șoarece' }, cat: false, f: { fur: 1, whiskers: 1, pointy: 0, legs4: 1, tail: 1, small: 1 } },
  { e: '🦭', n: { en: 'Seal', ro: 'Focă' }, cat: false, f: { fur: 1, whiskers: 1, pointy: 0, legs4: 0, tail: 1, small: 0 } },
  { e: '🦉', n: { en: 'Owl', ro: 'Bufniță' }, cat: false, f: { fur: 0, whiskers: 0, pointy: 1, legs4: 0, tail: 1, small: 1 } },
];

export const ruleBuilder = {
  icon: '🐱',
  title: { en: 'Write Rules for a Cat Detector', ro: 'Scrie reguli pentru un detector de pisici' },
  desc: { en: 'Pick rules like "has whiskers" and see if your detector can find every cat, and only cats.', ro: 'Alege reguli ca „are mustăți” și vezi dacă detectorul tău găsește toate pisicile, și doar pisicile.' },
  mount(root, api) {
    const T = api.T;
    const on = new Set();
    const tried = new Set();
    let best = 0;
    const missions = api.missions([
      { id: 'three', t: { en: 'Try 3 different sets of rules', ro: 'Încearcă 3 seturi diferite de reguli' } },
      { id: 'eight', t: { en: 'Get 8 of the 9 animals right', ro: 'Nimerește 8 din cele 9 animale' } },
      { id: 'why', t: { en: 'Find out why 9 of 9 is impossible', ro: 'Află de ce 9 din 9 este imposibil' } },
    ]);
    const say = bubble('ada', T({ en: 'Tick the rules. An animal counts as a CAT only if it matches every rule you ticked.', ro: 'Bifează regulile. Un animal e considerat PISICĂ doar dacă se potrivește cu toate regulile bifate.' }));
    const rulesBox = h('div', { class: 'cards' });
    const grid = h('div', { class: 'cards' });
    const score = h('div', { class: 'bigstat' });
    const whyBtn = btn('❓ ' + T({ en: 'Why can\'t I get 9 of 9?', ro: 'De ce nu pot obține 9 din 9?' }), () => {
      say.set(
        T({
          en: 'Look at the rabbit 🐰: fur, whiskers, pointy ears, four legs, a tail, and small. Exactly like a cat! These simple rules can\'t tell them apart. A learning AI looks at thousands of photos and discovers subtle clues, like the shape of the face and eyes.',
          ro: 'Uită-te la iepure 🐰: blană, mustăți, urechi ascuțite, patru picioare, coadă și e mic. Exact ca o pisică! Regulile simple nu îi pot deosebi. O IA care învață se uită la mii de poze și descoperă indicii subtile, cum ar fi forma feței și a ochilor.',
        }),
      );
      missions.check('why');
    }, 'small');
    whyBtn.hidden = true;

    FEATURES.forEach((f) => {
      const b = h('button', { class: 'pick', type: 'button', 'aria-pressed': 'false' }, h('span', { class: 'e' }, '☐'), T(f.t));
      b.addEventListener('click', () => {
        if (on.has(f.id)) on.delete(f.id);
        else on.add(f.id);
        b.classList.toggle('sel', on.has(f.id));
        b.querySelector('.e').textContent = on.has(f.id) ? '☑' : '☐';
        b.setAttribute('aria-pressed', on.has(f.id) ? 'true' : 'false');
        api.sfx('click');
        evaluate();
      });
      rulesBox.appendChild(b);
    });

    function evaluate() {
      clear(grid);
      let right = 0;
      for (const a of ANIMALS) {
        const says = [...on].every((id) => a.f[id]);
        const ok = says === a.cat;
        if (ok) right++;
        grid.appendChild(
          h('div', { class: 'pick ' + (ok ? 'ok' : 'no') }, h('span', { class: 'e' }, a.e), T(a.n), h('b', null, says ? '🐱 ' + T({ en: 'CAT', ro: 'PISICĂ' }) : '✖ ' + T({ en: 'not cat', ro: 'nu e pisică' }))),
        );
      }
      score.textContent = `${right} / 9`;
      if (on.size) tried.add([...on].sort().join(','));
      if (tried.size >= 3) missions.check('three');
      best = Math.max(best, right);
      if (right >= 8) {
        missions.check('eight');
        whyBtn.hidden = false;
        say.set(T({ en: '8 of 9! That\'s the best simple rules can do here. One animal keeps fooling the detector...', ro: '8 din 9! Asta e cel mai bine ce pot face reguli simple aici. Un animal tot păcălește detectorul...' }), 'happy');
      } else if (on.size === 0) {
        say.set(T({ en: 'No rules ticked, so every animal counts as a cat! Tick some rules.', ro: 'Nicio regulă bifată, așa că orice animal e considerat pisică! Bifează niște reguli.' }));
      } else {
        say.set(T({ en: `Your detector gets ${right} of 9 right. Red cards are mistakes. Try other rules!`, ro: `Detectorul tău nimerește ${right} din 9. Cartonașele roșii sunt greșeli. Încearcă alte reguli!` }));
      }
    }
    layout(root, {
      intro: T({ en: 'Writing rules sounds easy. Can you write rules that find all 3 cats and nothing else?', ro: 'A scrie reguli pare ușor. Poți scrie reguli care găsesc toate cele 3 pisici și nimic altceva?' }),
      stage: [card(T({ en: 'Your rules', ro: 'Regulile tale' }), rulesBox), card(T({ en: 'What your detector says', ro: 'Ce spune detectorul tău' }), grid)],
      side: [say.el, card(T({ en: 'Correct', ro: 'Corecte' }), score, h('div', { style: { marginTop: '10px' } }, whyBtn)), missions.el],
    });
    evaluate();
    void L;
  },
};
