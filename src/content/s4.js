import { C, emoji, text, box, ease, dot, line, seeded, gauss, plotFrame, arrow } from '../ui/draw.js';

const R = seeded(404);
const PTS = [];
for (let i = 0; i < 14; i++) PTS.push({ x: 0.3 + gauss(R) * 0.12, y: 0.35 + gauss(R) * 0.12, c: 0 });
for (let i = 0; i < 14; i++) PTS.push({ x: 0.68 + gauss(R) * 0.12, y: 0.65 + gauss(R) * 0.12, c: 1 });
const OUT = { x: 0.62, y: 0.7, c: 0 };
const COLS = [C.red, C.blue];

function knn(pts, x, y, k) {
  const near = pts.map((p) => ({ p, d: Math.hypot(p.x - x, p.y - y) })).sort((a, b) => a.d - b.d).slice(0, k);
  const votes = [0, 0];
  near.forEach((n) => votes[n.p.c]++);
  return { near, votes, c: votes[1] > votes[0] ? 1 : 0 };
}

function drawMap(g, pts, k, x0, y0, w, h, cell = 12) {
  for (let yy = 0; yy < h; yy += cell) {
    for (let xx = 0; xx < w; xx += cell) {
      const r = knn(pts, (xx + cell / 2) / w, 1 - (yy + cell / 2) / h, k);
      g.fillStyle = r.c ? 'rgba(42,157,244,0.22)' : 'rgba(242,70,75,0.22)';
      g.fillRect(x0 + xx, y0 + yy, cell, cell);
    }
  }
}

// Station 4: Classification
export default {
  id: 's4',
  intro: [
    { who: 'ada', text: { en: 'Station 4: classification! How does an AI decide what something is? It asks the neighbors.', ro: 'Stația 4: clasificarea! Cum decide o IA ce este un lucru? Își întreabă vecinii.' } },
    { who: 'bip', text: { en: 'My neighbors are a fox statue and a very confused seagull.', ro: 'Vecinii mei sunt o statuie de vulpe și un pescăruș foarte încurcat.' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'Sorting into groups', ro: 'Sortăm în grupuri' },
      text: {
        en: '**Classification** means deciding which group, or **class**, something belongs to.\n\n- Is this photo a cat or a dog?\n- Is this email spam or not spam?\n- Is this fruit ripe or not ripe?\n\nMany AIs are **classifiers**: you give them an example, and they answer with a class.',
        ro: '**Clasificarea** înseamnă să decizi în ce grup, sau **clasă**, se încadrează ceva.\n\n- Poza asta arată o pisică sau un câine?\n- E-mailul ăsta e spam sau nu?\n- Fructul ăsta e copt sau necopt?\n\nMulte IA sunt **clasificatoare**: le dai un exemplu, iar ele îți răspund cu o clasă.',
      },
      visual: (g, t, W, H, T) => {
        const items = ['🐱', '🐶', '🐶', '🐱', '🐱', '🐶'];
        box(g, 60, H - 150, 220, 120, { fill: '#fff1e8', r: 18 });
        box(g, W - 280, H - 150, 220, 120, { fill: '#e8f4ff', r: 18 });
        text(g, '🐱 ' + T({ en: 'Cats', ro: 'Pisici' }), 170, H - 125, { size: 22 });
        text(g, '🐶 ' + T({ en: 'Dogs', ro: 'Câini' }), W - 170, H - 125, { size: 22 });
        const cyc = t % (items.length * 1.1);
        items.forEach((e, i) => {
          const k = Math.max(0, Math.min(1, (cyc - i * 1.1) / 1));
          const cat = e === '🐱';
          const tx = cat ? 100 + (i % 3) * 60 : W - 240 + (i % 3) * 60;
          const ty = H - 70;
          const x = W / 2 + (tx - W / 2) * ease(k);
          const y = 80 + (ty - 80) * ease(k) - Math.sin(k * Math.PI) * 60;
          if (cyc > i * 1.1) emoji(g, e, x, y, 44);
        });
        box(g, W / 2 - 60, 40, 120, 80, { fill: C.sun, r: 16 });
        text(g, '🤖 ?', W / 2, 80, { size: 30 });
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Ask the neighbors', ro: 'Întreabă vecinii' },
      text: {
        en: "Here is a simple but clever way to classify: **k-Nearest Neighbors**, or **kNN** for short.\n\nA new example arrives and we don't know its class. We put it on the feature chart and look at the examples **closest** to it: its nearest neighbors.\n\nIf the closest examples are red, it is probably red! Things that are similar usually belong to the same class.",
        ro: 'Iată un fel simplu, dar isteț, de a clasifica: **cei mai apropiați k vecini** (în engleză *k-Nearest Neighbors*, pe scurt **kNN**).\n\nSosește un exemplu nou și nu știm din ce clasă face parte. Îl punem pe graficul de trăsături și ne uităm la exemplele **cele mai apropiate** de el: cei mai apropiați vecini.\n\nDacă exemplele cele mai apropiate sunt roșii, probabil e roșu! Lucrurile asemănătoare aparțin de obicei aceleiași clase.',
      },
      bip: { en: "Like guessing a new song is pop because it sounds like other pop songs I know!", ro: 'Ca atunci când ghicesc că un cântec nou e pop pentru că sună ca alte cântece pop pe care le știu!' },
      visual: (g, t, W, H, T) => {
        const x0 = 30;
        const y0 = 20;
        const w = W - 60;
        const h = H - 40;
        const sx = 0.5 + Math.cos(t * 0.5) * 0.3;
        const sy = 0.5 + Math.sin(t * 0.7) * 0.25;
        const r = knn(PTS, sx, sy, 3);
        const X = (v) => x0 + v * w;
        const Y = (v) => y0 + (1 - v) * h;
        for (const n of r.near) line(g, X(sx), Y(sy), X(n.p.x), Y(n.p.y), COLS[n.p.c], 4);
        for (const p of PTS) dot(g, X(p.x), Y(p.y), 9, COLS[p.c]);
        dot(g, X(sx), Y(sy), 16, '#ffd23f');
        text(g, '?', X(sx), Y(sy) + 1, { size: 20 });
        box(g, W - 230, 20, 200, 46, { fill: '#fff', r: 12 });
        text(g, T({ en: 'AI says: ', ro: 'IA spune: ' }) + (r.c ? T({ en: 'BLUE', ro: 'ALBASTRU' }) : T({ en: 'RED', ro: 'ROȘU' })), W - 130, 43, { size: 19, color: COLS[r.c] });
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'Let them vote', ro: 'Lasă-i să voteze' },
      text: {
        en: '**k** is the number of neighbors we ask. With **k = 3**, the 3 closest examples vote.\n\nIf 2 are apples and 1 is a banana, apples win: the answer is **apple**.\n\nWith two classes, we usually pick an **odd** k like 3, 5 or 7, so the vote can never be a tie.',
        ro: '**k** este numărul de vecini pe care îi întrebăm. Cu **k = 3**, votează cele 3 exemple cele mai apropiate.\n\nDacă 2 sunt mere și 1 e banană, câștigă merele: răspunsul este **măr**.\n\nCu două clase, alegem de obicei un k **impar**, ca 3, 5 sau 7, ca votul să nu poată ieși niciodată la egalitate.',
      },
      visual: (g, t, W, H, T) => {
        const voters = ['🍎', '🍎', '🍌'];
        text(g, T({ en: 'k = 3 neighbors vote', ro: 'k = 3 vecini votează' }), W / 2, 40, { size: 24 });
        voters.forEach((e, i) => {
          const k = ease((t % 6) - i * 0.5);
          const x = 140 + i * 180;
          emoji(g, e, x, 120, 60);
          if (k > 0) {
            g.globalAlpha = k;
            text(g, '🗳️', x, 185, { size: 30 });
            g.globalAlpha = 1;
          }
        });
        const k2 = ease((t % 6) - 2);
        const bh = 160;
        box(g, 150, H - 60 - bh * (2 / 3) * k2, 120, bh * (2 / 3) * k2 + 2, { fill: C.red, r: 8 });
        box(g, 370, H - 60 - bh * (1 / 3) * k2, 120, bh * (1 / 3) * k2 + 2, { fill: C.yellow, r: 8 });
        text(g, '🍎 2', 210, H - 35, { size: 22 });
        text(g, '🍌 1', 430, H - 35, { size: 22 });
        if ((t % 6) > 3.2) {
          box(g, W / 2 - 110, 220, 220, 50, { fill: C.sun, r: 14 });
          text(g, T({ en: 'Answer: 🍎 apple!', ro: 'Răspuns: 🍎 măr!' }), W / 2, 245, { size: 22 });
        }
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'The decision boundary', ro: 'Frontiera de decizie' },
      text: {
        en: 'Imagine asking the AI about **every single spot** on the chart and coloring each spot with its answer. You get a map!\n\nThe line where the color changes is called the **decision boundary**. On one side the AI says "red", on the other it says "blue".\n\nIn the experiment you can switch this map on and watch it change as you add points.',
        ro: 'Imaginează-ți că întrebi IA despre **fiecare loc** de pe grafic și colorezi fiecare loc cu răspunsul ei. Obții o hartă!\n\nLinia unde se schimbă culoarea se numește **frontieră de decizie**. De o parte IA spune „roșu”, de cealaltă spune „albastru”.\n\nÎn experiment poți porni această hartă și poți vedea cum se schimbă când adaugi puncte.',
      },
      visual: (g, t, W, H) => {
        const x0 = 20;
        const y0 = 20;
        const w = W - 40;
        const h = H - 40;
        const reveal = Math.min(h, ((t % 7) / 3) * h);
        g.save();
        g.beginPath();
        g.rect(x0, y0, w, reveal);
        g.clip();
        drawMap(g, PTS, 5, x0, y0, w, h, 10);
        g.restore();
        for (const p of PTS) dot(g, x0 + p.x * w, y0 + (1 - p.y) * h, 8, COLS[p.c]);
        line(g, x0, y0 + reveal, x0 + w, y0 + reveal, C.ink, 2, [6, 6]);
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'Choosing k', ro: 'Alegerea lui k' },
      text: {
        en: 'With **k = 1**, the AI only listens to the single closest example. If that example is weird (an **outlier**, like a mislabeled point), the AI gets fooled, and the map gets little islands.\n\nWith a bigger k, like **7**, one weird point gets outvoted, so the map becomes smoother and calmer.\n\nBut if k is **too** big, small groups get ignored. Choosing k is a balancing act.',
        ro: 'Cu **k = 1**, IA ascultă doar de cel mai apropiat exemplu. Dacă acel exemplu e ciudat (o **excepție**, de exemplu un punct etichetat greșit), IA e păcălită, iar harta capătă insulițe.\n\nCu un k mai mare, de exemplu **7**, un punct ciudat pierde la vot, așa că harta devine mai netedă și mai calmă.\n\nDar dacă k e **prea** mare, grupurile mici sunt ignorate. Alegerea lui k e o chestiune de echilibru.',
      },
      visual: (g, t, W, H, T) => {
        const pts = [...PTS, OUT];
        const w = W / 2 - 30;
        const h = H - 90;
        for (const [i, k] of [[0, 1], [1, 7]]) {
          const x0 = 20 + i * (W / 2);
          drawMap(g, pts, k, x0, 60, w, h, 10);
          for (const p of pts) dot(g, x0 + p.x * w, 60 + (1 - p.y) * h, p === OUT ? 10 : 6, COLS[p.c], p === OUT ? '#000' : C.ink, p === OUT ? 3.5 : 2);
          text(g, 'k = ' + k, x0 + w / 2, 32, { size: 24 });
        }
        const ox = 20 + OUT.x * w;
        const oy = 60 + (1 - OUT.y) * h;
        const p = 1 + Math.sin(t * 4) * 0.2;
        g.strokeStyle = C.grape;
        g.lineWidth = 3;
        g.beginPath();
        g.arc(ox, oy, 22 * p, 0, Math.PI * 2);
        g.stroke();
        text(g, T({ en: 'outlier', ro: 'excepție' }), ox, oy + 36, { size: 16, color: C.grape });
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'Measuring distance', ro: 'Măsurarea distanței' },
      text: {
        en: '"Closest" needs a way to measure distance. On a chart we use **Pythagoras**:\n\n`d = √((x₁ − x₂)² + (y₁ − y₂)²)`\n\nThe same formula works with 3, 10 or 1000 features: just add more squared differences.\n\nOne catch: features must use **similar scales**. Weight in grams (like 150) would swamp length in centimeters (like 8). So we **normalize** features first, for example squeezing each one between 0 and 1.',
        ro: '„Cel mai apropiat” are nevoie de un fel de a măsura distanța. Pe un grafic folosim **teorema lui Pitagora**:\n\n`d = √((x₁ − x₂)² + (y₁ − y₂)²)`\n\nAceeași formulă merge cu 3, 10 sau 1000 de trăsături: adaugi doar mai multe diferențe la pătrat.\n\nO capcană: trăsăturile trebuie să aibă **scări asemănătoare**. Greutatea în grame (de exemplu 150) ar acoperi lungimea în centimetri (de exemplu 8). Așa că mai întâi **normalizăm** trăsăturile, de exemplu le strângem pe fiecare între 0 și 1.',
      },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 70, y: 30, w: W - 110, h: H - 90, xmin: 0, xmax: 6, ymin: 0, ymax: 5, ticks: 6 });
        for (let i = 0; i <= 6; i++) text(g, String(i), f.X(i), H - 42, { size: 14, color: C.ink2 });
        for (let i = 0; i <= 5; i++) text(g, String(i), 52, f.Y(i), { size: 14, color: C.ink2 });
        const k = ease((t % 6) / 1.5);
        const A = [1, 0.5];
        const B = [4, 4.5];
        line(g, f.X(A[0]), f.Y(A[1]), f.X(A[0] + (B[0] - A[0]) * k), f.Y(A[1]), C.red, 5);
        if (k >= 1) line(g, f.X(B[0]), f.Y(A[1]), f.X(B[0]), f.Y(A[1] + (B[1] - A[1]) * ease((t % 6) / 1.5 - 1)), C.blue, 5);
        if ((t % 6) > 3) {
          line(g, f.X(A[0]), f.Y(A[1]), f.X(B[0]), f.Y(B[1]), C.mint, 5);
          box(g, f.X(1.4), f.Y(3.4) - 22, 150, 44, { fill: '#fff', r: 12 });
          text(g, 'd = √(3² + 4²) = 5', f.X(1.4) + 75, f.Y(3.4), { size: 18, color: C.mint });
        }
        text(g, '3', f.X(2.5), f.Y(A[1]) + 20, { size: 20, color: C.red });
        if (k >= 1) text(g, '4', f.X(B[0]) + 20, f.Y(2.5), { size: 20, color: C.blue });
        dot(g, f.X(A[0]), f.Y(A[1]), 11, C.sun);
        dot(g, f.X(B[0]), f.Y(B[1]), 11, C.sun);
        void T;
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'Confidence, speed and other classifiers', ro: 'Încredere, viteză și alte clasificatoare' },
      text: {
        en: 'If 4 out of 5 neighbors say "apple", the AI can report **80% confidence**.\n\nkNN is simple, but it gets slow with huge datasets: for every question it compares against **every** stored example.\n\nOther classifiers learn a compact rule instead:\n\n- **decision trees** ask a chain of yes/no questions, like a game of 20 questions\n- **neural networks** learn weights (Stations 6 and 7)',
        ro: 'Dacă 4 din 5 vecini spun „măr”, IA poate raporta o **încredere de 80%**.\n\nkNN e simplu, dar devine lent cu seturi de date uriașe: la fiecare întrebare se compară cu **fiecare** exemplu păstrat.\n\nAlte clasificatoare învață în schimb o regulă compactă:\n\n- **arborii de decizie** pun un șir de întrebări da/nu, ca în jocul „20 de întrebări”\n- **rețelele neuronale** învață ponderi (Stațiile 6 și 7)',
      },
      visual: (g, t, W, H, T) => {
        const node = (x, y, s, fill) => {
          box(g, x - 120, y - 28, 240, 56, { fill, r: 14 });
          text(g, s, x, y, { size: 18, max: 225 });
        };
        const leaf = (x, y, e) => {
          box(g, x - 45, y - 35, 90, 70, { fill: '#fff', r: 16 });
          emoji(g, e, x, y, 44);
        };
        node(W / 2, 60, T({ en: 'Longer than 12 cm?', ro: 'Mai lung de 12 cm?' }), '#fff4d6');
        arrow(g, W / 2 - 60, 90, 150, 170, { width: 3 });
        arrow(g, W / 2 + 60, 90, W - 150, 170, { width: 3 });
        text(g, T({ en: 'yes', ro: 'da' }), 200, 120, { size: 17, color: C.mint });
        text(g, T({ en: 'no', ro: 'nu' }), W - 200, 120, { size: 17, color: C.rose });
        leaf(130, 210, '🍌');
        node(W - 160, 210, T({ en: 'Very red?', ro: 'Foarte roșu?' }), '#e8f4ff');
        arrow(g, W - 210, 240, W - 290, 320, { width: 3 });
        arrow(g, W - 110, 240, W - 60, 320, { width: 3 });
        text(g, T({ en: 'yes', ro: 'da' }), W - 275, 270, { size: 17, color: C.mint });
        text(g, T({ en: 'no', ro: 'nu' }), W - 60, 270, { size: 17, color: C.rose });
        leaf(W - 300, 370, '🍎');
        leaf(W - 70, 370, '🍊');
        void t;
      },
    },
  ],
  experiments: [{ id: 'knnPlayground', req: 1 }],
  quiz: [
    { level: 1, q: { en: 'What is classification?', ro: 'Ce este clasificarea?' }, a: [{ en: 'Deciding which group something belongs to', ro: 'Să decizi în ce grup se încadrează ceva' }, { en: 'Drawing pictures', ro: 'Să desenezi' }, { en: 'Adding numbers', ro: 'Să aduni numere' }, { en: 'Cleaning a classroom', ro: 'Să faci curat în clasă' }], c: 0, why: { en: 'Classification means choosing a class, like "cat" or "dog", for an example.', ro: 'Clasificarea înseamnă alegerea unei clase, ca „pisică” sau „câine”, pentru un exemplu.' } },
    { level: 1, q: { en: 'How does k-Nearest Neighbors decide?', ro: 'Cum decide metoda celor mai apropiați k vecini?' }, a: [{ en: 'The most similar known examples vote', ro: 'Votează cele mai asemănătoare exemple cunoscute' }, { en: 'It flips a coin', ro: 'Dă cu banul' }, { en: 'It asks the internet', ro: 'Întreabă internetul' }, { en: 'It always says "apple"', ro: 'Spune mereu „măr”' }], c: 0, why: { en: 'kNN finds the k closest examples and lets them vote.', ro: 'kNN găsește cele mai apropiate k exemple și le lasă să voteze.' } },
    { level: 1, e: '🍎🍎🍌', q: { en: 'k = 3 and the nearest neighbors are apple, apple, banana. What is the answer?', ro: 'k = 3, iar cei mai apropiați vecini sunt măr, măr, banană. Care e răspunsul?' }, a: [{ en: 'Apple', ro: 'Măr' }, { en: 'Banana', ro: 'Banană' }, { en: 'Orange', ro: 'Portocală' }, { en: 'No answer', ro: 'Niciun răspuns' }], c: 0, why: { en: 'Apples win the vote 2 to 1.', ro: 'Merele câștigă votul cu 2 la 1.' } },
    { level: 1, tf: true, q: { en: 'True or false: "nearest" means the examples that are most similar (the closest dots on the chart).', ro: 'Adevărat sau fals: „cel mai apropiat” înseamnă exemplele cele mai asemănătoare (punctele cele mai apropiate pe grafic).' }, c: true, why: { en: 'True. On a feature chart, similar things are close together.', ro: 'Adevărat. Pe un grafic de trăsături, lucrurile asemănătoare sunt aproape unele de altele.' } },
    { level: 1, q: { en: 'Which of these is a classification question?', ro: 'Care dintre acestea este o întrebare de clasificare?' }, a: [{ en: 'Is this email spam or not spam?', ro: 'E-mailul ăsta e spam sau nu?' }, { en: 'What is 2 + 2?', ro: 'Cât face 2 + 2?' }, { en: 'What time is it?', ro: 'Cât e ceasul?' }, { en: 'How do you spell "cat"?', ro: 'Cum se scrie „pisică”?' }], c: 0, why: { en: 'Spam or not spam: choosing between classes is classification.', ro: 'Spam sau nu: alegerea între clase este clasificare.' } },
    { level: 1, q: { en: 'In k-Nearest Neighbors, what does k mean?', ro: 'În metoda celor mai apropiați k vecini, ce înseamnă k?' }, a: [{ en: 'How many neighbors get to vote', ro: 'Câți vecini votează' }, { en: 'The number of classes', ro: 'Numărul de clase' }, { en: 'The kilograms of the fruit', ro: 'Kilogramele fructului' }, { en: 'How fast the computer is', ro: 'Cât de rapid e calculatorul' }], c: 0, why: { en: 'k is the number of nearest neighbors we ask. With k = 3, the 3 closest examples vote.', ro: 'k este numărul de vecini apropiați pe care îi întrebăm. Cu k = 3, votează cele mai apropiate 3 exemple.' } },
    { level: 1, q: { en: 'k = 5 and the nearest neighbors are: cat, dog, cat, cat, dog. What does kNN answer?', ro: 'k = 5, iar cei mai apropiați vecini sunt: pisică, câine, pisică, pisică, câine. Ce răspunde kNN?' }, a: [{ en: 'Cat', ro: 'Pisică' }, { en: 'Dog', ro: 'Câine' }, { en: 'It\'s a tie', ro: 'E egalitate' }, { en: 'Nothing', ro: 'Nimic' }], c: 0, why: { en: 'Cats win the vote 3 to 2. With 5 voters and two classes, there can never be a tie.', ro: 'Pisicile câștigă votul cu 3 la 2. Cu 5 votanți și două clase, nu poate ieși niciodată egalitate.' } },
    { level: 2, q: { en: 'What is a decision boundary?', ro: 'Ce este o frontieră de decizie?' }, a: [{ en: "The line where the AI's answer changes from one class to another", ro: 'Linia unde răspunsul IA se schimbă dintr-o clasă în alta' }, { en: 'A fence around a farm', ro: 'Un gard în jurul unei ferme' }, { en: 'The end of a game', ro: 'Sfârșitul unui joc' }, { en: 'The edge of the screen', ro: 'Marginea ecranului' }], c: 0, why: { en: 'If you color every spot by the AI\'s answer, the boundary is where the colors meet.', ro: 'Dacă colorezi fiecare loc după răspunsul IA, frontiera e acolo unde se întâlnesc culorile.' } },
    { level: 2, q: { en: 'Why can k = 1 be risky?', ro: 'De ce poate fi riscant k = 1?' }, a: [{ en: 'One weird example (an outlier) can fool it', ro: 'Un singur exemplu ciudat (o excepție) îl poate păcăli' }, { en: 'It uses too many neighbors', ro: 'Folosește prea mulți vecini' }, { en: 'It is illegal', ro: 'Este interzis' }, { en: 'It never gives an answer', ro: 'Nu dă niciodată un răspuns' }], c: 0, why: { en: 'With k = 1 a single mislabeled point decides everything around it.', ro: 'Cu k = 1, un singur punct etichetat greșit decide tot ce e în jurul lui.' } },
    { level: 2, q: { en: 'Why do we often pick an odd k (like 3 or 5) with two classes?', ro: 'De ce alegem des un k impar (ca 3 sau 5) când avem două clase?' }, a: [{ en: 'So the vote can never be a tie', ro: 'Ca votul să nu poată ieși niciodată la egalitate' }, { en: 'Odd numbers are lucky', ro: 'Numerele impare aduc noroc' }, { en: 'Even numbers are not allowed', ro: 'Numerele pare nu sunt permise' }, { en: 'It keeps the computer cool', ro: 'Ține calculatorul rece' }], c: 0, why: { en: 'With an odd number of voters and two classes, one class always wins.', ro: 'Cu un număr impar de votanți și două clase, o clasă câștigă mereu.' } },
    { level: 3, q: { en: 'What is the distance between the points (0, 0) and (3, 4)?', ro: 'Care e distanța dintre punctele (0, 0) și (3, 4)?' }, a: [{ en: '5', ro: '5' }, { en: '7', ro: '7' }, { en: '12', ro: '12' }, { en: '1', ro: '1' }], c: 0, why: { en: '√(3² + 4²) = √(9 + 16) = √25 = 5.', ro: '√(3² + 4²) = √(9 + 16) = √25 = 5.' } },
    { level: 3, q: { en: 'Why should features have similar scales in kNN?', ro: 'De ce ar trebui ca trăsăturile să aibă scări asemănătoare în kNN?' }, a: [{ en: 'Otherwise the feature with big numbers controls the distance', ro: 'Altfel trăsătura cu numere mari controlează distanța' }, { en: 'So the chart looks pretty', ro: 'Ca graficul să arate frumos' }, { en: 'kNN only works with tiny numbers', ro: 'kNN merge doar cu numere mici' }, { en: 'It does not matter at all', ro: 'Nu contează deloc' }], c: 0, why: { en: 'A difference of 50 grams would swamp a difference of 5 cm, unless we normalize.', ro: 'O diferență de 50 de grame ar acoperi o diferență de 5 cm, dacă nu normalizăm.' } },
    { level: 3, q: { en: 'If 4 of 5 neighbors say "apple", the confidence is about...', ro: 'Dacă 4 din 5 vecini spun „măr”, încrederea este de aproximativ...' }, a: [{ en: '80%', ro: '80%' }, { en: '45%', ro: '45%' }, { en: '100%', ro: '100%' }, { en: '20%', ro: '20%' }], c: 0, why: { en: '4 out of 5 = 4/5 = 80%.', ro: '4 din 5 = 4/5 = 80%.' } },
    { level: 3, q: { en: 'Why can kNN be slow with huge datasets?', ro: 'De ce poate fi lent kNN cu seturi de date uriașe?' }, a: [{ en: 'It compares each question with every stored example', ro: 'Compară fiecare întrebare cu fiecare exemplu păstrat' }, { en: 'It sleeps between answers', ro: 'Doarme între răspunsuri' }, { en: 'It needs to download the internet', ro: 'Trebuie să descarce internetul' }, { en: 'It is never slow', ro: 'Nu e niciodată lent' }], c: 0, why: { en: 'kNN keeps all examples and measures distance to each one, every single time.', ro: 'kNN păstrează toate exemplele și măsoară distanța până la fiecare, de fiecare dată.' } },
  ],
};

export { knn };
