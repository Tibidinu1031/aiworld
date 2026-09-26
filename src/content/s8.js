import { C, emoji, text, box, ease, arrow, rr } from '../ui/draw.js';

const N = 12;
const CAT = (() => {
  const img = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const cx = x - 5.5;
      const cy = y - 6.2;
      let v = 0.15;
      if ((cx * cx) / 26 + (cy * cy) / 20 < 1) v = 0.92;
      if (y < 4 && ((x >= 1 && x <= 3 && y > 3 - x) || (x >= 8 && x <= 10 && y > x - 8))) v = 0.92;
      if ((x === 3 || x === 8) && (y === 5 || y === 6)) v = 0.1;
      if (y === 8 && (x === 5 || x === 6)) v = 0.4;
      img.push(v);
    }
  }
  return img;
})();
const at = (x, y) => (x < 0 || y < 0 || x >= N || y >= N ? 0.15 : CAT[y * N + x]);
const KX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
function conv(x, y, k) {
  let s = 0;
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) s += at(x + i, y + j) * k[j + 1][i + 1];
  return s;
}

function drawGrid(g, x0, y0, s, fn) {
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      g.fillStyle = fn(x, y);
      g.fillRect(x0 + x * s, y0 + y * s, s - 1, s - 1);
    }
  }
}

// Station 8: Computer Vision
export default {
  id: 's8',
  intro: [
    { who: 'ada', text: { en: 'Station 8: computer vision! How can a machine made of numbers understand a picture? Look at the two pixel walls on this island.', ro: 'Stația 8: vederea artificială! Cum poate o mașină făcută din numere să înțeleagă o poză? Uită-te la cei doi pereți de pixeli de pe această insulă.' } },
    { who: 'bip', text: { en: 'My camera eyes see numbers, but I want to see CATS!', ro: 'Ochii mei-cameră văd numere, dar eu vreau să văd PISICI!' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'How AI sees', ro: 'Cum vede IA' },
      text: {
        en: 'A camera turns light into **pixels**, and pixels are numbers. **Computer vision** is AI that makes sense of those numbers:\n\n- recognizing objects: "that\'s a dog"\n- reading text in photos\n- finding faces\n- helping self-driving cars see the road, signs and people\n- helping doctors look at X-rays',
        ro: 'O cameră transformă lumina în **pixeli**, iar pixelii sunt numere. **Vederea artificială** (în engleză *computer vision*) este IA care înțelege aceste numere:\n\n- recunoaște obiecte: „acolo e un câine”\n- citește textul din poze\n- găsește fețe\n- ajută mașinile autonome să vadă drumul, semnele și oamenii\n- îi ajută pe medici să se uite la radiografii',
      },
      visual: {
        type: 'flow',
        steps: [
          { e: '📷', t: { en: 'Camera', ro: 'Cameră' } },
          { e: '🔢', t: { en: 'Pixels\n(numbers)', ro: 'Pixeli\n(numere)' } },
          { e: '🧠', t: { en: 'Vision AI', ro: 'IA de vedere' } },
          { e: '🐶', t: { en: '"A dog!"', ro: '„Un câine!”' } },
        ],
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Looking for clues', ro: 'În căutarea indiciilor' },
      text: {
        en: 'A vision AI doesn\'t look at the whole picture at once. It hunts for **clues**:\n\n- first tiny clues: edges, corners, patches of color\n- then it combines them into parts: pointy ears, whiskers, round eyes\n- finally it decides: pointy ears + whiskers + round eyes = probably a **cat**!\n\nThat is surprisingly similar to how your own eyes and brain work.',
        ro: 'O IA de vedere nu se uită la toată poza deodată. Caută **indicii**:\n\n- mai întâi indicii mici: margini, colțuri, pete de culoare\n- apoi le combină în părți: urechi ascuțite, mustăți, ochi rotunzi\n- la final decide: urechi ascuțite + mustăți + ochi rotunzi = probabil o **pisică**!\n\nEste surprinzător de asemănător cu felul în care lucrează ochii și creierul tău.',
      },
      visual: (g, t, W, H, T) => {
        const s = 22;
        const x0 = 40;
        const y0 = 110;
        drawGrid(g, x0, y0, s, (x, y) => {
          const v = Math.round(at(x, y) * 255);
          return `rgb(${v},${v},${v})`;
        });
        const cyc = t % 7;
        const clues = [
          [{ en: 'edges', ro: 'margini' }, [1, 0, 3, 4]],
          [{ en: 'ears', ro: 'urechi' }, [1, 0, 10, 4]],
          [{ en: 'eyes', ro: 'ochi' }, [3, 5, 6, 2]],
        ];
        clues.forEach(([lab, [cx, cy, w, hh]], i) => {
          if (cyc < 0.8 + i * 1.3) return;
          g.strokeStyle = [C.accent, C.grape, C.mint][i];
          g.lineWidth = 4;
          g.strokeRect(x0 + cx * s - 2, y0 + cy * s - 2, w * s + 4, hh * s + 4);
          text(g, '✓ ' + T(lab), 400, 130 + i * 50, { size: 22, color: [C.accent, C.grape, C.mint][i], align: 'left' });
        });
        if (cyc > 4.8) {
          box(g, 380, 300, 220, 70, { fill: C.sun, r: 16 });
          text(g, T({ en: '= a cat! 🐱', ro: '= o pisică! 🐱' }), 490, 335, { size: 26 });
        }
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'Teaching with examples', ro: 'Învățăm cu exemple' },
      text: {
        en: 'To teach a vision AI, we show it many **labeled pictures**: cats labeled "cat", dogs labeled "dog", and so on.\n\nIt learns from what it is shown. If it only ever saw orange cats, it might not recognize a black cat. So good vision datasets have lots of variety: different colors, sizes, angles, backgrounds and lighting.\n\nIn the experiment, **you** will be the teacher!',
        ro: 'Ca să învățăm o IA de vedere, îi arătăm multe **poze etichetate**: pisici etichetate „pisică”, câini etichetați „câine” și așa mai departe.\n\nEa învață din ce i se arată. Dacă a văzut doar pisici portocalii, s-ar putea să nu recunoască o pisică neagră. De aceea seturile de date bune pentru vedere au multă varietate: culori, mărimi, unghiuri, fundaluri și lumini diferite.\n\nÎn experiment, **tu** vei fi profesorul!',
      },
      bip: { en: 'I once thought a fluffy slipper was a cat. Not enough examples!', ro: 'Odată am crezut că un papuc pufos e o pisică. N-am avut destule exemple!' },
      visual: {
        type: 'emoji',
        cols: 4,
        items: [
          { e: '🐱', t: { en: 'cat', ro: 'pisică' } },
          { e: '🐈‍⬛', t: { en: 'cat', ro: 'pisică' } },
          { e: '😺', t: { en: 'cat', ro: 'pisică' } },
          { e: '🐈', t: { en: 'cat', ro: 'pisică' } },
          { e: '🐶', t: { en: 'dog', ro: 'câine' } },
          { e: '🐕', t: { en: 'dog', ro: 'câine' } },
          { e: '🐩', t: { en: 'dog', ro: 'câine' } },
          { e: '🦮', t: { en: 'dog', ro: 'câine' } },
        ],
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'Filters: little magnifying glasses', ro: 'Filtrele: mici lupe' },
      text: {
        en: 'How does an AI find edges? With a **filter** (also called a **kernel**): a tiny grid of numbers, often 3 × 3.\n\nThe filter slides over the picture. At each spot it **multiplies** the 9 pixels under it by its 9 numbers and **adds** everything up. The result goes into a new picture called a **feature map**.\n\nA vertical-edge filter gives big numbers where dark meets bright side by side, and almost 0 on flat areas.',
        ro: 'Cum găsește o IA marginile? Cu un **filtru** (numit și **nucleu**, în engleză *kernel*): o grilă mică de numere, de obicei 3 × 3.\n\nFiltrul alunecă peste poză. În fiecare loc **înmulțește** cei 9 pixeli de sub el cu cele 9 numere ale lui și **adună** totul. Rezultatul intră într-o poză nouă numită **hartă de trăsături**.\n\nUn filtru pentru margini verticale dă numere mari acolo unde întunericul și lumina stau unul lângă altul și aproape 0 pe zonele netede.',
      },
      visual: (g, t, W, H, T) => {
        const s = 20;
        const x0 = 30;
        const y0 = 100;
        const x1 = 350;
        drawGrid(g, x0, y0, s, (x, y) => {
          const v = Math.round(at(x, y) * 255);
          return `rgb(${v},${v},${v})`;
        });
        const k = Math.floor((t * 6) % (N * N));
        const kx = k % N;
        const ky = Math.floor(k / N);
        drawGrid(g, x1, y0, s, (x, y) => {
          if (y * N + x > k) return '#f1f4fb';
          const v = Math.min(1, Math.abs(conv(x, y, KX)) / 3);
          return `rgb(${Math.round(20 + v * 60)},${Math.round(25 + v * 210)},${Math.round(50 + v * 200)})`;
        });
        g.strokeStyle = C.accent;
        g.lineWidth = 3;
        g.strokeRect(x0 + (kx - 1) * s, y0 + (ky - 1) * s, s * 3, s * 3);
        g.strokeRect(x1 + kx * s, y0 + ky * s, s, s);
        arrow(g, x0 + (kx + 2) * s, y0 + ky * s + s / 2, x1 + kx * s - 4, y0 + ky * s + s / 2, { color: C.accent, width: 2, head: 9, dash: [5, 5] });
        text(g, T({ en: 'picture', ro: 'poza' }), x0 + (N * s) / 2, 70, { size: 20 });
        text(g, T({ en: 'feature map (edges)', ro: 'harta de trăsături (margini)' }), x1 + (N * s) / 2, 70, { size: 20 });
        KX.forEach((row, j) => row.forEach((v, i) => {
          rr(g, 250 + i * 30, 380 + j * 28, 28, 26, 5);
          g.fillStyle = v > 0 ? '#d7f6ff' : v < 0 ? '#ffe7d6' : '#fff';
          g.fill();
          text(g, String(v), 264 + i * 30, 393 + j * 28, { size: 15 });
        }));
        text(g, T({ en: 'filter', ro: 'filtru' }), 200, 420, { size: 18, color: C.ink2 });
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'Convolutional neural networks', ro: 'Rețele neuronale convoluționale' },
      text: {
        en: 'A **CNN** (Convolutional Neural Network) is a neural network made of layers of filters.\n\nThe amazing part: nobody chooses the filter numbers. The CNN **learns them** during training! Early layers learn edge filters, deeper layers learn filters for eyes, wheels, letters...\n\nBetween filter layers, **pooling** shrinks the feature maps (for example, keeping only the biggest value in each 2 × 2 square). This keeps the important information and makes the network faster.',
        ro: 'O **CNN** (rețea neuronală convoluțională) este o rețea neuronală făcută din straturi de filtre.\n\nPartea uimitoare: nimeni nu alege numerele din filtre. CNN-ul **le învață singur** în timpul antrenării! Primele straturi învață filtre de margini, straturile mai adânci învață filtre pentru ochi, roți, litere...\n\nÎntre straturile de filtre, **gruparea** (în engleză *pooling*) micșorează hărțile de trăsături (de exemplu, păstrează doar cea mai mare valoare din fiecare pătrat 2 × 2). Așa se păstrează informația importantă și rețeaua merge mai repede.',
      },
      visual: (g, t, W, H, T) => {
        const stacks = [[1, 150, '#f1f4fb'], [4, 120, '#d7f6ff'], [8, 80, '#ecdfff'], [12, 50, '#fff4d6']];
        const labels = [{ en: 'picture', ro: 'poză' }, { en: 'edges', ro: 'margini' }, { en: 'parts', ro: 'părți' }, { en: 'objects', ro: 'obiecte' }];
        stacks.forEach(([n, s, col], i) => {
          const x = 40 + i * 150;
          const y = H / 2 - s / 2;
          const k = ease((t % 6) - i * 0.6);
          for (let j = Math.min(n, 6) - 1; j >= 0; j--) {
            g.globalAlpha = Math.max(0.15, k);
            box(g, x + j * 6, y - j * 6, s, s, { fill: col, r: 8, lw: 2, shadow: false });
          }
          g.globalAlpha = 1;
          text(g, T(labels[i]), x + s / 2, H / 2 + 110, { size: 18 });
          if (i < 3) arrow(g, x + s + 36, H / 2, x + 145, H / 2, { width: 3 });
        });
        emoji(g, '🐱', 40 + 75, H / 2, 70);
        text(g, '🐱 92%', 40 + 450 + 25, H / 2 - 80, { size: 20, color: C.accent });
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'Edge detection, with numbers', ro: 'Detectarea marginilor, cu numere' },
      text: {
        en: 'Take the vertical-edge filter\n\n`[−1 0 1]`\n`[−2 0 2]`\n`[−1 0 1]`\n\n- On a **flat** area (all pixels 0.9): the left column gives −(0.9 + 1.8 + 0.9) = −3.6 and the right column gives +3.6. Total: **0**. No edge!\n- On an **edge** with dark on the left (0.1) and bright on the right (0.9): −0.4 + 3.6 = **3.2**. A strong edge!\n\nSwap the signs and you find edges the other way round. Turn the filter sideways and you find horizontal edges.',
        ro: 'Ia filtrul pentru margini verticale\n\n`[−1 0 1]`\n`[−2 0 2]`\n`[−1 0 1]`\n\n- Pe o zonă **netedă** (toți pixelii 0,9): coloana din stânga dă −(0,9 + 1,8 + 0,9) = −3,6, iar cea din dreapta dă +3,6. Total: **0**. Nicio margine!\n- Pe o **margine**, cu întuneric în stânga (0,1) și lumină în dreapta (0,9): −0,4 + 3,6 = **3,2**. O margine puternică!\n\nSchimbă semnele și găsești margini invers. Întoarce filtrul pe o parte și găsești margini orizontale.',
      },
      visual: (g, t, W, H, T) => {
        const flat = Math.floor(t / 4) % 2 === 0;
        const patch = flat ? [[0.9, 0.9, 0.9], [0.9, 0.9, 0.9], [0.9, 0.9, 0.9]] : [[0.1, 0.5, 0.9], [0.1, 0.5, 0.9], [0.1, 0.5, 0.9]];
        const cell = 64;
        const draw3 = (x0, y0, m, colorFn, fmt) => m.forEach((row, j) => row.forEach((v, i) => {
          g.fillStyle = colorFn(v);
          g.fillRect(x0 + i * cell, y0 + j * cell, cell - 3, cell - 3);
          text(g, fmt(v), x0 + i * cell + cell / 2 - 1, y0 + j * cell + cell / 2 - 1, { size: 20, color: v > 0.6 && colorFn === gray ? C.ink : colorFn === gray ? '#fff' : C.ink });
        }));
        const gray = (v) => `rgb(${Math.round(v * 255)},${Math.round(v * 255)},${Math.round(v * 255)})`;
        draw3(30, 120, patch, gray, (v) => v.toFixed(1));
        text(g, '×', 250, 216, { size: 40 });
        draw3(290, 120, KX, (v) => (v > 0 ? '#d7f6ff' : v < 0 ? '#ffe7d6' : '#fff'), (v) => String(v));
        let s = 0;
        patch.forEach((row, j) => row.forEach((v, i) => (s += v * KX[j][i])));
        text(g, '= ' + s.toFixed(1), 540, 216, { size: 34, color: Math.abs(s) > 1 ? C.accent : C.ink2 });
        text(g, flat ? T({ en: 'Flat area → 0', ro: 'Zonă netedă → 0' }) : T({ en: 'Edge → big number!', ro: 'Margine → număr mare!' }), W / 2, 70, { size: 24, color: flat ? C.ink2 : C.accent });
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'Vision is tricky', ro: 'Vederea e înșelătoare' },
      text: {
        en: 'The same object can look very different: lit from the side, seen from above, half hidden behind a chair.\n\nVision AIs can also be fooled in strange ways. Researchers found **adversarial examples**: tiny changes to an image, invisible to people, that make an AI give a completely wrong answer, like calling a panda a gibbon!\n\nThat is why vision AIs must be tested carefully on many kinds of images, especially when safety matters, like in self-driving cars.',
        ro: 'Același obiect poate arăta foarte diferit: luminat dintr-o parte, văzut de sus, pe jumătate ascuns după un scaun.\n\nIA de vedere pot fi păcălite și în moduri ciudate. Cercetătorii au găsit **exemple adversariale**: schimbări minuscule într-o imagine, invizibile pentru oameni, care fac o IA să dea un răspuns complet greșit, de exemplu să creadă că un panda e un gibon!\n\nDe aceea IA de vedere trebuie testate cu grijă pe multe feluri de imagini, mai ales când e vorba de siguranță, ca la mașinile autonome.',
      },
      visual: (g, t, W, H, T) => {
        emoji(g, '🐼', 110, 190, 110);
        text(g, '+', 225, 190, { size: 44 });
        for (let i = 0; i < 400; i++) {
          const x = 260 + ((i * 37) % 20) * 6;
          const y = 130 + Math.floor(i / 20) * 6;
          const v = (Math.sin(i * 12.9898 + Math.floor(t * 4)) * 43758.5453) % 1;
          g.fillStyle = v > 0 ? 'rgba(242,70,75,0.5)' : 'rgba(42,157,244,0.5)';
          g.fillRect(x, y, 5, 5);
        }
        text(g, '× 0.007', 320, 270, { size: 16, color: C.ink2 });
        text(g, '=', 410, 190, { size: 44 });
        emoji(g, '🐼', 510, 190, 110);
        box(g, 30, 310, 170, 60, { fill: '#e4f8ef', r: 14 });
        text(g, T({ en: '"panda" 58%', ro: '„panda” 58%' }), 115, 340, { size: 19 });
        box(g, 420, 310, 180, 60, { fill: '#ffe9e6', r: 14 });
        text(g, T({ en: '"gibbon" 99%', ro: '„gibon” 99%' }), 510, 340, { size: 19, color: C.rose });
        text(g, T({ en: 'Looks the same to you. Not to the AI!', ro: 'Pentru tine arată la fel. Pentru IA, nu!' }), W / 2, 420, { size: 20 });
      },
    },
  ],
  experiments: [
    { id: 'teachShapes', req: 1 },
    { id: 'filterLab', min: 2, req: 2 },
  ],
  quiz: [
    { level: 1, q: { en: 'What is computer vision?', ro: 'Ce este vederea artificială?' }, a: [{ en: 'AI that understands pictures and videos', ro: 'IA care înțelege poze și filmulețe' }, { en: 'Glasses for computers', ro: 'Ochelari pentru calculatoare' }, { en: 'A TV channel', ro: 'Un canal TV' }, { en: 'A very bright screen', ro: 'Un ecran foarte luminos' }], c: 0, why: { en: 'Computer vision is the part of AI that makes sense of images.', ro: 'Vederea artificială e partea din IA care înțelege imaginile.' } },
    { level: 1, q: { en: 'What does a camera turn light into for a computer?', ro: 'În ce transformă o cameră lumina, pentru un calculator?' }, a: [{ en: 'Pixels, which are numbers', ro: 'Pixeli, adică numere' }, { en: 'Sounds', ro: 'Sunete' }, { en: 'Smells', ro: 'Mirosuri' }, { en: 'Paper photos', ro: 'Fotografii pe hârtie' }], c: 0, why: { en: 'Each pixel stores numbers for its brightness or color.', ro: 'Fiecare pixel păstrează numere pentru luminozitate sau culoare.' } },
    { level: 1, q: { en: 'What does a vision AI look for first?', ro: 'Ce caută o IA de vedere mai întâi?' }, a: [{ en: 'Small clues like edges and colors', ro: 'Indicii mici, ca marginile și culorile' }, { en: "The photo's file name", ro: 'Numele fișierului pozei' }, { en: 'The weather', ro: 'Vremea' }, { en: 'The file size', ro: 'Mărimea fișierului' }], c: 0, why: { en: 'It starts with simple clues and combines them into bigger ones.', ro: 'Începe cu indicii simple și le combină în unele mai mari.' } },
    { level: 1, tf: true, q: { en: 'True or false: if an AI only saw orange cats in training, it might have trouble with black cats.', ro: 'Adevărat sau fals: dacă o IA a văzut doar pisici portocalii la antrenare, s-ar putea să aibă probleme cu pisicile negre.' }, c: true, why: { en: 'True. An AI learns from what it is shown, so variety in the data matters.', ro: 'Adevărat. O IA învață din ce i se arată, deci varietatea datelor contează.' } },
    { level: 1, q: { en: 'Which is a use of computer vision?', ro: 'Care este o utilizare a vederii artificiale?' }, a: [{ en: 'Helping a self-driving car see the road', ro: 'Ajută o mașină autonomă să vadă drumul' }, { en: 'Playing music', ro: 'Cântă muzică' }, { en: 'Cooking pasta', ro: 'Gătește paste' }, { en: 'Charging a battery', ro: 'Încarcă o baterie' }], c: 0, why: { en: 'Self-driving cars use vision AI to find lanes, signs and people.', ro: 'Mașinile autonome folosesc IA de vedere ca să găsească benzi, semne și oameni.' } },
    { level: 1, q: { en: 'A vision AI finds pointy ears, whiskers and round eyes. What will it probably decide?', ro: 'O IA de vedere găsește urechi ascuțite, mustăți și ochi rotunzi. Ce va decide probabil?' }, a: [{ en: 'It\'s a cat', ro: 'E o pisică' }, { en: 'It\'s a car', ro: 'E o mașină' }, { en: 'It\'s a banana', ro: 'E o banană' }, { en: 'It\'s a house', ro: 'E o casă' }], c: 0, why: { en: 'It combines small clues into parts, and the parts into an answer: probably a cat!', ro: 'Combină indicii mici în părți, apoi părțile într-un răspuns: probabil o pisică!' } },
    { level: 1, q: { en: 'What makes a good set of training pictures for a vision AI?', ro: 'Ce face un set bun de poze de antrenare pentru o IA de vedere?' }, a: [{ en: 'Lots of variety: different colors, sizes, angles and lighting', ro: 'Multă varietate: culori, mărimi, unghiuri și lumini diferite' }, { en: 'The same photo copied many times', ro: 'Aceeași poză copiată de multe ori' }, { en: 'Only very dark photos', ro: 'Doar poze foarte întunecate' }, { en: 'Photos with no labels at all', ro: 'Poze fără nicio etichetă' }], c: 0, why: { en: 'An AI learns from what it is shown, so variety helps it recognize things it has never seen before.', ro: 'O IA învață din ce i se arată, deci varietatea o ajută să recunoască lucruri pe care nu le-a mai văzut.' } },
    { level: 2, q: { en: 'What is a filter (kernel) in image AI?', ro: 'Ce este un filtru (nucleu) în IA pentru imagini?' }, a: [{ en: 'A small grid of numbers that slides over the image to find features', ro: 'O grilă mică de numere care alunecă peste imagine ca să găsească trăsături' }, { en: 'A coffee filter', ro: 'Un filtru de cafea' }, { en: 'A funny photo sticker', ro: 'Un abțibild amuzant pentru poze' }, { en: 'A camera lens', ro: 'O lentilă de cameră' }], c: 0, why: { en: 'Filters multiply and add pixel values to detect things like edges.', ro: 'Filtrele înmulțesc și adună valorile pixelilor ca să detecteze lucruri precum marginile.' } },
    { level: 2, q: { en: 'What does "CNN" stand for in AI?', ro: 'Ce înseamnă „CNN” în IA?' }, a: [{ en: 'Convolutional Neural Network', ro: 'Rețea neuronală convoluțională' }, { en: 'Cable News Network', ro: 'Cable News Network' }, { en: 'Computer Number Name', ro: 'Nume de număr de calculator' }, { en: 'Cat Nose Network', ro: 'Rețeaua nasului de pisică' }], c: 0, why: { en: 'A CNN is a neural network built from layers of filters (convolutions).', ro: 'O CNN este o rețea neuronală construită din straturi de filtre (convoluții).' } },
    { level: 2, tf: true, q: { en: 'True or false: a CNN learns the numbers in its filters during training.', ro: 'Adevărat sau fals: o CNN învață numerele din filtrele ei în timpul antrenării.' }, c: true, why: { en: 'True. The filter numbers are weights, tuned by gradient descent.', ro: 'Adevărat. Numerele din filtre sunt ponderi, reglate prin coborâre pe gradient.' } },
    { level: 3, q: { en: 'A vertical-edge filter on a completely flat gray area gives...', ro: 'Un filtru pentru margini verticale, pe o zonă gri complet netedă, dă...' }, a: [{ en: 'About 0', ro: 'Aproximativ 0' }, { en: 'A huge number', ro: 'Un număr uriaș' }, { en: 'The word "edge"', ro: 'Cuvântul „margine”' }, { en: 'An error', ro: 'O eroare' }], c: 0, why: { en: 'The negative and positive columns cancel out when all pixels are equal.', ro: 'Coloanele negative și pozitive se anulează când toți pixelii sunt egali.' } },
    { level: 3, q: { en: 'What is an adversarial example?', ro: 'Ce este un exemplu adversarial?' }, a: [{ en: 'A slightly changed image that fools an AI, though people see no difference', ro: 'O imagine puțin schimbată care păcălește o IA, deși oamenii nu văd nicio diferență' }, { en: 'A very easy example', ro: 'Un exemplu foarte ușor' }, { en: 'A photo of an enemy', ro: 'Poza unui dușman' }, { en: 'A broken camera', ro: 'O cameră stricată' }], c: 0, why: { en: 'Tiny, carefully chosen changes can flip an AI\'s answer. That is why testing matters.', ro: 'Schimbări mici, alese cu grijă, pot schimba răspunsul unei IA. De aceea testarea contează.' } },
    { level: 3, q: { en: 'What does pooling do in a CNN?', ro: 'Ce face gruparea (pooling) într-o CNN?' }, a: [{ en: 'Shrinks the feature maps while keeping the important information', ro: 'Micșorează hărțile de trăsături păstrând informația importantă' }, { en: 'Fills them with water', ro: 'Le umple cu apă' }, { en: 'Adds color', ro: 'Adaugă culoare' }, { en: 'Makes them bigger', ro: 'Le face mai mari' }], c: 0, why: { en: 'Max pooling keeps the strongest signal in each small square, making maps smaller.', ro: 'Gruparea după maxim păstrează cel mai puternic semnal din fiecare pătrat mic și micșorează hărțile.' } },
  ],
};

void emoji;
