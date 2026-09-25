import { C, emoji, text, box, ease, plotFrame, arrow, seeded, gauss, line } from '../ui/draw.js';

const R = seeded(33);
const APPLES = Array.from({ length: 14 }, () => [165 + gauss(R) * 18, 8 + gauss(R) * 0.7]);
const BANANAS = Array.from({ length: 14 }, () => [120 + gauss(R) * 12, 19 + gauss(R) * 1.6]);
const DAYS_A = Array.from({ length: 12 }, () => [1 + R() * 6, R()]);
const DAYS_B = Array.from({ length: 12 }, () => [1 + R() * 6, R()]);
const P3 = Array.from({ length: 30 }, (_, i) => {
  const a = i % 2 === 0;
  return { a, p: a ? [0.7 + gauss(R) * 0.08, 0.25 + gauss(R) * 0.07, 0.8 + gauss(R) * 0.08] : [0.3 + gauss(R) * 0.07, 0.8 + gauss(R) * 0.08, 0.15 + gauss(R) * 0.06] };
});

// Station 3: Features & Patterns
export default {
  id: 's3',
  intro: [
    { who: 'ada', text: { en: 'Station 3! Here you will learn how an AI turns real things into numbers it can compare.', ro: 'Stația 3! Aici vei învăța cum transformă o IA lucrurile adevărate în numere pe care le poate compara.' } },
    { who: 'bip', text: { en: 'Turning fruit into numbers? Sounds delicious. And confusing.', ro: 'Transformăm fructele în numere? Sună delicios. Și încurcat.' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'What is a feature?', ro: 'Ce este o trăsătură?' },
      text: {
        en: 'A **feature** is something we can measure or notice about a thing. For a fruit, features could be:\n\n- its **weight** (in grams)\n- its **length** (in centimeters)\n- its **color** (how red or yellow it is)\n- its **shape** (round or long)\n\nAn AI can\'t look at an apple the way you do. It looks at **features**, written as numbers.',
        ro: 'O **trăsătură** este ceva ce putem măsura sau observa la un lucru. La un fruct, trăsăturile pot fi:\n\n- **greutatea** (în grame)\n- **lungimea** (în centimetri)\n- **culoarea** (cât de roșu sau de galben este)\n- **forma** (rotund sau lung)\n\nO IA nu se uită la un măr cum te uiți tu. Se uită la **trăsături**, scrise ca numere.',
      },
      visual: (g, t, W, H, T) => {
        const banana = Math.floor(t / 5) % 2 === 1;
        const cx = W / 2;
        const cy = H / 2 + 10;
        emoji(g, banana ? '🍌' : '🍎', cx, cy, 150);
        const labels = banana
          ? [{ en: '120 g', ro: '120 g' }, { en: '19 cm long', ro: '19 cm lungime' }, { en: 'Yellow', ro: 'Galben' }, { en: 'Long shape', ro: 'Formă lungă' }]
          : [{ en: '150 g', ro: '150 g' }, { en: '8 cm long', ro: '8 cm lungime' }, { en: 'Red', ro: 'Roșu' }, { en: 'Round shape', ro: 'Formă rotundă' }];
        const pos = [[120, 90], [W - 120, 90], [120, H - 80], [W - 120, H - 80]];
        const icons = ['⚖️', '📏', '🎨', '⚪'];
        labels.forEach((lab, i) => {
          const k = ease(((t % 5) - i * 0.4) * 2);
          if (k <= 0) return;
          g.globalAlpha = k;
          const [x, y] = pos[i];
          arrow(g, x + (x < cx ? 60 : -60), y + (y < cy ? 20 : -20), cx + (x < cx ? -60 : 60), cy + (y < cy ? -40 : 40), { color: C.muted, width: 3, head: 10 });
          box(g, x - 95, y - 26, 190, 52, { fill: '#fff', r: 14 });
          text(g, icons[i] + ' ' + T(lab), x, y, { size: 20, max: 175 });
          g.globalAlpha = 1;
        });
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Turning things into dots', ro: 'Transformăm lucrurile în puncte' },
      text: {
        en: "Let's put fruits on a chart. Going **across**: weight. Going **up**: length.\n\nEvery fruit becomes a **dot**. Look! The apples land close together, and the bananas land close together somewhere else.\n\nThat's the trick: once things are dots, an AI can use math to compare them.",
        ro: 'Hai să punem fructele pe un grafic. **Pe orizontală**: greutatea. **Pe verticală**: lungimea.\n\nFiecare fruct devine un **punct**. Uite! Merele ajung aproape unele de altele, iar bananele ajung aproape unele de altele, în alt loc.\n\nAcesta e trucul: odată ce lucrurile sunt puncte, o IA poate folosi matematica să le compare.',
      },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 80, y: 30, w: W - 120, h: H - 110, xmin: 80, xmax: 220, ymin: 4, ymax: 24, xlabel: T({ en: 'Weight (g)', ro: 'Greutate (g)' }), ylabel: T({ en: 'Length (cm)', ro: 'Lungime (cm)' }) });
        [100, 150, 200].forEach((v) => text(g, String(v), f.X(v), H - 66, { size: 14, color: C.ink2 }));
        [5, 10, 15, 20].forEach((v) => text(g, String(v), 62, f.Y(v), { size: 14, color: C.ink2 }));
        const all = [...APPLES.map((p) => ['🍎', p]), ...BANANAS.map((p) => ['🍌', p])];
        all.forEach(([e, p], i) => {
          const k = ease((t - (i % 14) * 0.12 - (i >= 14 ? 1.2 : 0)) * 1.5);
          const x = 40 + (f.X(p[0]) - 40) * k;
          const y = H / 2 + (f.Y(p[1]) - H / 2) * k;
          emoji(g, e, x, y, 24);
        });
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'Patterns', ro: 'Tipare' },
      text: {
        en: 'A **pattern** is something that repeats. Bananas are **usually** long. Apples are **usually** round and a bit heavier.\n\nPatterns are never perfect: there might be a tiny banana or a giant apple. But most of the time, the pattern holds.\n\nFinding patterns in data is what AI does best. It can find patterns in millions of examples, much faster than any person.',
        ro: 'Un **tipar** este ceva ce se repetă. Bananele sunt **de obicei** lungi. Merele sunt **de obicei** rotunde și puțin mai grele.\n\nTiparele nu sunt niciodată perfecte: poate exista o banană mică sau un măr uriaș. Dar de cele mai multe ori, tiparul se păstrează.\n\nGăsirea tiparelor în date este lucrul la care IA se pricepe cel mai bine. Poate găsi tipare în milioane de exemple, mult mai repede decât orice om.',
      },
      bip: { en: 'Pattern spotted: every time I jump, I come back down. Thanks, gravity!', ro: 'Tipar descoperit: de fiecare dată când sar, cad înapoi. Mulțumesc, gravitație!' },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 80, y: 30, w: W - 120, h: H - 110, xmin: 80, xmax: 220, ymin: 4, ymax: 24, xlabel: T({ en: 'Weight (g)', ro: 'Greutate (g)' }), ylabel: T({ en: 'Length (cm)', ro: 'Lungime (cm)' }) });
        const pulse = 1 + Math.sin(t * 2) * 0.04;
        g.fillStyle = 'rgba(242,70,75,0.12)';
        g.strokeStyle = C.red;
        g.lineWidth = 3;
        g.beginPath();
        g.ellipse(f.X(165), f.Y(8), 95 * pulse, 45 * pulse, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.fillStyle = 'rgba(255,194,26,0.18)';
        g.strokeStyle = C.yellow;
        g.beginPath();
        g.ellipse(f.X(120), f.Y(19), 70 * pulse, 70 * pulse, 0, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        APPLES.forEach((p) => emoji(g, '🍎', f.X(p[0]), f.Y(p[1]), 22));
        BANANAS.forEach((p) => emoji(g, '🍌', f.X(p[0]), f.Y(p[1]), 22));
        emoji(g, '🍌', f.X(92), f.Y(11), 22);
        text(g, '?', f.X(92) + 22, f.Y(11) - 18, { size: 26, color: C.grape });
        text(g, T({ en: 'a tiny banana!', ro: 'o banană mică!' }), f.X(92) + 10, f.Y(11) + 26, { size: 15, color: C.grape, align: 'left' });
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'Good features, useless features', ro: 'Trăsături bune, trăsături inutile' },
      text: {
        en: 'Some features help a lot. **Length** separates bananas from apples almost perfectly.\n\nOther features are useless. The **day of the week** a fruit was picked tells you nothing about what kind of fruit it is. On a chart, the dots just get mixed up.\n\nChoosing good features is one of the most important jobs in machine learning. You will try it yourself in the experiment!',
        ro: 'Unele trăsături ajută mult. **Lungimea** desparte aproape perfect bananele de mere.\n\nAlte trăsături sunt inutile. **Ziua săptămânii** în care a fost cules un fruct nu-ți spune nimic despre ce fel de fruct este. Pe grafic, punctele se amestecă.\n\nAlegerea trăsăturilor bune este una dintre cele mai importante treburi din învățarea automată. O să încerci chiar tu în experiment!',
      },
      visual: (g, t, W, H, T) => {
        const w = W / 2 - 40;
        const a = plotFrame(g, { x: 30, y: 60, w, h: H - 140, xmin: 80, xmax: 220, ymin: 4, ymax: 24, ticks: 4 });
        APPLES.forEach((p) => emoji(g, '🍎', a.X(p[0]), a.Y(p[1]), 18));
        BANANAS.forEach((p) => emoji(g, '🍌', a.X(p[0]), a.Y(p[1]), 18));
        const b = plotFrame(g, { x: W / 2 + 20, y: 60, w, h: H - 140, xmin: 1, xmax: 7, ymin: 0, ymax: 1, ticks: 4 });
        DAYS_A.forEach((p) => emoji(g, '🍎', b.X(p[0]), b.Y(p[1]), 18));
        DAYS_B.forEach((p) => emoji(g, '🍌', b.X(p[0]), b.Y(p[1]), 18));
        text(g, '✅ ' + T({ en: 'Weight & length', ro: 'Greutate și lungime' }), 30 + w / 2, 32, { size: 19, color: C.mint });
        text(g, '❌ ' + T({ en: 'Day picked', ro: 'Ziua culesului' }), W / 2 + 20 + w / 2, 32, { size: 19, color: C.rose });
        text(g, T({ en: 'separated', ro: 'despărțite' }), 30 + w / 2, H - 50, { size: 17, color: C.ink2 });
        text(g, T({ en: 'all mixed up', ro: 'amestecate' }), W / 2 + 20 + w / 2, H - 50, { size: 17, color: C.ink2 });
        void t;
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'More features, more dimensions', ro: 'Mai multe trăsături, mai multe dimensiuni' },
      text: {
        en: 'With 2 features we get a flat chart. With **3 features** we get a 3D space, like the big sculpture on this island!\n\nReal AIs can use **hundreds or thousands** of features at once. We can\'t imagine a 1000-dimensional space, but math handles it easily: distances and patterns work the same way.',
        ro: 'Cu 2 trăsături obținem un grafic plat. Cu **3 trăsături** obținem un spațiu 3D, ca sculptura mare de pe această insulă!\n\nIA adevărate pot folosi **sute sau mii** de trăsături deodată. Noi nu ne putem imagina un spațiu cu 1000 de dimensiuni, dar matematica se descurcă ușor: distanțele și tiparele funcționează la fel.',
      },
      visual: (g, t, W, H, T) => {
        const a = t * 0.5;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const proj = ([x, y, z]) => {
          const X = (x - 0.5) * ca - (z - 0.5) * sa;
          const Z = (x - 0.5) * sa + (z - 0.5) * ca;
          const s = 300 / (2.4 + Z);
          return [W / 2 + X * s, H / 2 + 60 - (y - 0.3) * s, Z];
        };
        const o = proj([0, 0, 0]);
        const axes = [[[1, 0, 0], C.red, '⚖️'], [[0, 1, 0], C.green, '📏'], [[0, 0, 1], C.blue, '🎨']];
        for (const [end, col, e] of axes) {
          const p = proj(end);
          line(g, o[0], o[1], p[0], p[1], col, 4);
          emoji(g, e, p[0], p[1], 26);
        }
        const pts = P3.map((q) => ({ q, pr: proj(q.p) })).sort((u, v) => v.pr[2] - u.pr[2]);
        for (const { q, pr } of pts) emoji(g, q.a ? '🍎' : '🍌', pr[0], pr[1], 20 + (1 - pr[2]) * 6);
        text(g, T({ en: '3 features = 3D space', ro: '3 trăsături = spațiu 3D' }), W / 2, 30, { size: 22 });
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'Feature vectors', ro: 'Vectori de trăsături' },
      text: {
        en: 'We can write all the features of one example as a list of numbers, called a **vector**:\n\n- apple 🍎 = [150, 8, 0.9]\n- banana 🍌 = [120, 19, 0.1]\n\n(weight in grams, length in cm, redness from 0 to 1)\n\nEvery example becomes a vector, and every vector is a point in space. AI does its math on these vectors: adding, multiplying and measuring distances.',
        ro: 'Putem scrie toate trăsăturile unui exemplu ca o listă de numere, numită **vector**:\n\n- măr 🍎 = [150, 8, 0,9]\n- banană 🍌 = [120, 19, 0,1]\n\n(greutatea în grame, lungimea în cm, cât de roșu e, de la 0 la 1)\n\nFiecare exemplu devine un vector și fiecare vector este un punct în spațiu. IA își face calculele cu acești vectori: adună, înmulțește și măsoară distanțe.',
      },
      visual: (g, t, W, H, T) => {
        const rows = [['🍎', '150', '8', '0.9'], ['🍌', '120', '19', '0.1'], ['🍊', '140', '7', '0.5'], ['🍏', '160', '8', '0.2']];
        const heads = [{ en: 'weight', ro: 'greutate' }, { en: 'length', ro: 'lungime' }, { en: 'red', ro: 'roșu' }];
        heads.forEach((hd, i) => text(g, T(hd), 250 + i * 110, 50, { size: 17, color: C.ink2 }));
        rows.forEach((r, i) => {
          const k = ease((t - i * 0.6) * 2);
          if (k <= 0) return;
          g.globalAlpha = k;
          const y = 110 + i * 90;
          emoji(g, r[0], 90, y, 50);
          text(g, '=', 150, y, { size: 30 });
          text(g, '[', 190, y, { size: 50, weight: 400 });
          r.slice(1).forEach((v, j) => text(g, v + (j < 2 ? ',' : ''), 250 + j * 110, y, { size: 30, color: [C.red, C.green, C.blue][j] }));
          text(g, ']', 520, y, { size: 50, weight: 400 });
          g.globalAlpha = 1;
        });
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'Deep learning finds its own features', ro: 'Învățarea adâncă își găsește singură trăsăturile' },
      text: {
        en: 'In classic machine learning, **people** choose the features: length, weight, and so on.\n\n**Deep neural networks** can learn useful features by themselves, straight from raw data like pixels. The first layers learn simple features such as edges, and later layers combine them into shapes and whole objects.\n\nThis is one reason deep learning became so powerful. You will meet neural networks at Stations 6 and 7.',
        ro: 'În învățarea automată clasică, **oamenii** aleg trăsăturile: lungimea, greutatea și așa mai departe.\n\n**Rețelele neuronale adânci** pot învăța singure trăsături utile, direct din date brute, cum ar fi pixelii. Primele straturi învață trăsături simple, de exemplu margini, iar straturile de mai târziu le combină în forme și obiecte întregi.\n\nAcesta este unul dintre motivele pentru care învățarea adâncă a devenit atât de puternică. Vei întâlni rețelele neuronale la Stațiile 6 și 7.',
      },
      visual: {
        type: 'flow',
        steps: [
          { e: '🟦', t: { en: 'Pixels', ro: 'Pixeli' } },
          { e: '📐', t: { en: 'Edges', ro: 'Margini' } },
          { e: '🔺', t: { en: 'Shapes', ro: 'Forme' } },
          { e: '🐱', t: { en: '"Cat!"', ro: '„Pisică!”' } },
        ],
      },
    },
  ],
  experiments: [{ id: 'featurePlot', req: 1 }],
  quiz: [
    { level: 1, q: { en: 'What is a feature?', ro: 'Ce este o trăsătură?' }, a: [{ en: 'Something we can measure or notice about a thing, like size or color', ro: 'Ceva ce putem măsura sau observa la un lucru, ca mărimea sau culoarea' }, { en: 'A movie', ro: 'Un film' }, { en: 'A level in a video game', ro: 'Un nivel dintr-un joc video' }, { en: 'A type of robot', ro: 'Un tip de robot' }], c: 0, why: { en: 'Features are measurable properties, like weight, length or color.', ro: 'Trăsăturile sunt proprietăți care se pot măsura, ca greutatea, lungimea sau culoarea.' } },
    { level: 1, e: '🍎🍌', q: { en: 'Which feature is most useful for telling apples from bananas?', ro: 'Ce trăsătură e cea mai utilă ca să deosebești merele de banane?' }, a: [{ en: 'Length: how long the fruit is', ro: 'Lungimea: cât de lung e fructul' }, { en: 'The day it was picked', ro: 'Ziua în care a fost cules' }, { en: "The name of the farmer's cat", ro: 'Numele pisicii fermierului' }, { en: 'The color of the truck', ro: 'Culoarea camionului' }], c: 0, why: { en: 'Bananas are long and apples are short, so length separates them well.', ro: 'Bananele sunt lungi, iar merele scurte, deci lungimea le desparte bine.' } },
    { level: 1, q: { en: 'On a feature chart, each fruit becomes...', ro: 'Pe un grafic de trăsături, fiecare fruct devine...' }, a: [{ en: 'A dot', ro: 'Un punct' }, { en: 'A song', ro: 'Un cântec' }, { en: 'A line of code', ro: 'Un rând de cod' }, { en: 'A new fruit', ro: 'Un fruct nou' }], c: 0, why: { en: 'Its features give it a position, so each fruit becomes a dot on the chart.', ro: 'Trăsăturile îi dau o poziție, așa că fiecare fruct devine un punct pe grafic.' } },
    { level: 1, tf: true, q: { en: 'True or false: AI is very good at finding patterns in data.', ro: 'Adevărat sau fals: IA se pricepe foarte bine să găsească tipare în date.' }, c: true, why: { en: 'True. Finding patterns in huge amounts of data is what AI does best.', ro: 'Adevărat. Găsirea tiparelor în cantități uriașe de date este ce face IA cel mai bine.' } },
    { level: 1, q: { en: 'What is a pattern?', ro: 'Ce este un tipar?' }, a: [{ en: 'Something that repeats or shows up again and again', ro: 'Ceva ce se repetă sau apare iar și iar' }, { en: 'A random mistake', ro: 'O greșeală întâmplătoare' }, { en: 'A type of paint', ro: 'Un tip de vopsea' }, { en: "A robot's battery", ro: 'Bateria unui robot' }], c: 0, why: { en: 'A pattern is a regular thing that repeats, like "bananas are usually long".', ro: 'Un tipar este ceva regulat care se repetă, de exemplu „bananele sunt de obicei lungi”.' } },
    { level: 2, q: { en: 'Why is "day of the week it was picked" a bad feature for fruit type?', ro: 'De ce este „ziua săptămânii în care a fost cules” o trăsătură proastă pentru tipul de fruct?' }, a: [{ en: 'It has nothing to do with what kind of fruit it is', ro: 'Nu are nicio legătură cu felul fructului' }, { en: 'It is too long to write', ro: 'E prea lung de scris' }, { en: 'Days do not exist', ro: 'Zilele nu există' }, { en: 'It is too colorful', ro: 'E prea colorată' }], c: 0, why: { en: 'Apples and bananas are picked on every day, so that feature mixes them up.', ro: 'Merele și bananele se culeg în orice zi, deci trăsătura asta le amestecă.' } },
    { level: 2, q: { en: 'If we use 3 features, our dots live in...', ro: 'Dacă folosim 3 trăsături, punctele noastre trăiesc într-un...' }, a: [{ en: '3D space', ro: 'Spațiu 3D' }, { en: 'A single line', ro: 'Singură linie' }, { en: 'A single point', ro: 'Singur punct' }, { en: 'The ocean', ro: 'Ocean' }], c: 0, why: { en: 'Each feature is one direction, so 3 features make a 3D space.', ro: 'Fiecare trăsătură e o direcție, deci 3 trăsături formează un spațiu 3D.' } },
    { level: 2, tf: true, q: { en: 'True or false: choosing good features can make an AI much better.', ro: 'Adevărat sau fals: alegerea unor trăsături bune poate face o IA mult mai bună.' }, c: true, why: { en: 'True. Good features make patterns easy to see; useless ones hide them.', ro: 'Adevărat. Trăsăturile bune fac tiparele ușor de văzut; cele inutile le ascund.' } },
    { level: 3, q: { en: 'What is a feature vector?', ro: 'Ce este un vector de trăsături?' }, a: [{ en: 'A list of numbers describing one example', ro: 'O listă de numere care descrie un exemplu' }, { en: 'An arrow on a map', ro: 'O săgeată pe o hartă' }, { en: 'A computer virus', ro: 'Un virus de calculator' }, { en: 'A picture frame', ro: 'O ramă de tablou' }], c: 0, why: { en: 'A vector like [150, 8, 0.9] holds all the features of one example.', ro: 'Un vector ca [150, 8, 0,9] conține toate trăsăturile unui exemplu.' } },
    { level: 3, q: { en: 'What can deep neural networks do with features?', ro: 'Ce pot face rețelele neuronale adânci cu trăsăturile?' }, a: [{ en: 'Learn useful features by themselves from raw data', ro: 'Pot învăța singure trăsături utile din date brute' }, { en: 'Delete all features', ro: 'Șterg toate trăsăturile' }, { en: 'Use only one feature, ever', ro: 'Folosesc o singură trăsătură, mereu' }, { en: 'They need a person to draw every feature', ro: 'Au nevoie ca un om să deseneze fiecare trăsătură' }], c: 0, why: { en: 'Deep networks learn features like edges and shapes directly from pixels.', ro: 'Rețelele adânci învață trăsături ca marginile și formele direct din pixeli.' } },
    { level: 3, q: { en: 'apple = [150, 8, 0.9]. What might 150 be?', ro: 'măr = [150, 8, 0,9]. Ce ar putea fi 150?' }, a: [{ en: 'Its weight in grams', ro: 'Greutatea lui în grame' }, { en: 'The number of apples in the world', ro: 'Numărul de mere din lume' }, { en: 'Its age in years', ro: 'Vârsta lui în ani' }, { en: 'Its color', ro: 'Culoarea lui' }], c: 0, why: { en: 'In our example the first number was the weight: 150 grams.', ro: 'În exemplul nostru, primul număr era greutatea: 150 de grame.' } },
  ],
};

void box;
