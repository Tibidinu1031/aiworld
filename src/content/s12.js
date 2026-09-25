import { C, emoji, text, box, ease, dot, line, arrow, rr } from '../ui/draw.js';

function bars(g, x, y, w, items, T, highlight = 0) {
  items.forEach(([word, p], i) => {
    const yy = y + i * 46;
    text(g, T(word), x + 90, yy + 16, { size: 19, align: 'right', max: 100 });
    rr(g, x + 100, yy, w * p, 32, 8);
    g.fillStyle = i === highlight ? C.accent : '#b8c3e6';
    g.fill();
    text(g, Math.round(p * 100) + '%', x + 110 + w * p, yy + 16, { size: 16, align: 'left', color: C.ink2 });
  });
}

// Station 12: Language AI
export default {
  id: 's12',
  intro: [
    { who: 'ada', text: { en: 'Station 12: how do chatbots talk? The secret is surprisingly simple: guess the next word. Again and again.', ro: 'Stația 12: cum vorbesc chatboții? Secretul e surprinzător de simplu: ghicește cuvântul următor. Iar și iar.' } },
    { who: 'bip', text: { en: 'Beep boop, I am... a... very... good... robot. See? I predicted every word!', ro: 'Bip bup, eu sunt... un... robot... foarte... bun. Vezi? Am prezis fiecare cuvânt!' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'Talking computers', ro: 'Calculatoare care vorbesc' },
      text: {
        en: 'Chatbots and voice assistants use **language AI**. The biggest ones are called **large language models (LLMs)**, like ChatGPT, Claude and Gemini.\n\nThey can:\n\n- answer questions and explain things\n- help write stories and poems\n- translate between languages\n- summarize long texts\n\nBut how do they actually do it? Let\'s find out.',
        ro: 'Chatboții și asistenții vocali folosesc **IA de limbaj**. Cele mai mari se numesc **modele mari de limbaj** (în engleză *LLM*), ca ChatGPT, Claude și Gemini.\n\nEle pot:\n\n- să răspundă la întrebări și să explice lucruri\n- să ajute la scrierea de povești și poezii\n- să traducă dintr-o limbă în alta\n- să rezume texte lungi\n\nDar cum fac asta de fapt? Hai să aflăm.',
      },
      visual: (g, t, W, H, T) => {
        const msgs = [
          [0, { en: 'Why is the sky blue?', ro: 'De ce e cerul albastru?' }],
          [1, { en: 'Sunlight bounces off tiny bits of air. Blue light bounces the most, so the sky looks blue! 🌤️', ro: 'Lumina soarelui se împrăștie pe particulele mici din aer. Lumina albastră se împrăștie cel mai mult, așa că cerul pare albastru! 🌤️' }],
          [0, { en: 'Cool! Thanks!', ro: 'Tare! Mulțumesc!' }],
        ];
        let y = 40;
        msgs.forEach(([bot, m], i) => {
          const k = ease((t % 9) - i * 1.5);
          if (k <= 0) return;
          g.globalAlpha = k;
          const s = T(m);
          const w = Math.min(420, 30 + s.length * 8.5);
          const lines = Math.ceil((s.length * 9) / 400);
          const hh = 24 + lines * 24;
          const x = bot ? 70 : W - 40 - w;
          box(g, x, y, w, hh, { fill: bot ? '#ecdfff' : '#d7f6ff', r: 18 });
          g.font = `500 17px "Fredoka", sans-serif`;
          g.fillStyle = C.ink;
          g.textAlign = 'left';
          g.textBaseline = 'top';
          let line1 = '';
          let yy = y + 12;
          for (const word of s.split(' ')) {
            if (g.measureText(line1 + ' ' + word).width > w - 26 && line1) {
              g.fillText(line1, x + 13, yy);
              line1 = word;
              yy += 24;
            } else line1 = line1 ? line1 + ' ' + word : word;
          }
          g.fillText(line1, x + 13, yy);
          emoji(g, bot ? '🤖' : '🧒', bot ? 38 : W - 22, y + 20, 30);
          y += hh + 24;
          g.globalAlpha = 1;
        });
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Predict the next word', ro: 'Ghicește cuvântul următor' },
      text: {
        en: 'The main trick of a language model is to **predict the next word**.\n\n"The cat sat on the ___" → "mat"? "sofa"? "moon"?\n\nThe AI gives every possible word a **probability**. It picks one, adds it to the text, and predicts again. Word by word, it writes whole sentences, stories and answers!',
        ro: 'Trucul principal al unui model de limbaj este să **ghicească cuvântul următor**.\n\n„Pisica stă pe un ___” → „covor”? „scaun”? „nor”?\n\nIA dă fiecărui cuvânt posibil o **probabilitate**. Alege unul, îl adaugă la text și ghicește din nou. Cuvânt cu cuvânt, scrie propoziții, povești și răspunsuri întregi!',
      },
      visual: (g, t, W, H, T) => {
        text(g, T({ en: 'The cat sat on the ...', ro: 'Pisica stă pe un ...' }), W / 2, 50, { size: 28 });
        const k = ease((t % 6) / 2);
        const items = [
          [{ en: 'mat', ro: 'covor' }, 0.55 * k],
          [{ en: 'sofa', ro: 'scaun' }, 0.3 * k],
          [{ en: 'floor', ro: 'pat' }, 0.12 * k],
          [{ en: 'moon', ro: 'nor' }, 0.03 * k],
        ];
        bars(g, 90, 110, 330, items, T);
        if ((t % 6) > 3) {
          box(g, W / 2 - 170, H - 90, 340, 56, { fill: C.sun, r: 16 });
          text(g, T({ en: 'The cat sat on the mat.', ro: 'Pisica stă pe un covor.' }), W / 2, H - 62, { size: 22 });
        }
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'Learning from mountains of text', ro: 'Învățăm din munți de text' },
      text: {
        en: 'Where do those probabilities come from? From **reading**. Language models are trained on enormous amounts of text: books, websites, articles, conversations.\n\nIt\'s far more than a person could read in many lifetimes. From all that text, the model learns which words tend to follow which, and much more: grammar, facts, styles, and how ideas connect.\n\nAfter that, people train it further to be helpful, honest and polite.',
        ro: 'De unde vin probabilitățile acelea? Din **citit**. Modelele de limbaj sunt antrenate pe cantități uriașe de text: cărți, site-uri, articole, conversații.\n\nEste mult mai mult decât ar putea citi un om în multe vieți. Din tot acel text, modelul învață ce cuvinte tind să urmeze după altele, și mult mai mult: gramatică, fapte, stiluri și cum se leagă ideile.\n\nDupă aceea, oamenii îl mai antrenează ca să fie de ajutor, cinstit și politicos.',
      },
      visual: (g, t, W, H, T) => {
        for (let i = 0; i < 14; i++) {
          const x = 70 + (i % 7) * 40;
          const y = H - 90 - Math.floor(i / 7) * 110 - ((i * 13) % 3) * 8;
          emoji(g, ['📕', '📗', '📘', '📙', '📰', '🌐', '💬'][i % 7], x, y, 44);
        }
        const k = (t % 3) / 3;
        for (let i = 0; i < 5; i++) {
          const kk = (k + i * 0.2) % 1;
          text(g, ['the', 'cat', 'is', 'a', 'word'][i], 360 + kk * 120, 150 + Math.sin(kk * Math.PI) * -40 + i * 26, { size: 16, color: C.grape });
        }
        box(g, W - 170, H / 2 - 70, 130, 140, { fill: '#ecdfff', r: 20 });
        emoji(g, '🧠', W - 105, H / 2 - 10, 64);
        text(g, 'LLM', W - 105, H / 2 + 48, { size: 20 });
        void T;
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'Tokens', ro: 'Tokenii' },
      text: {
        en: 'Language AIs don\'t really read whole words. They chop text into pieces called **tokens**. A token can be a whole word ("cat"), part of a word ("play" + "ing"), or even a single punctuation mark.\n\nEach token gets a **number** (an ID), because computers work with numbers.\n\nThat is also why AIs sometimes struggle to count the letters in a word: they see tokens, not letters!',
        ro: 'IA de limbaj nu citesc de fapt cuvinte întregi. Taie textul în bucăți numite **tokeni**. Un token poate fi un cuvânt întreg („pisică”), o parte dintr-un cuvânt („pisic” + „ile”) sau chiar un singur semn de punctuație.\n\nFiecare token primește un **număr** (un ID), pentru că, știi deja, calculatoarele lucrează cu numere.\n\nDe aceea IA au uneori greutăți să numere literele dintr-un cuvânt: ele văd tokeni, nu litere!',
      },
      visual: (g, t, W, H, T) => {
        const toks = T({ en: 'The|robot|s| are| play|ing|!', ro: 'Robo|ții| se| jo|acă| fericiț|i|!' }).split('|');
        const ids = [464, 9379, 82, 389, 711, 278, 0, 5];
        const cols = ['#ffe9a8', '#d7f6ff', '#ecdfff', '#e4f8ef', '#ffe0ea', '#fff0d9', '#dfe7ff', '#ffe9a8'];
        const k = Math.floor((t % 8) * 2);
        let x = 40;
        toks.forEach((tk, i) => {
          g.font = `600 26px "Fredoka", sans-serif`;
          const w = g.measureText(tk).width + 22;
          if (i < k) {
            box(g, x, 150, w, 56, { fill: cols[i % cols.length], r: 12 });
            text(g, tk, x + w / 2, 178, { size: 26 });
            if (k > toks.length + 2) text(g, String(ids[i]), x + w / 2, 240, { size: 18, color: C.grape });
          }
          x += w + 8;
        });
        text(g, T({ en: 'Text → tokens → numbers', ro: 'Text → tokeni → numere' }), W / 2, 70, { size: 24 });
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'Chatbots can be wrong', ro: 'Chatboții pot greși' },
      text: {
        en: 'A language model predicts **likely** words. Likely is not the same as **true**!\n\nSometimes a chatbot says something false, and sounds totally confident. This is called a **hallucination**.\n\nSmart habits:\n\n- double-check important facts with a trusted source\n- never share personal information (your address, school, passwords, photos)\n- if something a chatbot says feels wrong or upsetting, tell a trusted adult',
        ro: 'Un model de limbaj prezice cuvinte **probabile**. Probabil nu e același lucru cu **adevărat**!\n\nUneori un chatbot spune ceva fals și sună complet sigur pe el. Asta se numește **halucinație**.\n\nObiceiuri inteligente:\n\n- verifică faptele importante dintr-o sursă de încredere\n- nu împărtăși niciodată informații personale (adresa, școala, parole, poze)\n- dacă ceva ce spune un chatbot ți se pare greșit sau te supără, spune-i unui adult de încredere',
      },
      bip: { en: 'Once I confidently said penguins can fly. They cannot. Always double-check me!', ro: 'Odată am spus foarte sigur pe mine că pinguinii zboară. Nu zboară. Verifică-mă mereu!' },
      visual: {
        type: 'emoji',
        cols: 3,
        items: [
          { e: '🤔', t: { en: 'Likely ≠ true', ro: 'Probabil ≠ adevărat' } },
          { e: '🔍', t: { en: 'Double-check', ro: 'Verifică' } },
          { e: '🔒', t: { en: 'Keep info private', ro: 'Păstrează secretele' } },
        ],
      },
    },
    {
      id: 'p6',
      level: 2,
      title: { en: 'Generative AI: pictures too', ro: 'IA generativă: și poze' },
      text: {
        en: 'AIs that **create** new things are called **generative AI**. Besides text, they can make pictures, music and video.\n\nMany image generators use **diffusion**. During training, they learn to remove noise from noisy pictures. To make a new picture, they start from pure random noise and remove a little noise at a time, guided by your text prompt, until a picture appears!',
        ro: 'IA care **creează** lucruri noi se numesc **IA generativă**. Pe lângă text, pot face poze, muzică și filmulețe.\n\nMulte generatoare de imagini folosesc **difuzia**. La antrenare, învață să scoată zgomotul din poze zgomotoase. Ca să facă o poză nouă, pornesc de la zgomot pur, întâmplător, și îndepărtează câte puțin zgomot, ghidate de textul tău, până apare o poză!',
      },
      visual: (g, t, W, H, T) => {
        const N = 40;
        const s = 8;
        const x0 = W / 2 - (N * s) / 2;
        const y0 = 70;
        const k = Math.min(1, (t % 8) / 6);
        const pic = (x, y) => {
          const cx = x - 20;
          const cy = y - 22;
          if (y > 30) return [67, 176, 92];
          if (cx * cx + (y - 12) ** 2 < 49) return [255, 210, 63];
          if (Math.abs(cx) < 9 - (cy + 10) * 0.9 && cy > -10 && y <= 30) return [242, 70, 75];
          return [120, 190, 240];
        };
        for (let y = 0; y < N; y++) {
          for (let x = 0; x < N; x++) {
            const p = pic(x, y);
            const n = (Math.sin((x * 12.9898 + y * 78.233) * 43.1) * 43758.5453) % 1;
            const nv = Math.abs(n) * 255;
            const r = p[0] * k + nv * (1 - k);
            const gg = p[1] * k + ((nv * 1.7) % 255) * (1 - k);
            const b = p[2] * k + ((nv * 2.3) % 255) * (1 - k);
            g.fillStyle = `rgb(${r | 0},${gg | 0},${b | 0})`;
            g.fillRect(x0 + x * s, y0 + y * s, s, s);
          }
        }
        box(g, W / 2 - 160, 16, 320, 40, { fill: '#fff', r: 12 });
        text(g, '✍️ ' + T({ en: '"a red house under the sun"', ro: '„o casă roșie sub soare”' }), W / 2, 36, { size: 17, max: 300 });
        text(g, T({ en: 'step ', ro: 'pasul ' }) + Math.round(k * 50) + ' / 50', W / 2, H - 50, { size: 20, color: C.grape });
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'Word meanings as numbers', ro: 'Sensul cuvintelor ca numere' },
      text: {
        en: 'Inside the model, each token becomes a long list of numbers called an **embedding**. Tokens with similar meanings get similar numbers, so they sit close together in a huge space (remember the word clusters at Station 10?).\n\nThese spaces capture relationships. A famous example: take the embedding of "king", subtract "man", add "woman", and you land very close to "queen"!\n\n`king − man + woman ≈ queen`',
        ro: 'În interiorul modelului, fiecare token devine o listă lungă de numere numită **reprezentare vectorială** (în engleză *embedding*). Tokenii cu sensuri asemănătoare primesc numere asemănătoare, așa că stau aproape unii de alții într-un spațiu uriaș (îți amintești grupurile de cuvinte de la Stația 10?).\n\nAceste spații surprind relații. Un exemplu faimos: iei reprezentarea lui „rege”, scazi „bărbat”, adaugi „femeie” și ajungi foarte aproape de „regină”!\n\n`rege − bărbat + femeie ≈ regină`',
      },
      visual: (g, t, W, H, T) => {
        const P = {
          man: [170, 330], woman: [250, 210], king: [390, 330], queen: [470, 210],
        };
        const labels = { man: { en: 'man', ro: 'bărbat' }, woman: { en: 'woman', ro: 'femeie' }, king: { en: 'king', ro: 'rege' }, queen: { en: 'queen', ro: 'regină' } };
        const k = ease((t % 6) / 2);
        arrow(g, P.man[0], P.man[1], P.man[0] + (P.woman[0] - P.man[0]) * k, P.man[1] + (P.woman[1] - P.man[1]) * k, { color: C.pink, width: 4 });
        arrow(g, P.king[0], P.king[1], P.king[0] + (P.queen[0] - P.king[0]) * k, P.king[1] + (P.queen[1] - P.king[1]) * k, { color: C.pink, width: 4, dash: [8, 6] });
        for (const w in P) {
          dot(g, P[w][0], P[w][1], 10, w === 'queen' && k < 0.9 ? '#fff' : C.grape);
          text(g, T(labels[w]), P[w][0], P[w][1] + 28, { size: 20 });
        }
        emoji(g, '👑', P.king[0], P.king[1] - 36, 32);
        text(g, T({ en: 'same direction = same relationship', ro: 'aceeași direcție = aceeași relație' }), W / 2, 60, { size: 19, color: C.pink });
      },
    },
    {
      id: 'p8',
      level: 3,
      title: { en: 'Attention and transformers', ro: 'Atenția și transformerele' },
      text: {
        en: 'Modern language models are **transformers**, invented in 2017 in a paper called *"Attention Is All You Need"*.\n\nTheir superpower is **attention**: every word can look at every other word to understand the context.\n\nIn *"The robot dropped the ball because **it** was heavy"*, what does "it" mean? Attention links "it" strongly to "ball", not "robot". Change "heavy" to "tired", and "it" now points to "robot"!',
        ro: 'Modelele de limbaj moderne sunt **transformere**, inventate în 2017 într-un articol numit *„Attention Is All You Need”* („Atenția e tot ce-ți trebuie”).\n\nSuperputerea lor este **atenția**: fiecare cuvânt se poate uita la toate celelalte cuvinte ca să înțeleagă contextul.\n\nÎn *„Robotul a scăpat mingea pentru că **ea** era grea”*, la ce se referă „ea”? Atenția leagă puternic „ea” de „minge”, nu de „robot”. În engleză, cuvântul „it” se poate referi la oricare, iar atenția alege după context!',
      },
      visual: (g, t, W, H, T) => {
        const heavy = Math.floor(t / 4) % 2 === 0;
        const words = T({ en: heavy ? 'The robot dropped the ball because it was heavy' : 'The robot dropped the ball because it was tired', ro: heavy ? 'Robotul a scăpat mingea pentru că ea era grea' : 'Robotul a scăpat mingea pentru că el era obosit' }).split(' ');
        const n = words.length;
        const y = 330;
        const xs = words.map((_, i) => 50 + (i * (W - 100)) / (n - 1));
        const itIdx = words.findIndex((w) => ['it', 'ea', 'el'].includes(w));
        const target = heavy ? words.findIndex((w) => ['ball', 'mingea'].includes(w)) : words.findIndex((w) => ['robot', 'Robotul'].includes(w));
        words.forEach((w, i) => {
          if (i === itIdx) return;
          const strength = i === target ? 1 : 0.12;
          g.strokeStyle = `rgba(123,92,255,${strength})`;
          g.lineWidth = 1 + strength * 7;
          g.beginPath();
          g.moveTo(xs[itIdx], y - 22);
          g.quadraticCurveTo((xs[itIdx] + xs[i]) / 2, y - 60 - Math.abs(i - itIdx) * 22, xs[i], y - 22);
          g.stroke();
        });
        words.forEach((w, i) => {
          g.save();
          g.translate(xs[i], y);
          g.rotate(n > 8 ? -0.5 : 0);
          text(g, w, 0, 0, { size: 18, color: i === itIdx ? C.accent : i === target ? C.grape : C.ink });
          g.restore();
        });
        text(g, '"' + words[itIdx] + '" → "' + words[target] + '"', W / 2, 60, { size: 26, color: C.grape });
      },
    },
    {
      id: 'p9',
      level: 3,
      title: { en: 'Temperature: safe or surprising', ro: 'Temperatura: sigur sau surprinzător' },
      text: {
        en: 'When picking the next word, the AI doesn\'t always choose the single most likely one. A setting called **temperature** controls how adventurous it is:\n\n- **low temperature**: almost always the top choice. Safe, predictable, can get repetitive.\n- **high temperature**: less likely words get picked more often. More creative, but it can turn silly or make no sense.\n\nTry it yourself in the Next Word experiment!',
        ro: 'Când alege cuvântul următor, IA nu ia mereu cel mai probabil cuvânt. O setare numită **temperatură** controlează cât de aventuroasă este:\n\n- **temperatură mică**: aproape mereu prima alegere. Sigur, previzibil, poate deveni repetitiv.\n- **temperatură mare**: cuvintele mai puțin probabile sunt alese mai des. Mai creativ, dar poate deveni caraghios sau fără sens.\n\nÎncearcă singur în experimentul Cuvântul următor!',
      },
      visual: (g, t, W, H, T) => {
        const temp = 0.3 + (Math.sin(t * 0.8) + 1) * 0.9;
        const base = [0.55, 0.3, 0.12, 0.03];
        const w = base.map((p) => Math.pow(p, 1 / temp));
        const s = w.reduce((a, b) => a + b, 0);
        const items = [[{ en: 'mat', ro: 'covor' }, w[0] / s], [{ en: 'sofa', ro: 'scaun' }, w[1] / s], [{ en: 'floor', ro: 'pat' }, w[2] / s], [{ en: 'moon', ro: 'nor' }, w[3] / s]];
        bars(g, 90, 120, 330, items, T);
        emoji(g, temp < 0.8 ? '🧊' : temp < 1.4 ? '🌤️' : '🔥', W / 2 - 60, 60, 44);
        text(g, T({ en: 'temperature ', ro: 'temperatura ' }) + temp.toFixed(1), W / 2 + 60, 60, { size: 24 });
      },
    },
  ],
  experiments: [
    { id: 'nextWord', req: 1 },
    { id: 'tokenizer', min: 2, req: 2 },
  ],
  quiz: [
    { level: 1, q: { en: 'What is the main trick of a language model?', ro: 'Care e trucul principal al unui model de limbaj?' }, a: [{ en: 'Predicting the next word', ro: 'Să ghicească cuvântul următor' }, { en: 'Drawing circles', ro: 'Să deseneze cercuri' }, { en: 'Counting pixels', ro: 'Să numere pixeli' }, { en: 'Measuring the temperature outside', ro: 'Să măsoare temperatura de afară' }], c: 0, why: { en: 'It predicts one word (token) at a time, again and again.', ro: 'Ghicește câte un cuvânt (token), iar și iar.' } },
    { level: 1, q: { en: 'Where do language models learn from?', ro: 'Din ce învață modelele de limbaj?' }, a: [{ en: 'Huge amounts of text', ro: 'Din cantități uriașe de text' }, { en: 'One single sentence', ro: 'Dintr-o singură propoziție' }, { en: 'Only music', ro: 'Doar din muzică' }, { en: 'Nowhere', ro: 'De nicăieri' }], c: 0, why: { en: 'They read books, websites and articles: far more than a person could read.', ro: 'Citesc cărți, site-uri și articole: mult mai mult decât ar putea citi un om.' } },
    { level: 1, tf: true, q: { en: 'True or false: chatbots are always 100% correct.', ro: 'Adevărat sau fals: chatboții au mereu 100% dreptate.' }, c: false, why: { en: 'False! They predict likely words, and sometimes likely is wrong. Double-check important facts.', ro: 'Fals! Ei prezic cuvinte probabile, iar uneori ce e probabil e greșit. Verifică faptele importante.' } },
    { level: 1, e: '🔒', q: { en: 'What should you NEVER share with a chatbot?', ro: 'Ce nu trebuie să împărtășești NICIODATĂ cu un chatbot?' }, a: [{ en: 'Your home address or passwords', ro: 'Adresa de acasă sau parolele' }, { en: 'A question about dinosaurs', ro: 'O întrebare despre dinozauri' }, { en: 'A math problem', ro: 'O problemă de matematică' }, { en: 'An idea for a poem', ro: 'O idee pentru o poezie' }], c: 0, why: { en: 'Personal information must stay private. Ask a trusted adult if you are unsure.', ro: 'Informațiile personale trebuie să rămână private. Întreabă un adult de încredere dacă nu ești sigur.' } },
    { level: 1, q: { en: '"Once upon a ___". Which word will a language model most likely predict?', ro: '„A fost odată ca ___”. Ce cuvânt va prezice cel mai probabil un model de limbaj?' }, a: [{ en: 'time', ro: 'niciodată' }, { en: 'banana', ro: 'banană' }, { en: 'seven', ro: 'șapte' }, { en: 'blue', ro: 'albastru' }], c: 0, why: { en: 'In the text it read, this phrase almost always continues the same way.', ro: 'În textele pe care le-a citit, expresia continuă aproape mereu la fel.' } },
    { level: 2, q: { en: 'What is a token?', ro: 'Ce este un token?' }, a: [{ en: 'A piece of text (a word or part of a word) that gets a number', ro: 'O bucată de text (un cuvânt sau o parte de cuvânt) care primește un număr' }, { en: 'A coin for arcade games', ro: 'O fisă pentru jocuri' }, { en: 'A password', ro: 'O parolă' }, { en: 'A picture', ro: 'O poză' }], c: 0, why: { en: 'Text is chopped into tokens, and each token becomes a number.', ro: 'Textul e tăiat în tokeni, iar fiecare token devine un număr.' } },
    { level: 2, q: { en: 'What is an AI "hallucination"?', ro: 'Ce este o „halucinație” a IA?' }, a: [{ en: 'When an AI confidently says something false', ro: 'Când o IA spune foarte sigură pe ea ceva fals' }, { en: 'A dream the computer has at night', ro: 'Un vis pe care îl are calculatorul noaptea' }, { en: 'A special effect in movies', ro: 'Un efect special din filme' }, { en: 'A computer virus', ro: 'Un virus de calculator' }], c: 0, why: { en: 'The words sound likely, but the facts are wrong.', ro: 'Cuvintele sună probabil, dar faptele sunt greșite.' } },
    { level: 2, q: { en: 'How do diffusion image generators make pictures?', ro: 'Cum fac poze generatoarele de imagini prin difuzie?' }, a: [{ en: 'They start from noise and remove it step by step', ro: 'Pornesc de la zgomot și îl îndepărtează pas cu pas' }, { en: 'They take photos with a camera', ro: 'Fac poze cu o cameră' }, { en: 'They copy one picture exactly', ro: 'Copiază exact o poză' }, { en: 'They draw with a pencil', ro: 'Desenează cu creionul' }], c: 0, why: { en: 'They learned to remove noise, guided by your text prompt.', ro: 'Au învățat să îndepărteze zgomotul, ghidate de textul tău.' } },
    { level: 3, q: { en: 'What is an embedding?', ro: 'Ce este o reprezentare vectorială (embedding)?' }, a: [{ en: 'A list of numbers that represents the meaning of a token', ro: 'O listă de numere care reprezintă sensul unui token' }, { en: 'A bed for robots', ro: 'Un pat pentru roboți' }, { en: 'A picture frame', ro: 'O ramă de tablou' }, { en: 'An error message', ro: 'Un mesaj de eroare' }], c: 0, why: { en: 'Similar meanings get similar numbers, so they sit close together.', ro: 'Sensurile asemănătoare primesc numere asemănătoare, așa că stau aproape.' } },
    { level: 3, q: { en: 'What does attention help a transformer do?', ro: 'La ce ajută atenția un transformer?' }, a: [{ en: 'Look at other words to understand the context', ro: 'Să se uite la celelalte cuvinte ca să înțeleagă contextul' }, { en: 'Stay awake', ro: 'Să stea treaz' }, { en: 'Delete words', ro: 'Să șteargă cuvinte' }, { en: 'Draw faces', ro: 'Să deseneze fețe' }], c: 0, why: { en: 'Attention links words like "it" to what they refer to.', ro: 'Atenția leagă cuvinte precum „ea” de lucrul la care se referă.' } },
    { level: 3, q: { en: 'What does a higher temperature do when generating text?', ro: 'Ce face o temperatură mai mare la generarea textului?' }, a: [{ en: 'Makes word choices more random and surprising', ro: 'Face alegerea cuvintelor mai întâmplătoare și surprinzătoare' }, { en: 'Makes the computer warmer', ro: 'Încălzește calculatorul' }, { en: 'Always picks the most likely word', ro: 'Alege mereu cel mai probabil cuvânt' }, { en: 'Stops the text', ro: 'Oprește textul' }], c: 0, why: { en: 'High temperature flattens the probabilities, so unlikely words appear more often.', ro: 'Temperatura mare aplatizează probabilitățile, așa că apar mai des cuvinte puțin probabile.' } },
    { level: 3, q: { en: 'In which year was the transformer paper "Attention Is All You Need" published?', ro: 'În ce an a fost publicat articolul despre transformere „Attention Is All You Need”?' }, a: [{ en: '2017', ro: '2017' }, { en: '1917', ro: '1917' }, { en: '1995', ro: '1995' }, { en: '2025', ro: '2025' }], c: 0, why: { en: 'Researchers at Google published it in 2017. It changed AI forever.', ro: 'Cercetători de la Google l-au publicat în 2017. A schimbat IA pentru totdeauna.' } },
  ],
};

void line;
