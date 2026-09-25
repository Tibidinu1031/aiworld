import { C, emoji, text, box, ease, dot, line, seeded, gauss, plotFrame } from '../ui/draw.js';

const R = seeded(1010);
const CENT = [[0.25, 0.3], [0.72, 0.28], [0.5, 0.75]];
const PTS = [];
CENT.forEach(([cx, cy]) => {
  for (let i = 0; i < 16; i++) PTS.push({ x: cx + gauss(R) * 0.07, y: cy + gauss(R) * 0.07 });
});
const COLS = [C.red, C.blue, C.yellow, C.green, C.grape];

// Precompute a k-means run for the animated lesson.
function kmeansFrames(pts, starts, iters = 6) {
  const frames = [];
  let cs = starts.map((c) => c.slice());
  for (let it = 0; it < iters; it++) {
    const assign = pts.map((p) => {
      let best = 0;
      let bd = Infinity;
      cs.forEach((c, i) => {
        const d = (p.x - c[0]) ** 2 + (p.y - c[1]) ** 2;
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    });
    frames.push({ cs: cs.map((c) => c.slice()), assign, phase: 'assign' });
    cs = cs.map((c, i) => {
      const mine = pts.filter((_, j) => assign[j] === i);
      if (!mine.length) return c;
      return [mine.reduce((s, p) => s + p.x, 0) / mine.length, mine.reduce((s, p) => s + p.y, 0) / mine.length];
    });
    frames.push({ cs: cs.map((c) => c.slice()), assign, phase: 'move' });
  }
  return frames;
}
const FRAMES = kmeansFrames(PTS, [[0.05, 0.55], [0.95, 0.6], [0.5, 0.05]]);

function flag(g, x, y, col) {
  line(g, x, y, x, y - 34, C.ink, 3);
  g.beginPath();
  g.moveTo(x, y - 34);
  g.lineTo(x + 24, y - 27);
  g.lineTo(x, y - 20);
  g.closePath();
  g.fillStyle = col;
  g.fill();
  g.strokeStyle = C.ink;
  g.lineWidth = 2;
  g.stroke();
  dot(g, x, y, 5, C.ink, null);
}

// Station 10: Clustering
export default {
  id: 's10',
  intro: [
    { who: 'ada', text: { en: 'Station 10: what if nobody tells the AI the answers? It can still find groups on its own. That is clustering!', ro: 'Stația 10: ce se întâmplă dacă nimeni nu-i spune IA răspunsurile? Tot poate găsi singură grupuri. Asta e gruparea!' } },
    { who: 'bip', text: { en: 'No labels? No answer key? I LOVE a mystery!', ro: 'Fără etichete? Fără răspunsuri? ADOR misterele!' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'Learning without answers', ro: 'Învățare fără răspunsuri' },
      text: {
        en: 'So far, our AIs learned from **labeled** examples: every photo came with the right answer.\n\nBut sometimes we only have data, **no labels**. Can an AI still learn something?\n\nYes! It can look for **groups of similar things**, called **clusters**. This is **unsupervised learning**: learning without a teacher giving answers.',
        ro: 'Până acum, IA noastre au învățat din exemple **etichetate**: fiecare poză venea cu răspunsul corect.\n\nDar uneori avem doar date, **fără etichete**. Mai poate o IA să învețe ceva?\n\nDa! Poate căuta **grupuri de lucruri asemănătoare**, numite **clustere** (grupuri). Aceasta este **învățarea nesupravegheată**: învățare fără un profesor care dă răspunsurile.',
      },
      visual: (g, t, W, H, T) => {
        const k = ease(((t % 7) - 2) / 1.5);
        const f = plotFrame(g, { x: 40, y: 40, w: W - 80, h: H - 80, xmin: 0, xmax: 1, ymin: 0, ymax: 1, grid: false });
        PTS.forEach((p, i) => {
          const c = Math.floor(i / 16);
          const col = k > 0 ? COLS[c] : '#9aa3bf';
          dot(g, f.X(p.x), f.Y(p.y), 9, col);
        });
        if (k > 0.5) {
          CENT.forEach(([cx, cy], i) => {
            g.strokeStyle = COLS[i];
            g.lineWidth = 3;
            g.setLineDash([8, 6]);
            g.beginPath();
            g.arc(f.X(cx), f.Y(cy), 80, 0, Math.PI * 2);
            g.stroke();
            g.setLineDash([]);
          });
        }
        text(g, k > 0 ? T({ en: '3 groups found!', ro: '3 grupuri găsite!' }) : T({ en: 'No labels... just dots', ro: 'Fără etichete... doar puncte' }), W / 2, 22, { size: 20 });
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Clusters in real life', ro: 'Grupuri în viața reală' },
      text: {
        en: 'Clustering is everywhere:\n\n- a music app groups songs that sound alike\n- a shop groups customers with similar tastes\n- scientists group stars, animals or cells that share features\n- a photo app groups pictures of the same person\n\nNobody labeled these groups beforehand. The AI found them by looking at what is **similar**.',
        ro: 'Gruparea e peste tot:\n\n- o aplicație de muzică grupează cântecele care sună la fel\n- un magazin grupează clienții cu gusturi asemănătoare\n- oamenii de știință grupează stele, animale sau celule cu trăsături comune\n- o aplicație de poze grupează pozele cu aceeași persoană\n\nNimeni nu a etichetat aceste grupuri dinainte. IA le-a găsit uitându-se la ce e **asemănător**.',
      },
      visual: {
        type: 'emoji',
        cols: 2,
        items: [
          { e: '🎵', t: { en: 'Similar songs', ro: 'Cântece asemănătoare' } },
          { e: '🛒', t: { en: 'Similar shoppers', ro: 'Cumpărători asemănători' } },
          { e: '🔭', t: { en: 'Types of stars', ro: 'Tipuri de stele' } },
          { e: '🖼️', t: { en: 'Same-face photos', ro: 'Poze cu aceeași față' } },
        ],
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'k-means in three steps', ro: 'k-means în trei pași' },
      text: {
        en: 'The most famous clustering method is **k-means**. You choose **k**, the number of groups. Then:\n\n- **1.** Drop k center flags at random spots.\n- **2.** Every dot joins the team of its **nearest** flag.\n- **3.** Move each flag to the **middle** of its team.\n\nRepeat steps 2 and 3 until the flags stop moving. Done: k groups!',
        ro: 'Cea mai cunoscută metodă de grupare se numește **k-means** (k-medii). Tu alegi **k**, numărul de grupuri. Apoi:\n\n- **1.** Pui k stegulețe-centru în locuri la întâmplare.\n- **2.** Fiecare punct intră în echipa stegulețului **celui mai apropiat**.\n- **3.** Muți fiecare steguleț în **mijlocul** echipei lui.\n\nRepeți pașii 2 și 3 până când stegulețele nu se mai mișcă. Gata: k grupuri!',
      },
      bip: { en: 'Like kids at recess running to the nearest friend group!', ro: 'Ca niște copii în pauză care fug la cel mai apropiat grup de prieteni!' },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 30, y: 50, w: W - 60, h: H - 80, xmin: 0, xmax: 1, ymin: 0, ymax: 1, grid: false });
        const idx = Math.min(FRAMES.length - 1, Math.floor((t % 14) / 1.1));
        const fr = FRAMES[idx];
        PTS.forEach((p, i) => {
          const c = fr.assign[i];
          if (fr.phase === 'assign') line(g, f.X(p.x), f.Y(p.y), f.X(fr.cs[c][0]), f.Y(fr.cs[c][1]), 'rgba(59,66,102,0.15)', 1.5);
          dot(g, f.X(p.x), f.Y(p.y), 8, idx === 0 && fr.phase === 'assign' && (t % 14) < 0.5 ? '#9aa3bf' : COLS[c]);
        });
        fr.cs.forEach((c, i) => flag(g, f.X(c[0]), f.Y(c[1]), COLS[i]));
        const lab = fr.phase === 'assign' ? T({ en: 'Step 2: join the nearest flag', ro: 'Pasul 2: intră la cel mai apropiat steguleț' }) : T({ en: 'Step 3: flags move to the middle', ro: 'Pasul 3: stegulețele merg la mijloc' });
        box(g, W / 2 - 190, 8, 380, 36, { fill: '#fff', r: 12 });
        text(g, lab, W / 2, 26, { size: 18 });
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'Choosing k', ro: 'Alegerea lui k' },
      text: {
        en: 'You have to choose how many groups you want. That\'s not always easy!\n\n- **k too small**: different things get squashed into the same group.\n- **k too big**: real groups get chopped into pieces.\n\nA helpful trick is the **elbow method**: run k-means for k = 1, 2, 3... and plot the total distance from dots to their flags. The distance drops fast, then slowly. The bend, like an elbow, is usually a good k.',
        ro: 'Trebuie să alegi câte grupuri vrei. Nu e mereu ușor!\n\n- **k prea mic**: lucruri diferite sunt înghesuite în același grup.\n- **k prea mare**: grupurile reale sunt tăiate în bucăți.\n\nUn truc util este **metoda cotului**: rulezi k-means pentru k = 1, 2, 3... și desenezi distanța totală de la puncte la stegulețele lor. Distanța scade repede, apoi încet. Îndoitura, ca un cot, e de obicei un k bun.',
      },
      visual: (g, t, W, H, T) => {
        const vals = [100, 52, 14, 11, 9, 7.5];
        const f = plotFrame(g, { x: 80, y: 40, w: W - 130, h: H - 120, xmin: 1, xmax: 6, ymin: 0, ymax: 110, xlabel: 'k', ylabel: T({ en: 'total distance', ro: 'distanța totală' }), ticks: 5 });
        for (let k = 1; k <= 6; k++) text(g, String(k), f.X(k), H - 66, { size: 15, color: C.ink2 });
        const n = Math.min(6, 1 + Math.floor((t % 7) * 1.2));
        g.strokeStyle = C.accent;
        g.lineWidth = 5;
        g.beginPath();
        for (let k = 1; k <= n; k++) (k === 1 ? g.moveTo(f.X(k), f.Y(vals[k - 1])) : g.lineTo(f.X(k), f.Y(vals[k - 1])));
        g.stroke();
        for (let k = 1; k <= n; k++) dot(g, f.X(k), f.Y(vals[k - 1]), 8, k === 3 ? C.sun : C.accent);
        if (n >= 4) {
          emoji(g, '💪', f.X(3) + 30, f.Y(14) - 40, 40);
          text(g, T({ en: 'elbow: k = 3', ro: 'cotul: k = 3' }), f.X(3) + 90, f.Y(14) - 10, { size: 18, color: C.accent });
        }
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'Three ways to learn', ro: 'Trei feluri de a învăța' },
      text: {
        en: 'Machine learning comes in three big flavors:\n\n- **Supervised learning**: learn from examples **with answers** (labels). Like a teacher showing worked examples. (Stations 4 to 9)\n- **Unsupervised learning**: find structure in data **without answers**, like clustering. (This station)\n- **Reinforcement learning**: learn by **trying** things and getting **rewards**. (Next station!)',
        ro: 'Învățarea automată vine în trei mari feluri:\n\n- **Învățarea supravegheată**: învață din exemple **cu răspunsuri** (etichete). Ca un profesor care arată exemple rezolvate. (Stațiile 4–9)\n- **Învățarea nesupravegheată**: găsește structură în date **fără răspunsuri**, ca la grupare. (Această stație)\n- **Învățarea prin recompensă**: învață **încercând** lucruri și primind **recompense**. (Stația următoare!)',
      },
      visual: {
        type: 'flow',
        steps: [
          { e: '👩‍🏫', t: { en: 'Supervised\n(with answers)', ro: 'Supravegheată\n(cu răspunsuri)' }, color: '#e6f4ff' },
          { e: '🫧', t: { en: 'Unsupervised\n(find groups)', ro: 'Nesupravegheată\n(găsește grupuri)' }, color: '#eafbe9' },
          { e: '🏆', t: { en: 'Reinforcement\n(rewards)', ro: 'Prin recompensă\n(recompense)' }, color: '#fff4d6' },
        ],
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'Starting points matter', ro: 'Punctele de pornire contează' },
      text: {
        en: 'k-means always finishes, but the result depends on where the flags start. An unlucky start can end in a worse grouping, for example two flags sharing one group while another flag covers two groups. It is another **local minimum**!\n\nFixes:\n\n- run k-means several times with different random starts and keep the result with the smallest total distance\n- use **k-means++**, a smart way to spread the starting flags far apart',
        ro: 'k-means se termină mereu, dar rezultatul depinde de unde pornesc stegulețele. Un start ghinionist poate duce la o grupare mai proastă, de exemplu două stegulețe care împart un grup, iar alt steguleț care acoperă două grupuri. E încă un **minim local**!\n\nSoluții:\n\n- rulezi k-means de mai multe ori, cu porniri diferite, și păstrezi rezultatul cu cea mai mică distanță totală\n- folosești **k-means++**, un fel isteț de a împrăștia departe unele de altele stegulețele de start',
      },
      visual: (g, t, W, H, T) => {
        const w = W / 2 - 30;
        const bad = [[0.23, 0.3], [0.3, 0.32], [0.62, 0.52]];
        const good = CENT;
        [[good, T({ en: 'Good start → good groups', ro: 'Start bun → grupuri bune' }), C.mint], [bad, T({ en: 'Unlucky start → stuck', ro: 'Start ghinionist → blocat' }), C.rose]].forEach(([cs, lab, col], k) => {
          const f = plotFrame(g, { x: 20 + k * (W / 2), y: 60, w, h: H - 100, xmin: 0, xmax: 1, ymin: 0, ymax: 1, grid: false });
          PTS.forEach((p) => {
            let best = 0;
            let bd = Infinity;
            cs.forEach((c, i) => {
              const d = (p.x - c[0]) ** 2 + (p.y - c[1]) ** 2;
              if (d < bd) {
                bd = d;
                best = i;
              }
            });
            dot(g, f.X(p.x), f.Y(p.y), 6, COLS[best]);
          });
          cs.forEach((c, i) => flag(g, f.X(c[0]), f.Y(c[1]), COLS[i]));
          text(g, lab, 20 + k * (W / 2) + w / 2, 32, { size: 17, color: col, max: w });
        });
        void t;
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'Clusters of words', ro: 'Grupuri de cuvinte' },
      text: {
        en: 'AI can place **words** as points in space too. Words used in similar ways end up close together: "cat" near "dog", "apple" near "banana", "red" near "blue".\n\nThese word positions are called **embeddings**. Clustering them reveals topics, like animals, food and colors, without anyone labeling them.\n\nLanguage AIs rely heavily on embeddings. You will meet them again at Station 12.',
        ro: 'IA poate așeza și **cuvinte** ca puncte în spațiu. Cuvintele folosite în moduri asemănătoare ajung aproape unele de altele: „pisică” lângă „câine”, „măr” lângă „banană”, „roșu” lângă „albastru”.\n\nAceste poziții ale cuvintelor se numesc **reprezentări vectoriale** (în engleză *embeddings*). Gruparea lor dezvăluie teme, ca animale, mâncare și culori, fără ca cineva să le eticheteze.\n\nIA de limbaj se bazează mult pe astfel de reprezentări. Le vei reîntâlni la Stația 12.',
      },
      visual: (g, t, W, H, T) => {
        const words = [
          [{ en: 'cat', ro: 'pisică' }, 0.2, 0.75, 0], [{ en: 'dog', ro: 'câine' }, 0.3, 0.82, 0], [{ en: 'horse', ro: 'cal' }, 0.16, 0.62, 0], [{ en: 'bird', ro: 'pasăre' }, 0.32, 0.66, 0],
          [{ en: 'apple', ro: 'măr' }, 0.75, 0.72, 1], [{ en: 'banana', ro: 'banană' }, 0.84, 0.6, 1], [{ en: 'bread', ro: 'pâine' }, 0.68, 0.58, 1], [{ en: 'cheese', ro: 'brânză' }, 0.8, 0.8, 1],
          [{ en: 'red', ro: 'roșu' }, 0.45, 0.25, 2], [{ en: 'blue', ro: 'albastru' }, 0.58, 0.18, 2], [{ en: 'green', ro: 'verde' }, 0.4, 0.14, 2], [{ en: 'yellow', ro: 'galben' }, 0.55, 0.32, 2],
        ];
        const k = ease(((t % 8) - 2) / 1.5);
        words.forEach(([w, x, y, c]) => {
          const px = 40 + x * (W - 80);
          const py = 30 + (1 - y) * (H - 60);
          box(g, px - 50, py - 16, 100, 32, { fill: k > 0 ? ['#ffe9e6', '#fff4d6', '#e6f4ff'][c] : '#fff', r: 10, lw: 2, shadow: false });
          text(g, T(w), px, py, { size: 16, max: 92 });
        });
        if (k > 0.5) {
          [[0.24, 0.72, { en: 'animals', ro: 'animale' }], [0.77, 0.68, { en: 'food', ro: 'mâncare' }], [0.5, 0.22, { en: 'colors', ro: 'culori' }]].forEach(([x, y, lab], i) => {
            text(g, T(lab), 40 + x * (W - 80), 30 + (1 - y) * (H - 60) - 80, { size: 20, color: [C.red, C.orange, C.blue][i] });
          });
        }
      },
    },
  ],
  experiments: [{ id: 'kmeansLab', req: 1 }],
  quiz: [
    { level: 1, q: { en: 'What does clustering do?', ro: 'Ce face gruparea?' }, a: [{ en: 'Finds groups of similar things without being told the answers', ro: 'Găsește grupuri de lucruri asemănătoare fără să i se spună răspunsurile' }, { en: 'Deletes data', ro: 'Șterge date' }, { en: 'Sorts words alphabetically', ro: 'Sortează cuvintele alfabetic' }, { en: 'Draws bunches of grapes', ro: 'Desenează ciorchini de struguri' }], c: 0, why: { en: 'Clustering discovers groups on its own, based on similarity.', ro: 'Gruparea descoperă singură grupuri, după asemănare.' } },
    { level: 1, q: { en: 'Clustering is a kind of...', ro: 'Gruparea este un fel de...' }, a: [{ en: 'Unsupervised learning (no labels)', ro: 'Învățare nesupravegheată (fără etichete)' }, { en: 'Supervised learning with labels', ro: 'Învățare supravegheată cu etichete' }, { en: 'Learning from rewards', ro: 'Învățare din recompense' }, { en: 'Not AI at all', ro: 'Nu e deloc IA' }], c: 0, why: { en: 'No labels are given, so it is unsupervised.', ro: 'Nu se dau etichete, deci e nesupravegheată.' } },
    { level: 1, q: { en: 'In k-means, what does each dot do?', ro: 'În k-means, ce face fiecare punct?' }, a: [{ en: 'Joins the nearest center flag', ro: 'Intră la cel mai apropiat steguleț-centru' }, { en: 'Joins the farthest flag', ro: 'Intră la cel mai îndepărtat steguleț' }, { en: 'Picks a flag at random', ro: 'Alege un steguleț la întâmplare' }, { en: 'Disappears', ro: 'Dispare' }], c: 0, why: { en: 'Each dot joins the team of its nearest center.', ro: 'Fiecare punct intră în echipa celui mai apropiat centru.' } },
    { level: 1, tf: true, q: { en: 'True or false: in k-means, after the dots join teams, each center moves to the middle of its team.', ro: 'Adevărat sau fals: în k-means, după ce punctele intră în echipe, fiecare centru se mută în mijlocul echipei lui.' }, c: true, why: { en: 'True. Assign, move, repeat until nothing changes.', ro: 'Adevărat. Atribuie, mută, repetă până nu se mai schimbă nimic.' } },
    { level: 1, e: '🎵', q: { en: 'Which is a good use of clustering?', ro: 'Care e o bună utilizare a grupării?' }, a: [{ en: 'Grouping songs that sound similar', ro: 'Gruparea cântecelor care sună asemănător' }, { en: 'Adding 2 + 2', ro: 'Adunarea 2 + 2' }, { en: 'Turning on a lamp', ro: 'Aprinderea unei lămpi' }, { en: 'Measuring the temperature', ro: 'Măsurarea temperaturii' }], c: 0, why: { en: 'Clustering finds groups of similar songs without anyone labeling them.', ro: 'Gruparea găsește grupuri de cântece asemănătoare fără ca cineva să le eticheteze.' } },
    { level: 2, q: { en: 'What does "k" mean in k-means?', ro: 'Ce înseamnă „k” în k-means?' }, a: [{ en: 'The number of groups', ro: 'Numărul de grupuri' }, { en: 'Kilograms', ro: 'Kilograme' }, { en: 'The king', ro: 'Regele' }, { en: 'The speed', ro: 'Viteza' }], c: 0, why: { en: 'You choose k, the number of clusters you want.', ro: 'Tu alegi k, numărul de grupuri pe care le vrei.' } },
    { level: 2, q: { en: 'What is the difference between supervised and unsupervised learning?', ro: 'Care e diferența dintre învățarea supravegheată și cea nesupravegheată?' }, a: [{ en: 'Supervised uses labeled answers; unsupervised finds structure without labels', ro: 'Cea supravegheată folosește răspunsuri etichetate; cea nesupravegheată găsește structură fără etichete' }, { en: 'Unsupervised happens at night', ro: 'Cea nesupravegheată are loc noaptea' }, { en: 'There is no difference', ro: 'Nu e nicio diferență' }, { en: 'Supervised learning has no data', ro: 'Învățarea supravegheată nu are date' }], c: 0, why: { en: 'Labels are the key difference.', ro: 'Etichetele sunt diferența principală.' } },
    { level: 2, tf: true, q: { en: 'True or false: if k is too small, different kinds of things can get squashed into one group.', ro: 'Adevărat sau fals: dacă k e prea mic, lucruri diferite pot fi înghesuite într-un singur grup.' }, c: true, why: { en: 'True. Too few groups forces different things together.', ro: 'Adevărat. Prea puține grupuri forțează lucruri diferite să stea împreună.' } },
    { level: 3, q: { en: 'Why run k-means several times with different starts?', ro: 'De ce rulăm k-means de mai multe ori, cu porniri diferite?' }, a: [{ en: 'Different starts can give different results, so we keep the best', ro: 'Porniri diferite pot da rezultate diferite, așa că îl păstrăm pe cel mai bun' }, { en: 'To waste time', ro: 'Ca să pierdem timpul' }, { en: 'Because it always crashes', ro: 'Pentru că se blochează mereu' }, { en: 'To change the data', ro: 'Ca să schimbăm datele' }], c: 0, why: { en: 'An unlucky start can end in a local minimum. Several tries fix that.', ro: 'Un start ghinionist se poate termina într-un minim local. Mai multe încercări rezolvă asta.' } },
    { level: 3, q: { en: 'What does k-means++ do?', ro: 'Ce face k-means++?' }, a: [{ en: 'Chooses starting centers that are spread far apart', ro: 'Alege centre de pornire împrăștiate departe unele de altele' }, { en: 'Adds more data', ro: 'Adaugă mai multe date' }, { en: 'Doubles k', ro: 'Dublează k' }, { en: 'Removes the centers', ro: 'Elimină centrele' }], c: 0, why: { en: 'Spreading out the starting flags usually leads to better clusters.', ro: 'Împrăștierea stegulețelor de start duce de obicei la grupuri mai bune.' } },
    { level: 3, q: { en: 'In word embeddings, which word would be closest to "cat"?', ro: 'În reprezentările vectoriale ale cuvintelor, ce cuvânt ar fi cel mai aproape de „pisică”?' }, a: [{ en: 'Dog', ro: 'Câine' }, { en: 'Bicycle', ro: 'Bicicletă' }, { en: 'Thunder', ro: 'Tunet' }, { en: 'Seven', ro: 'Șapte' }], c: 0, why: { en: 'Cat and dog are used in similar sentences, so their embeddings are close.', ro: 'Pisică și câine apar în propoziții asemănătoare, deci reprezentările lor sunt apropiate.' } },
  ],
};
