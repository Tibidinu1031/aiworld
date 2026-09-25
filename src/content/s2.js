import { C, emoji, text, box, ease, plotFrame, dot, rr } from '../ui/draw.js';

const SMILEY = [
  '..####..',
  '.#....#.',
  '#.#..#.#',
  '#......#',
  '#.#..#.#',
  '#..##..#',
  '.#....#.',
  '..####..',
];

// Station 2: Data, the food of AI
export default {
  id: 's2',
  intro: [
    { who: 'ada', text: { en: 'Station 2 is all about data. Every AI in the world starts here.', ro: 'Stația 2 este despre date. Orice IA din lume începe de aici.' } },
    { who: 'bip', text: { en: "I'm hungry for knowledge. Literally!", ro: 'Mi-e foame de cunoaștere. La propriu!' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'What is data?', ro: 'Ce sunt datele?' },
      text: {
        en: '**Data** means pieces of information. It can be:\n\n- numbers, like temperatures or scores\n- words and sentences\n- pictures and videos\n- sounds and music\n- measurements from sensors\n\nFor an AI, data is like food: it **learns from it**. No data, no learning!',
        ro: '**Datele** sunt bucăți de informație. Pot fi:\n\n- numere, de exemplu temperaturi sau scoruri\n- cuvinte și propoziții\n- poze și filmulețe\n- sunete și muzică\n- măsurători de la senzori\n\nPentru o IA, datele sunt ca mâncarea: **învață din ele**. Fără date, nu există învățare!',
      },
      bip: { en: "So data is my breakfast? A big bowl of numbers, please!", ro: 'Deci datele sunt micul meu dejun? Un castron mare de numere, vă rog!' },
      visual: {
        type: 'emoji',
        cols: 3,
        items: [
          { e: '🔢', t: { en: 'Numbers', ro: 'Numere' } },
          { e: '🔤', t: { en: 'Words', ro: 'Cuvinte' } },
          { e: '🖼️', t: { en: 'Pictures', ro: 'Poze' } },
          { e: '🎵', t: { en: 'Sounds', ro: 'Sunete' } },
          { e: '🌡️', t: { en: 'Measurements', ro: 'Măsurători' } },
          { e: '🎬', t: { en: 'Videos', ro: 'Filmulețe' } },
        ],
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Computers see numbers', ro: 'Calculatoarele văd numere' },
      text: {
        en: 'A digital picture is made of tiny squares called **pixels**. Zoom in far enough and you can see them!\n\nEach pixel is stored as a **number**. In a black-and-white picture, **0 means black**, **255 means white**, and the numbers in between are shades of gray.\n\nSo to a computer, every picture is really a big grid of numbers.',
        ro: 'O poză digitală e făcută din pătrățele mici numite **pixeli**. Dacă mărești destul, îi poți vedea!\n\nFiecare pixel este păstrat ca un **număr**. Într-o poză alb-negru, **0 înseamnă negru**, **255 înseamnă alb**, iar numerele dintre ele sunt nuanțe de gri.\n\nDeci, pentru un calculator, fiecare poză este de fapt un tabel mare de numere.',
      },
      visual: (g, t, W, H, T) => {
        const n = 8;
        const s = 30;
        const ox = 40;
        const oy = 110;
        text(g, T({ en: 'What you see', ro: 'Ce vezi tu' }), ox + (n * s) / 2, 70, { size: 20 });
        text(g, T({ en: 'What the computer sees', ro: 'Ce vede calculatorul' }), W - 40 - (n * 34) / 2, 70, { size: 20 });
        for (let y = 0; y < n; y++) {
          for (let x = 0; x < n; x++) {
            const on = SMILEY[y][x] === '#';
            g.fillStyle = on ? '#1d2340' : '#ffffff';
            g.fillRect(ox + x * s, oy + y * s, s, s);
            g.strokeStyle = '#d6dcf0';
            g.lineWidth = 1;
            g.strokeRect(ox + x * s, oy + y * s, s, s);
          }
        }
        const shown = Math.floor(t * 14);
        const nx = W - 40 - n * 34;
        for (let i = 0; i < n * n; i++) {
          const x = i % n;
          const y = Math.floor(i / n);
          const on = SMILEY[y][x] === '#';
          g.strokeStyle = '#d6dcf0';
          g.strokeRect(nx + x * 34, oy + y * 30, 34, 30);
          if (i < shown % (n * n + 30)) text(g, on ? '0' : '255', nx + x * 34 + 17, oy + y * 30 + 15, { size: on ? 16 : 11, color: on ? C.rose : C.muted, weight: 700 });
        }
        const k = (shown % (n * n + 30)) - 1;
        if (k >= 0 && k < n * n) {
          const x = k % n;
          const y = Math.floor(k / n);
          g.strokeStyle = C.accent;
          g.lineWidth = 3;
          g.strokeRect(ox + x * s, oy + y * s, s, s);
          g.strokeRect(nx + x * 34, oy + y * 30, 34, 30);
        }
        text(g, T({ en: '0 = black · 255 = white', ro: '0 = negru · 255 = alb' }), W / 2, H - 50, { size: 20, color: C.ink2 });
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'Labels: the answers', ro: 'Etichetele: răspunsurile' },
      text: {
        en: 'To learn to recognize fruit, an AI needs examples **with the right answer attached**. Those answers are called **labels**.\n\nA photo of an apple + the label "apple". A photo of a banana + the label "banana".\n\nA big collection of labeled examples is called a **dataset**. People often spend a lot of time labeling data by hand!',
        ro: 'Ca să învețe să recunoască fructe, o IA are nevoie de exemple **cu răspunsul corect atașat**. Aceste răspunsuri se numesc **etichete**.\n\nPoza unui măr + eticheta „măr”. Poza unei banane + eticheta „banană”.\n\nO colecție mare de exemple etichetate se numește **set de date**. Oamenii petrec adesea mult timp etichetând date de mână!',
      },
      bip: { en: 'Labels are like the answer key at the back of a book!', ro: 'Etichetele sunt ca răspunsurile de la sfârșitul unei culegeri!' },
      visual: (g, t, W, H, T) => {
        const items = [
          ['🍎', { en: 'apple', ro: 'măr' }],
          ['🍌', { en: 'banana', ro: 'banană' }],
          ['🍏', { en: 'apple', ro: 'măr' }],
          ['🍊', { en: 'orange', ro: 'portocală' }],
          ['🍌', { en: 'banana', ro: 'banană' }],
          ['🍎', { en: 'apple', ro: 'măr' }],
        ];
        text(g, T({ en: 'Dataset', ro: 'Set de date' }), W / 2, 36, { size: 26 });
        items.forEach(([e, lab], i) => {
          const col = i % 3;
          const row = Math.floor(i / 3);
          const x = 70 + col * 180;
          const y = 80 + row * 190;
          const k = ease((t - i * 0.4) * 1.8);
          if (k <= 0) return;
          const drop = (1 - k) * -60;
          g.globalAlpha = k;
          box(g, x, y + drop, 150, 150, { fill: '#fff', r: 16 });
          emoji(g, e, x + 75, y + 60 + drop, 70);
          const tk = ease((t - i * 0.4 - 0.5) * 2);
          if (tk > 0) {
            box(g, x + 25, y + 108 + drop, 100, 30, { fill: C.sun, r: 10, shadow: false, lw: 2.5 });
            text(g, '🏷️ ' + T(lab), x + 75, y + 123 + drop, { size: 16, max: 94 });
          }
          g.globalAlpha = 1;
        });
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'More data, better learning', ro: 'Mai multe date, învățare mai bună' },
      text: {
        en: 'Imagine learning what a dog is from just **one** photo of a white poodle. You might think all dogs are white and fluffy!\n\nWith **thousands** of examples of all kinds of dogs, the AI learns what really matters. Usually, more good data means better learning. That is why big AIs are trained on enormous datasets.\n\n(The chart shows the general idea. Real numbers depend on the task.)',
        ro: 'Imaginează-ți că înveți ce e un câine dintr-o **singură** poză cu un pudel alb. Ai putea crede că toți câinii sunt albi și pufoși!\n\nCu **mii** de exemple cu tot felul de câini, IA învață ce contează cu adevărat. De obicei, mai multe date bune înseamnă învățare mai bună. De aceea IA mari sunt antrenate pe seturi de date uriașe.\n\n(Graficul arată ideea generală. Numerele reale depind de sarcină.)',
      },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 80, y: 40, w: W - 120, h: H - 120, xmin: 0, xmax: 4, ymin: 0, ymax: 100, xlabel: T({ en: 'Number of examples', ro: 'Numărul de exemple' }), ylabel: T({ en: 'Correct answers (%)', ro: 'Răspunsuri corecte (%)' }) });
        const acc = (x) => 100 - 60 * Math.exp(-x * 1.1);
        ['1', '10', '100', '1 000', '10 000'].forEach((lab, i) => text(g, lab, f.X(i), H - 68, { size: 14, color: C.ink2 }));
        [0, 50, 100].forEach((v) => text(g, String(v), 62, f.Y(v), { size: 14, color: C.ink2 }));
        g.strokeStyle = C.mint;
        g.lineWidth = 5;
        g.beginPath();
        for (let i = 0; i <= 80; i++) {
          const x = (i / 80) * 4;
          i ? g.lineTo(f.X(x), f.Y(acc(x))) : g.moveTo(f.X(x), f.Y(acc(x)));
        }
        g.stroke();
        const x = (t * 0.5) % 4.4;
        const xx = Math.min(4, x);
        dot(g, f.X(xx), f.Y(acc(xx)), 11, C.accent);
        emoji(g, xx < 1 ? '🤔' : xx < 2.5 ? '🙂' : '😎', f.X(xx), f.Y(acc(xx)) - 34, 34);
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'Garbage in, garbage out', ro: 'Gunoi intră, gunoi iese' },
      text: {
        en: 'If the data is bad, the AI will be bad. Computer scientists call this **"garbage in, garbage out"**.\n\nGood data is:\n\n- **correct**: the labels are right (a banana is not labeled "apple")\n- **varied**: many kinds, colors, angles and kinds of lighting\n- **fair**: every group is included (more about that at Station 13)\n\nFixing wrong labels can improve an AI more than almost anything else!',
        ro: 'Dacă datele sunt proaste, și IA va fi proastă. Informaticienii spun: **„gunoi intră, gunoi iese”**.\n\nDatele bune sunt:\n\n- **corecte**: etichetele sunt bune (o banană nu e etichetată „măr”)\n- **variate**: multe feluri, culori, unghiuri și tipuri de lumină\n- **echitabile**: fiecare grup este inclus (mai multe despre asta la Stația 13)\n\nCorectarea etichetelor greșite poate îmbunătăți o IA mai mult decât aproape orice altceva!',
      },
      visual: {
        type: 'vs',
        left: {
          e: '✅',
          bg: '#e4f8ef',
          title: { en: 'Good data', ro: 'Date bune' },
          items: [
            { en: 'Correct labels', ro: 'Etichete corecte' },
            { en: 'Many kinds of examples', ro: 'Multe feluri de exemple' },
            { en: 'Every group included', ro: 'Toate grupurile incluse' },
          ],
        },
        right: {
          e: '🗑️',
          bg: '#ffe9e6',
          title: { en: 'Bad data', ro: 'Date proaste' },
          items: [
            { en: 'Wrong labels', ro: 'Etichete greșite' },
            { en: 'Only one kind of example', ro: 'Un singur fel de exemple' },
            { en: 'Missing groups', ro: 'Grupuri care lipsesc' },
          ],
        },
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'Color is three numbers', ro: 'Culoarea înseamnă trei numere' },
      text: {
        en: 'Color pictures use **three numbers per pixel**: how much **Red**, **Green** and **Blue** light to mix (RGB). Each goes from 0 to 255.\n\n- (255, 0, 0) is red\n- (255, 255, 0) is yellow: red + green light!\n- (255, 255, 255) is white\n\nThat makes 256 × 256 × 256 ≈ **16.7 million** colors. A 1000 × 1000 photo holds 3 million numbers!',
        ro: 'Pozele color folosesc **trei numere pentru fiecare pixel**: câtă lumină **roșie**, **verde** și **albastră** se amestecă (RGB, din engleză Red, Green, Blue). Fiecare merge de la 0 la 255.\n\n- (255, 0, 0) este roșu\n- (255, 255, 0) este galben: lumină roșie + verde!\n- (255, 255, 255) este alb\n\nAsta înseamnă 256 × 256 × 256 ≈ **16,7 milioane** de culori. O poză de 1000 × 1000 conține 3 milioane de numere!',
      },
      visual: (g, t, W, H, T) => {
        g.fillStyle = '#10142b';
        g.fillRect(0, 0, W, H);
        g.globalCompositeOperation = 'lighter';
        const r = 120;
        const cx = W / 2;
        const cy = H / 2 - 10;
        const d = 62 + Math.sin(t * 1.2) * 18;
        const cols = ['rgba(255,0,0,1)', 'rgba(0,255,0,1)', 'rgba(0,0,255,1)'];
        cols.forEach((c, i) => {
          const a = -Math.PI / 2 + (i * Math.PI * 2) / 3;
          g.beginPath();
          g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, r, 0, Math.PI * 2);
          g.fillStyle = c;
          g.fill();
        });
        g.globalCompositeOperation = 'source-over';
        text(g, '(255, 0, 0)', cx + Math.cos(-Math.PI / 2) * (d + 70), cy - d - 60, { size: 17, color: '#fff' });
        text(g, T({ en: 'R + G = yellow · all three = white', ro: 'R + G = galben · toate trei = alb' }), W / 2, H - 30, { size: 19, color: '#fff' });
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'Training data and test data', ro: 'Date de antrenare și date de test' },
      text: {
        en: 'Scientists split a dataset into two parts:\n\n- the **training set** (often about 80%): the AI learns from these\n- the **test set** (about 20%): kept secret until the end\n\nTesting on examples the AI has **never seen** works like a surprise quiz. It shows whether the AI really learned or just memorized. You will explore this at Station 9.',
        ro: 'Oamenii de știință împart un set de date în două părți:\n\n- **setul de antrenare** (de obicei cam 80%): IA învață din acestea\n- **setul de test** (cam 20%): ținut secret până la final\n\nTestarea pe exemple pe care IA **nu le-a văzut niciodată** funcționează ca un test-surpriză. Arată dacă IA a învățat cu adevărat sau doar a memorat. Vei explora asta la Stația 9.',
      },
      visual: (g, t, W, H, T) => {
        const fr = ['🍎', '🍌', '🍊', '🍏'];
        const k = ease((t % 6) / 2 - 0.3);
        for (let i = 0; i < 20; i++) {
          const test = i >= 16;
          const sx = 60 + (i % 10) * 54;
          const sy = 110 + Math.floor(i / 10) * 70;
          const tx = test ? 430 + ((i - 16) % 2) * 70 : 50 + (i % 4) * 70;
          const ty = test ? 200 + Math.floor((i - 16) / 2) * 80 : 150 + Math.floor(i / 4) * 58;
          const x = sx + (tx - sx) * k;
          const y = sy + (ty - sy) * k;
          emoji(g, fr[(i * 7) % 4], x, y, 38);
        }
        if (k > 0.9) {
          rr(g, 20, 110, 320, 340, 18);
          g.strokeStyle = C.mint;
          g.lineWidth = 4;
          g.stroke();
          rr(g, 395, 150, 170, 200, 18);
          g.strokeStyle = C.accent;
          g.stroke();
          text(g, T({ en: 'Training set · 80%', ro: 'Set de antrenare · 80%' }), 180, 90, { size: 20, color: C.mint });
          text(g, T({ en: 'Test set · 20%', ro: 'Set de test · 20%' }), 480, 130, { size: 20, color: C.accent });
        } else text(g, T({ en: 'One dataset...', ro: 'Un singur set de date...' }), W / 2, 60, { size: 22 });
      },
    },
  ],
  experiments: [
    { id: 'pixelPainter', req: 1 },
    { id: 'labelFactory', req: 2 },
  ],
  quiz: [
    { level: 1, q: { en: 'What is a pixel?', ro: 'Ce este un pixel?' }, a: [{ en: 'A tiny square of color in a digital picture', ro: 'Un pătrățel de culoare dintr-o poză digitală' }, { en: 'A kind of fairy', ro: 'Un fel de zână' }, { en: 'A computer virus', ro: 'Un virus de calculator' }, { en: 'A type of battery', ro: 'Un tip de baterie' }], c: 0, why: { en: 'Digital pictures are grids of tiny squares called pixels. Each one is stored as numbers.', ro: 'Pozele digitale sunt grile de pătrățele mici numite pixeli. Fiecare e păstrat ca numere.' } },
    { level: 1, q: { en: 'To a computer, a picture is...', ro: 'Pentru un calculator, o poză este...' }, a: [{ en: 'A grid of numbers', ro: 'Un tabel de numere' }, { en: 'A painting made with brushes', ro: 'O pictură făcută cu pensula' }, { en: 'A song', ro: 'Un cântec' }, { en: 'Nothing at all', ro: 'Nimic' }], c: 0, why: { en: 'Every pixel is a number (or three numbers for color), so a picture is a grid of numbers.', ro: 'Fiecare pixel e un număr (sau trei numere pentru culoare), deci o poză e un tabel de numere.' } },
    { level: 1, q: { en: 'What is a label in a dataset?', ro: 'Ce este o etichetă într-un set de date?' }, a: [{ en: 'The correct answer attached to an example', ro: 'Răspunsul corect atașat unui exemplu' }, { en: 'A sticker on a lunchbox', ro: 'Un abțibild pe o cutie de mâncare' }, { en: 'A type of pixel', ro: 'Un tip de pixel' }, { en: "The robot's name", ro: 'Numele robotului' }], c: 0, why: { en: 'A label is the answer, like "apple" for a photo of an apple. The AI learns from example + label pairs.', ro: 'Eticheta e răspunsul, de exemplu „măr” pentru poza unui măr. IA învață din perechi exemplu + etichetă.' } },
    { level: 1, tf: true, q: { en: 'True or false: AI learns from data, a bit like we learn from experience.', ro: 'Adevărat sau fals: IA învață din date, cam cum învățăm noi din experiență.' }, c: true, why: { en: 'True! Data is the experience an AI learns from.', ro: 'Adevărat! Datele sunt experiența din care învață o IA.' } },
    { level: 1, e: '⬛', q: { en: 'In a black-and-white picture, what does the number 0 usually mean?', ro: 'Într-o poză alb-negru, ce înseamnă de obicei numărul 0?' }, a: [{ en: 'Black', ro: 'Negru' }, { en: 'White', ro: 'Alb' }, { en: 'Red', ro: 'Roșu' }, { en: 'Invisible', ro: 'Invizibil' }], c: 0, why: { en: '0 means no light, so black. 255 means full light, so white.', ro: '0 înseamnă lipsă de lumină, deci negru. 255 înseamnă lumină maximă, deci alb.' } },
    { level: 1, q: { en: 'Which of these is data?', ro: 'Care dintre acestea sunt date?' }, a: [{ en: 'All of them: temperatures, photos and songs', ro: 'Toate: temperaturi, poze și cântece' }, { en: 'Only numbers', ro: 'Doar numerele' }, { en: 'Only photos', ro: 'Doar pozele' }, { en: 'None of them', ro: 'Niciunele' }], c: 0, why: { en: 'Data can be numbers, words, pictures, sounds, videos and measurements.', ro: 'Datele pot fi numere, cuvinte, poze, sunete, filmulețe și măsurători.' } },
    { level: 2, q: { en: 'What happens if many labels in the training data are wrong?', ro: 'Ce se întâmplă dacă multe etichete din datele de antrenare sunt greșite?' }, a: [{ en: 'The AI learns wrong things', ro: 'IA învață lucruri greșite' }, { en: 'The AI becomes faster', ro: 'IA devine mai rapidă' }, { en: 'Nothing happens', ro: 'Nu se întâmplă nimic' }, { en: 'The AI always fixes them by itself', ro: 'IA le corectează mereu singură' }], c: 0, why: { en: 'Garbage in, garbage out: an AI copies the mistakes in its data.', ro: 'Gunoi intră, gunoi iese: o IA copiază greșelile din datele ei.' } },
    { level: 2, q: { en: 'Which dataset is best for teaching an AI to recognize dogs?', ro: 'Care set de date e cel mai bun ca să înveți o IA să recunoască câini?' }, a: [{ en: 'Thousands of correctly labeled photos of many kinds of dogs', ro: 'Mii de poze corect etichetate cu multe feluri de câini' }, { en: '3 photos of the same dog', ro: '3 poze cu același câine' }, { en: 'Photos of cats labeled "dog"', ro: 'Poze cu pisici etichetate „câine”' }, { en: 'Blank pictures', ro: 'Poze goale' }], c: 0, why: { en: 'More data that is correct and varied helps the AI learn what really makes a dog a dog.', ro: 'Mai multe date, corecte și variate, ajută IA să învețe ce face cu adevărat un câine să fie câine.' } },
    { level: 2, tf: true, q: { en: 'True or false: "garbage in, garbage out" means bad data leads to a bad AI.', ro: 'Adevărat sau fals: „gunoi intră, gunoi iese” înseamnă că datele proaste duc la o IA proastă.' }, c: true, why: { en: 'True. The quality of an AI depends on the quality of its data.', ro: 'Adevărat. Calitatea unei IA depinde de calitatea datelor ei.' } },
    { level: 3, q: { en: 'How many numbers describe one pixel in an RGB color picture?', ro: 'Câte numere descriu un pixel într-o poză color RGB?' }, a: [{ en: '3', ro: '3' }, { en: '1', ro: '1' }, { en: '10', ro: '10' }, { en: '255', ro: '255' }], c: 0, why: { en: 'Red, Green and Blue: three numbers, each from 0 to 255.', ro: 'Roșu, verde și albastru: trei numere, fiecare de la 0 la 255.' } },
    { level: 3, q: { en: 'Why do we keep a test set hidden from the AI during training?', ro: 'De ce ținem un set de test ascuns de IA în timpul antrenării?' }, a: [{ en: 'To check if it really learned, using examples it has never seen', ro: 'Ca să verificăm dacă a învățat cu adevărat, pe exemple pe care nu le-a văzut' }, { en: 'To save electricity', ro: 'Ca să economisim curent' }, { en: 'Because test data is boring', ro: 'Pentru că datele de test sunt plictisitoare' }, { en: 'So the AI can cheat', ro: 'Ca IA să poată trișa' }], c: 0, why: { en: 'New, unseen examples show whether the AI understood the pattern or just memorized.', ro: 'Exemplele noi, nevăzute, arată dacă IA a înțeles tiparul sau doar a memorat.' } },
    { level: 3, q: { en: 'In RGB, which color is (255, 255, 0)?', ro: 'În RGB, ce culoare este (255, 255, 0)?' }, a: [{ en: 'Yellow', ro: 'Galben' }, { en: 'Blue', ro: 'Albastru' }, { en: 'Black', ro: 'Negru' }, { en: 'Purple', ro: 'Mov' }], c: 0, why: { en: 'Full red light plus full green light, with no blue, makes yellow.', ro: 'Lumina roșie maximă plus lumina verde maximă, fără albastru, dau galben.' } },
  ],
};

void box;
