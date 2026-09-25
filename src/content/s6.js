import { C, emoji, text, box, ease, plotFrame, dot, line, arrow } from '../ui/draw.js';

function neuronDiagram(g, W, H, T, { inputs, weights, bias, t, showSum = true, showOut = true }) {
  const nx = W / 2 + 40;
  const ny = H / 2;
  let sum = bias;
  inputs.forEach((inp, i) => {
    const y = 90 + i * ((H - 180) / Math.max(1, inputs.length - 1));
    const x = 90;
    const w = weights[i];
    sum += w * inp.v;
    const col = w >= 0 ? C.mint : C.rose;
    const pulse = (t * 0.8 + i * 0.2) % 1;
    line(g, x + 30, y, nx - 60, ny, col, 2 + Math.abs(w) * 2.5);
    if (inp.v) dot(g, x + 30 + (nx - 90 - x) * pulse, y + (ny - y) * pulse, 7, '#fff', col, 3);
    dot(g, x, y, 34, inp.v ? '#fff4d6' : '#eef1f8');
    emoji(g, inp.e, x, y - 2, 34);
    text(g, String(inp.v), x - 50, y, { size: 22, color: C.ink2 });
    box(g, (x + nx) / 2 - 36, (y + ny) / 2 - 30, 72, 30, { fill: '#fff', r: 9, lw: 2, shadow: false });
    text(g, '× ' + w, (x + nx) / 2, (y + ny) / 2 - 15, { size: 16, color: col });
  });
  const fire = sum > 0;
  dot(g, nx, ny, 60, fire ? '#ffe36b' : '#e4e9f7');
  if (showSum) {
    text(g, 'Σ', nx, ny - 18, { size: 30 });
    text(g, (sum >= 0 ? '' : '') + sum.toFixed(1), nx, ny + 20, { size: 22, color: fire ? C.ink : C.ink2 });
  }
  if (showOut) {
    arrow(g, nx + 62, ny, W - 110, ny, { width: 5 });
    emoji(g, fire ? '🌳' : '🏠', W - 70, ny - 8, 56);
    text(g, fire ? T({ en: 'YES', ro: 'DA' }) : T({ en: 'NO', ro: 'NU' }), W - 70, ny + 44, { size: 22, color: fire ? C.mint : C.rose });
  }
  text(g, T({ en: 'bias ', ro: 'bias ' }) + bias, nx, ny + 88, { size: 17, color: C.grape });
}

// Station 6: The Artificial Neuron
export default {
  id: 's6',
  intro: [
    { who: 'ada', text: { en: 'Station 6: the neuron, the tiny building block of every neural network. Have you seen the giant neuron sculpture here?', ro: 'Stația 6: neuronul, cărămida minusculă din care e făcută orice rețea neuronală. Ai văzut sculptura de neuron uriaș de aici?' } },
    { who: 'bip', text: { en: 'I have neurons? Made of math? That is the coolest thing about me!', ro: 'Eu am neuroni? Făcuți din matematică? E cel mai tare lucru despre mine!' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'Brain cells', ro: 'Celulele creierului' },
      text: {
        en: 'Your brain has about **86 billion** nerve cells called **neurons**.\n\nEach neuron receives tiny electrical signals from other neurons through branches called **dendrites**. If it receives enough signal, it **fires**: it sends its own signal along a long wire called the **axon** to the next neurons.\n\nScientists built **artificial neurons**, made of math, inspired by this idea.',
        ro: 'Creierul tău are aproximativ **86 de miliarde** de celule nervoase numite **neuroni**.\n\nFiecare neuron primește semnale electrice minuscule de la alți neuroni prin ramuri numite **dendrite**. Dacă primește destul semnal, **se aprinde**: trimite propriul semnal de-a lungul unui fir lung numit **axon**, spre neuronii următori.\n\nOamenii de știință au construit **neuroni artificiali**, făcuți din matematică, inspirați de această idee.',
      },
      visual: (g, t, W, H, T) => {
        const cx = W / 2 - 60;
        const cy = H / 2;
        const branches = [[-230, -150], [-250, -20], [-220, 120], [-120, -190], [-110, 180]];
        const cyc = t % 3;
        branches.forEach(([dx, dy], i) => {
          line(g, cx + dx, cy + dy, cx, cy, '#9f86ff', 8);
          const k = Math.min(1, Math.max(0, (cyc - i * 0.12) / 1.1));
          if (k > 0 && k < 1) dot(g, cx + dx * (1 - k), cy + dy * (1 - k), 9, '#5ff3ff', null);
        });
        const fire = cyc > 1.5 && cyc < 1.9;
        dot(g, cx, cy, 58, fire ? '#ffe36b' : '#b39dff');
        dot(g, cx + 12, cy - 6, 22, '#7b5cff', null);
        line(g, cx + 55, cy, W - 50, cy + 20, '#ffc93c', 12);
        const k = Math.min(1, Math.max(0, (cyc - 1.6) / 1.2));
        if (cyc > 1.6) dot(g, cx + 55 + (W - 105 - cx) * k, cy + 20 * k, 12, '#fff', C.ink, 2);
        text(g, T({ en: 'dendrites', ro: 'dendrite' }), cx - 200, cy - 190, { size: 18, color: C.grape });
        text(g, T({ en: 'cell body', ro: 'corpul celulei' }), cx, cy + 85, { size: 18, color: C.grape });
        text(g, T({ en: 'axon', ro: 'axon' }), W - 130, cy + 60, { size: 18, color: '#b88a00' });
        if (fire) text(g, '⚡ ' + T({ en: 'FIRE!', ro: 'SE APRINDE!' }), cx, cy - 90, { size: 24, color: C.accent });
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'A neuron made of math', ro: 'Un neuron făcut din matematică' },
      text: {
        en: 'An **artificial neuron** works in three steps:\n\n- It gets some **inputs** (numbers).\n- It multiplies each input by a **weight** and adds everything up.\n- If the total is big enough, it says **YES** (1). Otherwise it says **NO** (0).\n\nThat\'s it! Simple on its own, but connect millions of them and you get a powerful AI.',
        ro: 'Un **neuron artificial** lucrează în trei pași:\n\n- Primește niște **intrări** (numere).\n- Înmulțește fiecare intrare cu o **pondere** și adună totul.\n- Dacă totalul e destul de mare, spune **DA** (1). Altfel spune **NU** (0).\n\nAsta e tot! Simplu singur, dar dacă legi milioane de neuroni obții o IA puternică.',
      },
      visual: (g, t, W, H, T) => {
        const v = [1, Math.floor(t / 2) % 2, 1];
        neuronDiagram(g, W, H, T, {
          inputs: [{ e: '☀️', v: v[0] }, { e: '📚', v: v[1] }, { e: '🧑‍🤝‍🧑', v: v[2] }],
          weights: [2, 2, 1],
          bias: -3,
          t,
        });
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'Weights mean importance', ro: 'Ponderile înseamnă importanță' },
      text: {
        en: 'Should Bip go to the park? The neuron looks at three inputs:\n\n- ☀️ Is it sunny? (weight **2**: very important)\n- 📚 Is the homework done? (weight **2**: very important)\n- 🧑‍🤝‍🧑 Is a friend free? (weight **1**: nice, but less important)\n\nA **big weight** means the input matters a lot. A **negative weight** pushes toward NO. For example, "it is raining" could have weight **−3**.',
        ro: 'Ar trebui Bip să meargă în parc? Neuronul se uită la trei intrări:\n\n- ☀️ E soare? (pondere **2**: foarte important)\n- 📚 Sunt temele gata? (pondere **2**: foarte important)\n- 🧑‍🤝‍🧑 E liber un prieten? (pondere **1**: plăcut, dar mai puțin important)\n\nO **pondere mare** înseamnă că intrarea contează mult. O **pondere negativă** împinge spre NU. De exemplu, „plouă” ar putea avea ponderea **−3**.',
      },
      bip: { en: 'My weights: batteries charged = 5, cake nearby = 100. Beep!', ro: 'Ponderile mele: baterii încărcate = 5, tort prin preajmă = 100. Bip!' },
      visual: (g, t, W, H, T) => {
        const rain = Math.floor(t / 3) % 2;
        neuronDiagram(g, W, H, T, {
          inputs: [{ e: '☀️', v: 1 }, { e: '📚', v: 1 }, { e: '🌧️', v: rain }],
          weights: [2, 2, -3],
          bias: -3,
          t,
        });
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'The bias: how easy is it to say yes?', ro: 'Bias-ul: cât de ușor spune da?' },
      text: {
        en: 'The **bias** is an extra number added to the total, no matter what the inputs are.\n\n- A very **negative** bias makes the neuron hard to convince. It needs lots of strong inputs before it fires.\n- A **positive** bias makes it say YES easily, even with weak inputs.\n\nWeights and bias together are the neuron\'s **parameters**: the knobs that training adjusts.',
        ro: '**Bias-ul** (în română i se mai spune *deplasare*) este un număr în plus adăugat la total, indiferent de intrări.\n\n- Un bias foarte **negativ** face neuronul greu de convins. Are nevoie de multe intrări puternice ca să se aprindă.\n- Un bias **pozitiv** îl face să spună DA ușor, chiar și cu intrări slabe.\n\nPonderile și bias-ul împreună sunt **parametrii** neuronului: butoanele pe care le reglează antrenarea.',
      },
      visual: (g, t, W, H, T) => {
        const b = Math.round(Math.sin(t * 0.7) * 4);
        neuronDiagram(g, W, H, T, {
          inputs: [{ e: '☀️', v: 1 }, { e: '📚', v: 0 }, { e: '🧑‍🤝‍🧑', v: 1 }],
          weights: [2, 2, 1],
          bias: b,
          t,
        });
        text(g, b < -2 ? T({ en: '😤 hard to convince', ro: '😤 greu de convins' }) : b > 0 ? T({ en: '😃 says yes easily', ro: '😃 spune da ușor' }) : T({ en: '🙂 in between', ro: '🙂 la mijloc' }), W / 2, 30, { size: 20, color: C.grape });
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'How a neuron learns', ro: 'Cum învață un neuron' },
      text: {
        en: 'In 1958, Frank Rosenblatt built the **perceptron**, a neuron that learns from examples.\n\nThe rule is simple:\n\n- Show it an example.\n- If its answer is right, change nothing.\n- If it is wrong, **nudge the weights** toward the right answer.\n- Repeat with the next example.\n\nOn a chart, a neuron draws a **straight line**. Learning moves that line until it separates the two groups.',
        ro: 'În 1958, Frank Rosenblatt a construit **perceptronul**, un neuron care învață din exemple.\n\nRegula e simplă:\n\n- Îi arăți un exemplu.\n- Dacă răspunsul e corect, nu schimbi nimic.\n- Dacă e greșit, **împingi puțin ponderile** spre răspunsul corect.\n- Repeți cu următorul exemplu.\n\nPe un grafic, un neuron desenează o **linie dreaptă**. Învățarea mută linia până când desparte cele două grupuri.',
      },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 30, y: 30, w: W - 60, h: H - 60, xmin: -1, xmax: 1, ymin: -1, ymax: 1, grid: false });
        const pts = [[-0.6, 0.5, 1], [-0.3, 0.7, 1], [-0.7, 0.1, 1], [-0.2, 0.3, 1], [0.5, -0.4, 0], [0.2, -0.7, 0], [0.7, -0.1, 0], [0.4, 0.1, 0]];
        const k = ease((t % 6) / 4);
        const a0 = 0.3;
        const a1 = -0.8;
        const ang = a0 + (a1 - a0) * k;
        const nx = Math.cos(ang);
        const ny = Math.sin(ang);
        const L = 2;
        line(g, f.X(-ny * L), f.Y(nx * L), f.X(ny * L), f.Y(-nx * L), C.accent, 5);
        pts.forEach(([x, y, c]) => dot(g, f.X(x), f.Y(y), 12, c ? C.blue : C.red));
        text(g, T({ en: 'The neuron\'s line moves as it learns', ro: 'Linia neuronului se mută pe măsură ce învață' }), W / 2, 22, { size: 18, color: C.ink2 });
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'Activation functions', ro: 'Funcții de activare' },
      text: {
        en: 'The hard YES/NO jump is called a **step function**. Modern neurons usually use smoother **activation functions**:\n\n- **Sigmoid** squishes any number into a value between 0 and 1, which works like a probability ("I am 90% sure").\n- **ReLU** turns negative numbers into 0 and keeps positive numbers as they are. It is simple and fast, and it is the most popular choice today.\n\nSmooth functions have a slope everywhere, and gradient descent needs slopes to learn.',
        ro: 'Saltul brusc DA/NU se numește **funcție treaptă**. Neuronii moderni folosesc de obicei **funcții de activare** mai netede:\n\n- **Sigmoida** strânge orice număr într-o valoare între 0 și 1, care funcționează ca o probabilitate („sunt 90% sigur”).\n- **ReLU** transformă numerele negative în 0 și le păstrează pe cele pozitive așa cum sunt. E simplă și rapidă, și e cea mai populară alegere azi.\n\nFuncțiile netede au pantă peste tot, iar coborârea pe gradient are nevoie de pante ca să învețe.',
      },
      visual: (g, t, W, H, T) => {
        const fns = [
          ['step', (x) => (x > 0 ? 1 : 0), C.ink],
          ['sigmoid', (x) => 1 / (1 + Math.exp(-x)), C.mint],
          ['ReLU', (x) => Math.max(0, x) / 4, C.accent],
        ];
        const w = (W - 40) / 3;
        fns.forEach(([name, fn, col], i) => {
          const f = plotFrame(g, { x: 20 + i * w + 10, y: 80, w: w - 30, h: H - 170, xmin: -4, xmax: 4, ymin: -0.1, ymax: 1.1, ticks: 4 });
          g.strokeStyle = col;
          g.lineWidth = 5;
          g.beginPath();
          for (let k = 0; k <= 80; k++) {
            const x = -4 + (8 * k) / 80;
            k ? g.lineTo(f.X(x), f.Y(fn(x))) : g.moveTo(f.X(x), f.Y(fn(x)));
          }
          g.stroke();
          const x = Math.sin(t + i) * 3.5;
          dot(g, f.X(x), f.Y(fn(x)), 8, col);
          text(g, name, 20 + i * w + w / 2, 50, { size: 22, color: col });
        });
        void T;
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'The neuron formula', ro: 'Formula neuronului' },
      text: {
        en: 'All of it fits in one line:\n\n`output = f(w₁·x₁ + w₂·x₂ + w₃·x₃ + b)`\n\nwhere x are the inputs, w are the weights, b is the bias and f is the activation function.\n\nExample: sunny = 1 (w = 2), homework = 1 (w = 2), friend = 0 (w = 1), b = −3:\n\n2·1 + 2·1 + 1·0 − 3 = **1**, which is more than 0, so the step function says **YES**!',
        ro: 'Totul încape într-un singur rând:\n\n`ieșire = f(w₁·x₁ + w₂·x₂ + w₃·x₃ + b)`\n\nunde x sunt intrările, w sunt ponderile, b este bias-ul, iar f este funcția de activare.\n\nExemplu: soare = 1 (w = 2), teme = 1 (w = 2), prieten = 0 (w = 1), b = −3:\n\n2·1 + 2·1 + 1·0 − 3 = **1**, adică mai mult decât 0, deci funcția treaptă spune **DA**!',
      },
      visual: (g, t, W, H, T) => {
        const parts = ['2·1', '+', '2·1', '+', '1·0', '−', '3', '=', '1'];
        const cols = [C.mint, C.ink, C.mint, C.ink, C.mint, C.ink, C.grape, C.ink, C.accent];
        const shown = Math.floor((t % 8) * 2);
        parts.forEach((p, i) => {
          if (i >= shown) return;
          text(g, p, 70 + i * 62, H / 2 - 30, { size: 34, color: cols[i] });
        });
        emoji(g, '☀️', 70, H / 2 - 100, 34);
        emoji(g, '📚', 70 + 2 * 62, H / 2 - 100, 34);
        emoji(g, '🧑‍🤝‍🧑', 70 + 4 * 62, H / 2 - 100, 34);
        text(g, 'bias', 70 + 6 * 62, H / 2 - 100, { size: 20, color: C.grape });
        if (shown >= 9) {
          box(g, W / 2 - 170, H / 2 + 40, 340, 70, { fill: '#e4f8ef', r: 18 });
          text(g, T({ en: '1 > 0 → YES, go to the park! 🌳', ro: '1 > 0 → DA, mergi în parc! 🌳' }), W / 2, H / 2 + 75, { size: 22 });
        }
      },
    },
    {
      id: 'p8',
      level: 3,
      title: { en: "One neuron's limit", ro: 'Limita unui singur neuron' },
      text: {
        en: 'A single neuron can only separate things with **one straight line**.\n\nSome problems need more. **XOR** means "one or the other, but not both". Put the four cases on a chart: the two YES points sit on opposite corners, and so do the two NO points. **No single straight line** can separate them!\n\nIn 1969, Marvin Minsky and Seymour Papert pointed out this limit. The solution: connect neurons in **layers**. That is the next station!',
        ro: 'Un singur neuron poate despărți lucrurile doar cu **o linie dreaptă**.\n\nUnele probleme cer mai mult. **XOR** înseamnă „ori una, ori cealaltă, dar nu amândouă”. Pune cele patru cazuri pe un grafic: cele două puncte DA stau în colțuri opuse, la fel și cele două puncte NU. **Nicio linie dreaptă** nu le poate despărți!\n\nÎn 1969, Marvin Minsky și Seymour Papert au arătat această limită. Soluția: legăm neuronii în **straturi**. Asta e următoarea stație!',
      },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 110, y: 40, w: W - 220, h: H - 110, xmin: -0.3, xmax: 1.3, ymin: -0.3, ymax: 1.3, grid: false });
        const ang = t * 0.6;
        const cx = 0.5 + Math.cos(t * 0.4) * 0.15;
        const cy = 0.5 + Math.sin(t * 0.5) * 0.15;
        line(g, f.X(cx - Math.cos(ang) * 2), f.Y(cy - Math.sin(ang) * 2), f.X(cx + Math.cos(ang) * 2), f.Y(cy + Math.sin(ang) * 2), C.accent, 4, [10, 8]);
        [[0, 0, 0], [1, 1, 0], [0, 1, 1], [1, 0, 1]].forEach(([x, y, c]) => {
          dot(g, f.X(x), f.Y(y), 20, c ? C.mint : C.rose);
          text(g, c ? T({ en: 'YES', ro: 'DA' }) : T({ en: 'NO', ro: 'NU' }), f.X(x), f.Y(y) + 36, { size: 16, color: c ? C.mint : C.rose });
        });
        text(g, T({ en: 'No straight line works! 😵', ro: 'Nicio linie dreaptă nu merge! 😵' }), W / 2, 24, { size: 20 });
      },
    },
  ],
  experiments: [
    { id: 'neuronLab', req: 1 },
    { id: 'perceptronTrainer', min: 2, req: 2 },
  ],
  quiz: [
    { level: 1, q: { en: 'What does an artificial neuron do with its inputs?', ro: 'Ce face un neuron artificial cu intrările lui?' }, a: [{ en: 'Multiplies them by weights, adds them up and decides an output', ro: 'Le înmulțește cu ponderi, le adună și decide o ieșire' }, { en: 'Eats them', ro: 'Le mănâncă' }, { en: 'Throws them away', ro: 'Le aruncă' }, { en: 'Paints them', ro: 'Le pictează' }], c: 0, why: { en: 'Weighted sum, then a decision: that is an artificial neuron.', ro: 'Suma ponderată, apoi o decizie: acesta este un neuron artificial.' } },
    { level: 1, q: { en: 'A big weight on an input means...', ro: 'O pondere mare pe o intrare înseamnă...' }, a: [{ en: 'That input is very important', ro: 'Că intrarea e foarte importantă' }, { en: 'That input is heavy', ro: 'Că intrarea e grea' }, { en: 'That input is ignored', ro: 'Că intrarea e ignorată' }, { en: 'The neuron is broken', ro: 'Că neuronul e stricat' }], c: 0, why: { en: 'Weights say how much each input matters.', ro: 'Ponderile spun cât contează fiecare intrare.' } },
    { level: 1, tf: true, q: { en: 'True or false: artificial neurons were inspired by brain cells.', ro: 'Adevărat sau fals: neuronii artificiali au fost inspirați de celulele creierului.' }, c: true, why: { en: 'True, although artificial neurons are much simpler than real ones.', ro: 'Adevărat, deși neuronii artificiali sunt mult mai simpli decât cei reali.' } },
    { level: 1, e: '🧠', q: { en: 'About how many neurons does a human brain have?', ro: 'Aproximativ câți neuroni are un creier omenesc?' }, a: [{ en: 'About 86 billion', ro: 'Aproximativ 86 de miliarde' }, { en: 'About 10', ro: 'Aproximativ 10' }, { en: 'About 1,000', ro: 'Aproximativ 1.000' }, { en: 'Exactly one million', ro: 'Exact un milion' }], c: 0, why: { en: 'Scientists estimate about 86 billion neurons in a human brain.', ro: 'Oamenii de știință estimează aproximativ 86 de miliarde de neuroni într-un creier omenesc.' } },
    { level: 1, e: '🌧️', q: { en: 'If "it is raining" has a negative weight, rain makes the neuron...', ro: 'Dacă „plouă” are o pondere negativă, ploaia face neuronul...' }, a: [{ en: 'More likely to say NO', ro: 'Să spună mai probabil NU' }, { en: 'More likely to say YES', ro: 'Să spună mai probabil DA' }, { en: 'Explode', ro: 'Să explodeze' }, { en: 'Sing a song', ro: 'Să cânte' }], c: 0, why: { en: 'Negative weights lower the total, pushing toward NO.', ro: 'Ponderile negative scad totalul și împing spre NU.' } },
    { level: 2, q: { en: 'What does the bias do?', ro: 'Ce face bias-ul?' }, a: [{ en: 'Makes the neuron easier or harder to fire', ro: 'Face neuronul mai ușor sau mai greu de aprins' }, { en: 'Changes its color', ro: 'Îi schimbă culoarea' }, { en: 'Deletes the weights', ro: 'Șterge ponderile' }, { en: 'Counts the inputs', ro: 'Numără intrările' }], c: 0, why: { en: 'The bias shifts the total up or down, like setting how easy it is to say yes.', ro: 'Bias-ul mută totalul în sus sau în jos, ca și cum ai stabili cât de ușor spune da.' } },
    { level: 2, q: { en: 'How does a perceptron learn?', ro: 'Cum învață un perceptron?' }, a: [{ en: 'When it is wrong, it nudges its weights toward the right answer', ro: 'Când greșește, își împinge ponderile spre răspunsul corect' }, { en: 'It reads a book', ro: 'Citește o carte' }, { en: 'It asks another robot', ro: 'Întreabă alt robot' }, { en: 'It never changes', ro: 'Nu se schimbă niciodată' }], c: 0, why: { en: 'Mistakes trigger small weight changes; correct answers change nothing.', ro: 'Greșelile duc la mici schimbări ale ponderilor; răspunsurile corecte nu schimbă nimic.' } },
    { level: 2, tf: true, q: { en: 'True or false: a single neuron separates two groups using a straight line.', ro: 'Adevărat sau fals: un singur neuron desparte două grupuri folosind o linie dreaptă.' }, c: true, why: { en: 'True. Its decision boundary is a straight line (or a flat plane in more dimensions).', ro: 'Adevărat. Frontiera lui de decizie e o linie dreaptă (sau un plan, în mai multe dimensiuni).' } },
    { level: 3, q: { en: 'Inputs 1 and 1, weights 2 and 2, bias −3. What is the total?', ro: 'Intrări 1 și 1, ponderi 2 și 2, bias −3. Care e totalul?' }, a: [{ en: '1', ro: '1' }, { en: '4', ro: '4' }, { en: '−3', ro: '−3' }, { en: '7', ro: '7' }], c: 0, why: { en: '2·1 + 2·1 − 3 = 1.', ro: '2·1 + 2·1 − 3 = 1.' } },
    { level: 3, q: { en: 'What does the sigmoid function do?', ro: 'Ce face funcția sigmoidă?' }, a: [{ en: 'Squishes any number into a value between 0 and 1', ro: 'Strânge orice număr într-o valoare între 0 și 1' }, { en: 'Doubles every number', ro: 'Dublează fiecare număr' }, { en: 'Makes every number negative', ro: 'Face orice număr negativ' }, { en: 'Counts neurons', ro: 'Numără neuronii' }], c: 0, why: { en: 'Sigmoid turns any total into a smooth value from 0 to 1, like a probability.', ro: 'Sigmoida transformă orice total într-o valoare netedă între 0 și 1, ca o probabilitate.' } },
    { level: 3, q: { en: "Why can't one neuron solve XOR?", ro: 'De ce nu poate un singur neuron să rezolve XOR?' }, a: [{ en: "XOR's groups can't be separated by one straight line", ro: 'Grupurile XOR nu pot fi despărțite de o singură linie dreaptă' }, { en: 'XOR is too big', ro: 'XOR e prea mare' }, { en: 'Neurons hate XOR', ro: 'Neuronii urăsc XOR' }, { en: 'XOR has no data', ro: 'XOR nu are date' }], c: 0, why: { en: 'The YES points are on opposite corners, so no line splits them. Layers are needed.', ro: 'Punctele DA sunt în colțuri opuse, deci nicio linie nu le desparte. E nevoie de straturi.' } },
    { level: 3, q: { en: 'What does ReLU do?', ro: 'Ce face ReLU?' }, a: [{ en: 'Turns negative numbers into 0 and keeps positive numbers', ro: 'Transformă numerele negative în 0 și le păstrează pe cele pozitive' }, { en: 'Turns everything into 1', ro: 'Transformă totul în 1' }, { en: 'Reverses the numbers', ro: 'Inversează numerele' }, { en: 'Adds 10 to everything', ro: 'Adaugă 10 la orice' }], c: 0, why: { en: 'ReLU(x) = max(0, x). Simple, fast, and very popular.', ro: 'ReLU(x) = max(0, x). Simplă, rapidă și foarte populară.' } },
  ],
};
