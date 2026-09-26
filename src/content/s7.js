import { C, emoji, text, box, ease, dot, line, arrow, rr } from '../ui/draw.js';

function netLayout(layers, W, H, x0 = 80, x1 = null, y0 = 60, y1 = null) {
  x1 = x1 ?? W - 80;
  y1 = y1 ?? H - 60;
  return layers.map((n, li) => {
    const x = x0 + ((x1 - x0) * li) / (layers.length - 1);
    return Array.from({ length: n }, (_, k) => ({ x, y: n === 1 ? (y0 + y1) / 2 : y0 + ((y1 - y0) * k) / (n - 1) }));
  });
}

function drawNet(g, nodes, t, { dir = 1, colors, speed = 1 } = {}) {
  for (let l = 0; l < nodes.length - 1; l++) {
    for (const a of nodes[l]) for (const b of nodes[l + 1]) line(g, a.x, a.y, b.x, b.y, 'rgba(59,66,102,0.25)', 1.5);
  }
  const L = nodes.length;
  const phase = (t * speed) % (L + 0.5);
  for (let l = 0; l < L - 1; l++) {
    const local = dir > 0 ? phase - l : phase - (L - 2 - l);
    if (local < 0 || local > 1) continue;
    const from = dir > 0 ? nodes[l] : nodes[l + 1];
    const to = dir > 0 ? nodes[l + 1] : nodes[l];
    for (const a of from) for (const b of to) dot(g, a.x + (b.x - a.x) * local, a.y + (b.y - a.y) * local, 4, dir > 0 ? '#5ff3ff' : '#ff8a1f', null);
  }
  nodes.forEach((layer, l) => {
    const on = dir > 0 ? Math.max(0, 1 - Math.abs(phase - l) * 1.4) : Math.max(0, 1 - Math.abs(phase - (L - 1 - l)) * 1.4);
    for (const n of layer) dot(g, n.x, n.y, 16, on > 0.2 ? '#ffe36b' : (colors && colors[l]) || '#e4e9f7');
  });
}

// Station 7: Neural Networks
export default {
  id: 's7',
  intro: [
    { who: 'ada', text: { en: 'Station 7! One neuron draws one straight line. Many neurons in layers can learn almost anything.', ro: 'Stația 7! Un neuron desenează o singură linie dreaptă. Mulți neuroni în straturi pot învăța aproape orice.' } },
    { who: 'bip', text: { en: 'Layers? Like a cake? I am definitely a layer cake of neurons.', ro: 'Straturi? Ca la tort? Sigur sunt un tort cu straturi de neuroni.' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'Teamwork of neurons', ro: 'Neuronii lucrează în echipă' },
      text: {
        en: 'One neuron is simple. Connect many of them and you get a **neural network**.\n\nThe neurons are arranged in **layers**:\n\n- the **input layer** receives the data (like pixels)\n- one or more **hidden layers** do the thinking in the middle\n- the **output layer** gives the answer\n\nEvery neuron in one layer sends its signal to the neurons in the next layer.',
        ro: 'Un neuron e simplu. Leagă mulți neuroni și obții o **rețea neuronală**.\n\nNeuronii sunt așezați în **straturi**:\n\n- **stratul de intrare** primește datele (de exemplu pixeli)\n- unul sau mai multe **straturi ascunse** fac „gânditul” din mijloc\n- **stratul de ieșire** dă răspunsul\n\nFiecare neuron dintr-un strat își trimite semnalul la neuronii din stratul următor.',
      },
      visual: (g, t, W, H, T) => {
        const nodes = netLayout([3, 5, 5, 2], W, H, 90, W - 90, 80, H - 70);
        drawNet(g, nodes, t, { colors: ['#d7f6ff', '#ecdfff', '#ecdfff', '#fff4d6'] });
        const labels = [{ en: 'input', ro: 'intrare' }, { en: 'hidden', ro: 'ascuns' }, { en: 'hidden', ro: 'ascuns' }, { en: 'output', ro: 'ieșire' }];
        labels.forEach((lab, i) => text(g, T(lab), nodes[i][0].x, 34, { size: 17, color: C.ink2 }));
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Signals flow forward', ro: 'Semnalele curg înainte' },
      text: {
        en: 'Let\'s say we show the network a picture of a handwritten **7**.\n\nThe pixels go into the input layer. Each hidden neuron computes its weighted sum and passes the result on. Layer by layer, the signal flows **forward** to the output.\n\nThe output layer has one neuron per possible answer (0, 1, 2 ... 9). The neuron that lights up the most is the network\'s answer: **"7!"**',
        ro: 'Să zicem că îi arătăm rețelei poza unui **7** scris de mână.\n\nPixelii intră în stratul de intrare. Fiecare neuron ascuns își calculează suma ponderată și dă mai departe rezultatul. Strat cu strat, semnalul curge **înainte** spre ieșire.\n\nStratul de ieșire are câte un neuron pentru fiecare răspuns posibil (0, 1, 2 ... 9). Neuronul care se aprinde cel mai tare e răspunsul rețelei: **„7!”**',
      },
      visual: (g, t, W, H, T) => {
        const seven = ['#####', '....#', '...#.', '..#..', '..#..'];
        const s = 16;
        seven.forEach((row, y) => row.split('').forEach((c, x) => {
          g.fillStyle = c === '#' ? '#1d2340' : '#f1f4fb';
          g.fillRect(30 + x * s, H / 2 - 40 + y * s, s - 1, s - 1);
        }));
        const nodes = netLayout([5, 6, 6, 4], W, H, 170, W - 120, 70, H - 70);
        drawNet(g, nodes, t, { colors: ['#d7f6ff', '#ecdfff', '#ecdfff', '#fff4d6'] });
        const outs = ['1', '4', '7', '9'];
        const lit = (t % 4.5) > 3.2;
        nodes[3].forEach((n, i) => {
          text(g, outs[i], n.x + 34, n.y, { size: 20, color: lit && i === 2 ? C.accent : C.ink2 });
          if (lit) {
            const p = i === 2 ? 0.92 : [0.03, 0.02, 0, 0.03][i];
            g.fillStyle = i === 2 ? C.accent : C.muted;
            g.fillRect(n.x + 50, n.y - 7, p * 50, 14);
          }
        });
        if (lit) text(g, T({ en: '"It\'s a 7!"', ro: '„E un 7!”' }), W - 90, 30, { size: 20, color: C.accent });
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'Deep learning', ro: 'Învățarea adâncă' },
      text: {
        en: '**"Deep"** learning just means the network has **many hidden layers**. Some have hundreds!\n\nDeep networks power many things you know:\n\n- recognizing faces and objects in photos\n- voice assistants that understand speech\n- translation apps\n- chatbots\n\nMore layers let the network build more complex ideas out of simpler ones.',
        ro: 'Învățarea **„adâncă”** (în engleză *deep learning*) înseamnă doar că rețeaua are **multe straturi ascunse**. Unele au sute!\n\nRețelele adânci stau în spatele multor lucruri pe care le știi:\n\n- recunoașterea fețelor și obiectelor din poze\n- asistenții vocali care înțeleg vorbirea\n- aplicațiile de traducere\n- chatboții\n\nMai multe straturi permit rețelei să construiască idei mai complexe din idei mai simple.',
      },
      visual: (g, t, W, H, T) => {
        const a = netLayout([3, 4, 2], W / 2, H, 50, W / 2 - 50, 100, H - 60);
        drawNet(g, a, t);
        const b = netLayout([3, 4, 4, 4, 4, 2], W / 2, H, W / 2 + 30, W - 30, 100, H - 60);
        drawNet(g, b, t * 1.2);
        text(g, T({ en: 'Shallow', ro: 'Puțin adâncă' }), W / 4, 50, { size: 22 });
        text(g, T({ en: 'Deep', ro: 'Adâncă' }), (3 * W) / 4, 50, { size: 22, color: C.grape });
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'Each layer learns something', ro: 'Fiecare strat învață ceva' },
      text: {
        en: 'In a network that recognizes pictures, scientists looked inside and found something amazing:\n\n- the **first layers** detect simple things: edges, lines and colors\n- the **middle layers** combine them into parts: eyes, ears, wheels, windows\n- the **last layers** recognize whole things: a face, a cat, a car\n\nNobody programmed this. The network discovered it by itself during training!',
        ro: 'Într-o rețea care recunoaște poze, oamenii de știință s-au uitat înăuntru și au găsit ceva uimitor:\n\n- **primele straturi** detectează lucruri simple: margini, linii și culori\n- **straturile din mijloc** le combină în părți: ochi, urechi, roți, ferestre\n- **ultimele straturi** recunosc lucruri întregi: o față, o pisică, o mașină\n\nNimeni n-a programat asta. Rețeaua a descoperit-o singură în timpul antrenării!',
      },
      visual: {
        type: 'flow',
        steps: [
          { e: '🖼️', t: { en: 'Pixels', ro: 'Pixeli' } },
          { e: '📐', t: { en: 'Edges', ro: 'Margini' } },
          { e: '👁️', t: { en: 'Parts', ro: 'Părți' } },
          { e: '🐱', t: { en: 'Cat!', ro: 'Pisică!' } },
        ],
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'How networks learn: backpropagation', ro: 'Cum învață rețelele: propagarea înapoi' },
      text: {
        en: 'Training a network uses the same idea as before: guess, check, fix.\n\n- **Forward**: the data flows through the network and it makes a guess.\n- **Loss**: we measure how wrong the guess is.\n- **Backward**: the error is sent **backwards** through the layers. Each weight learns how much it was to blame and which way to change.\n- Every weight takes a small **gradient descent** step.\n\nThis trick is called **backpropagation**. It made deep learning possible.',
        ro: 'Antrenarea unei rețele folosește aceeași idee ca înainte: ghicește, verifică, corectează.\n\n- **Înainte**: datele curg prin rețea și ea face o ghicire.\n- **Eroarea**: măsurăm cât de greșită e ghicirea.\n- **Înapoi**: eroarea e trimisă **înapoi** prin straturi. Fiecare pondere află cât de mult a greșit și în ce direcție trebuie să se schimbe.\n- Fiecare pondere face un mic pas de **coborâre pe gradient**.\n\nTrucul se numește **propagare înapoi** (în engleză *backpropagation*). El a făcut posibilă învățarea adâncă.',
      },
      visual: (g, t, W, H, T) => {
        const nodes = netLayout([3, 4, 4, 2], W, H, 90, W - 90, 90, H - 60);
        const cyc = t % 8;
        const fwd = cyc < 4;
        drawNet(g, nodes, fwd ? cyc : cyc - 4, { dir: fwd ? 1 : -1 });
        box(g, W / 2 - 150, 16, 300, 44, { fill: fwd ? '#d7f6ff' : '#ffe7d6', r: 14 });
        text(g, fwd ? '→ ' + T({ en: 'Forward: make a guess', ro: 'Înainte: fă o ghicire' }) : '← ' + T({ en: 'Backward: share the blame', ro: 'Înapoi: împarte vina' }), W / 2, 38, { size: 19 });
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'Why hidden layers help', ro: 'De ce ajută straturile ascunse' },
      text: {
        en: 'Remember: one neuron = one straight line.\n\nIn a hidden layer, **each neuron draws its own line**. The next layer can combine those lines: "inside all three lines" makes a triangle, more lines make curvier shapes.\n\nWith enough hidden neurons, a network can approximate almost any shape. Mathematicians call this the **universal approximation theorem**. That is how a network can solve XOR, circles and even spirals!',
        ro: 'Ține minte: un neuron = o linie dreaptă.\n\nÎntr-un strat ascuns, **fiecare neuron își desenează propria linie**. Stratul următor poate combina liniile: „înăuntrul tuturor celor trei linii” face un triunghi, mai multe linii fac forme mai rotunjite.\n\nCu destui neuroni ascunși, o rețea poate aproxima aproape orice formă. Matematicienii numesc asta **teorema aproximării universale**. Așa poate o rețea să rezolve XOR, cercuri și chiar spirale!',
      },
      visual: (g, t, W, H, T) => {
        const cx = W / 2;
        const cy = H / 2 + 10;
        const n = 3 + (Math.floor(t / 2) % 6);
        g.fillStyle = 'rgba(42,157,244,0.15)';
        g.beginPath();
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const px = cx + Math.cos(a) * 140;
          const py = cy + Math.sin(a) * 140;
          i ? g.lineTo(px, py) : g.moveTo(px, py);
        }
        g.closePath();
        g.fill();
        for (let i = 0; i < n; i++) {
          const a = ((i + 0.5) / n) * Math.PI * 2;
          const r = 140 * Math.cos(Math.PI / n);
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          const tx = -Math.sin(a);
          const ty = Math.cos(a);
          line(g, px - tx * 220, py - ty * 220, px + tx * 220, py + ty * 220, C.accent, 3);
        }
        g.strokeStyle = C.blue;
        g.lineWidth = 3;
        g.setLineDash([6, 6]);
        g.beginPath();
        g.arc(cx, cy, 128, 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
        box(g, 20, 16, 250, 44, { fill: '#fff', r: 12 });
        text(g, n + ' ' + T({ en: 'hidden neurons = ', ro: 'neuroni ascunși = ' }) + n + T({ en: ' lines', ro: ' linii' }), 145, 38, { size: 17, max: 230 });
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'Counting parameters', ro: 'Numărăm parametrii' },
      text: {
        en: 'Every connection has a weight, and every neuron (after the input layer) has a bias.\n\nA small network 2 → 4 → 1 has:\n\n- weights: 2 × 4 + 4 × 1 = **12**\n- biases: 4 + 1 = **5**\n- total: **17 parameters**\n\nThe largest language models have **hundreds of billions**. Training them needs special chips called **GPUs**, which do thousands of multiplications at the same time.',
        ro: 'Fiecare legătură are o pondere, iar fiecare neuron (după stratul de intrare) are un bias.\n\nO rețea mică 2 → 4 → 1 are:\n\n- ponderi: 2 × 4 + 4 × 1 = **12**\n- bias-uri: 4 + 1 = **5**\n- total: **17 parametri**\n\nCele mai mari modele de limbaj au **sute de miliarde**. Antrenarea lor are nevoie de cipuri speciale numite **GPU-uri**, care fac mii de înmulțiri în același timp.',
      },
      visual: (g, t, W, H, T) => {
        const nodes = netLayout([2, 4, 1], W, H, 120, W - 180, 90, H - 90);
        const edges = [];
        for (let l = 0; l < 2; l++) for (const a of nodes[l]) for (const b of nodes[l + 1]) edges.push([a, b]);
        const k = Math.min(edges.length, Math.floor((t % 9) * 3));
        edges.forEach(([a, b], i) => line(g, a.x, a.y, b.x, b.y, i < k ? C.accent : 'rgba(59,66,102,0.2)', i < k ? 3 : 1.5));
        nodes.forEach((layer, l) => layer.forEach((n) => dot(g, n.x, n.y, 18, l === 0 ? '#d7f6ff' : (t % 9) > 5 ? '#ecdfff' : '#fff')));
        box(g, W - 170, 60, 150, 110, { fill: '#fff', r: 14 });
        text(g, T({ en: 'weights', ro: 'ponderi' }) + ': ' + k, W - 95, 95, { size: 18, color: C.accent });
        text(g, T({ en: 'biases', ro: 'bias-uri' }) + ': ' + ((t % 9) > 5 ? 5 : 0), W - 95, 130, { size: 18, color: C.grape });
        if ((t % 9) > 6) text(g, '= 17', W - 95, 200, { size: 30 });
      },
    },
    {
      id: 'p8',
      level: 3,
      title: { en: 'Epochs and batches', ro: 'Epoci și loturi' },
      text: {
        en: 'Training vocabulary:\n\n- An **epoch** is one full pass through all the training data.\n- A **batch** is a small group of examples processed together before the weights are updated. Using batches is faster and smooths out the noise.\n- Training usually runs for many epochs, while engineers watch the loss go down.\n\nIn the experiment, the counter shows how many epochs the network has trained.',
        ro: 'Vocabular de antrenare:\n\n- O **epocă** este o trecere completă prin toate datele de antrenare.\n- Un **lot** (în engleză *batch*) este un grup mic de exemple procesate împreună înainte ca ponderile să fie actualizate. Loturile fac antrenarea mai rapidă și netezesc zgomotul.\n- Antrenarea durează de obicei multe epoci, în timp ce inginerii urmăresc cum scade eroarea.\n\nÎn experiment, contorul arată câte epoci s-a antrenat rețeaua.',
      },
      visual: (g, t, W, H, T) => {
        const n = 24;
        const cols = 8;
        const batch = 4;
        const cyc = t % 8;
        const cur = Math.floor(cyc * 3) % (n / batch);
        for (let i = 0; i < n; i++) {
          const x = 60 + (i % cols) * 66;
          const y = 90 + Math.floor(i / cols) * 70;
          const inBatch = Math.floor(i / batch) === cur;
          rr(g, x, y, 54, 54, 10);
          g.fillStyle = inBatch ? '#ffe36b' : Math.floor(i / batch) < cur ? '#d7f6ff' : '#f1f4fb';
          g.fill();
          g.lineWidth = 2;
          g.strokeStyle = C.ink;
          g.stroke();
          emoji(g, ['🍎', '🍌', '🍊'][i % 3], x + 27, y + 27, 26);
        }
        text(g, T({ en: 'batch ', ro: 'lotul ' }) + (cur + 1) + ' / ' + n / batch, W / 2, 40, { size: 22 });
        text(g, T({ en: 'epoch ', ro: 'epoca ' }) + (1 + Math.floor(t / 2)), W / 2, H - 60, { size: 26, color: C.accent });
        arrow(g, W / 2 - 100, H - 100, W / 2 + 100, H - 100, { color: C.muted, width: 3 });
      },
    },
  ],
  experiments: [{ id: 'networkPlayground', req: 1 }],
  quiz: [
    { level: 1, q: { en: 'What is a neural network?', ro: 'Ce este o rețea neuronală?' }, a: [{ en: 'Many artificial neurons connected in layers', ro: 'Mulți neuroni artificiali legați în straturi' }, { en: 'A fishing net', ro: 'O plasă de pescuit' }, { en: 'A spider web', ro: 'O pânză de păianjen' }, { en: 'A computer cable', ro: 'Un cablu de calculator' }], c: 0, why: { en: 'Neurons connected layer by layer form a neural network.', ro: 'Neuronii legați strat cu strat formează o rețea neuronală.' } },
    { level: 1, q: { en: 'What does "deep" mean in deep learning?', ro: 'Ce înseamnă „adâncă” în învățarea adâncă?' }, a: [{ en: 'The network has many layers', ro: 'Rețeaua are multe straturi' }, { en: 'It works underwater', ro: 'Funcționează sub apă' }, { en: 'It is very sad', ro: 'E foarte tristă' }, { en: 'It is very old', ro: 'E foarte veche' }], c: 0, why: { en: 'Deep = many hidden layers stacked on top of each other.', ro: 'Adâncă = multe straturi ascunse puse unul după altul.' } },
    { level: 1, q: { en: 'Which layer gives the final answer?', ro: 'Ce strat dă răspunsul final?' }, a: [{ en: 'The output layer', ro: 'Stratul de ieșire' }, { en: 'The input layer', ro: 'Stratul de intrare' }, { en: 'The ozone layer', ro: 'Stratul de ozon' }, { en: 'The snack layer', ro: 'Stratul de gustări' }], c: 0, why: { en: 'Data enters at the input layer and the answer comes out of the output layer.', ro: 'Datele intră prin stratul de intrare, iar răspunsul iese din stratul de ieșire.' } },
    { level: 1, tf: true, q: { en: 'True or false: signals flow from the input layer, through hidden layers, to the output layer.', ro: 'Adevărat sau fals: semnalele curg de la stratul de intrare, prin straturile ascunse, spre stratul de ieșire.' }, c: true, why: { en: 'True. This forward flow is how a network makes a prediction.', ro: 'Adevărat. Această curgere înainte e felul în care rețeaua face o predicție.' } },
    { level: 1, q: { en: 'Which of these uses deep learning?', ro: 'Care dintre acestea folosește învățarea adâncă?' }, a: [{ en: 'Recognizing faces in photos', ro: 'Recunoașterea fețelor din poze' }, { en: 'A wooden chair', ro: 'Un scaun de lemn' }, { en: 'A paper airplane', ro: 'Un avion de hârtie' }, { en: 'A light switch', ro: 'Un întrerupător' }], c: 0, why: { en: 'Face recognition uses deep neural networks trained on many photos.', ro: 'Recunoașterea fețelor folosește rețele neuronale adânci antrenate pe multe poze.' } },
    { level: 1, q: { en: 'Where does the data enter a neural network?', ro: 'Pe unde intră datele într-o rețea neuronală?' }, a: [{ en: 'The input layer', ro: 'Prin stratul de intrare' }, { en: 'The output layer', ro: 'Prin stratul de ieșire' }, { en: 'The power cable', ro: 'Prin cablul de curent' }, { en: 'The last hidden layer', ro: 'Prin ultimul strat ascuns' }], c: 0, why: { en: 'Data enters at the input layer, flows through the hidden layers, and the answer comes out of the output layer.', ro: 'Datele intră prin stratul de intrare, trec prin straturile ascunse, iar răspunsul iese prin stratul de ieșire.' } },
    { level: 1, q: { en: 'A network reads handwritten digits (0 to 9). Its output neuron for 7 lights up the most. What is its answer?', ro: 'O rețea citește cifre scrise de mână (de la 0 la 9). Neuronul ei de ieșire pentru 7 se aprinde cel mai tare. Care e răspunsul ei?' }, a: [{ en: '7', ro: '7' }, { en: '0', ro: '0' }, { en: '9', ro: '9' }, { en: 'It has no answer', ro: 'Nu are niciun răspuns' }], c: 0, why: { en: 'There is one output neuron for each possible answer. The one that lights up the most wins.', ro: 'Există câte un neuron de ieșire pentru fiecare răspuns posibil. Cel care se aprinde cel mai tare câștigă.' } },
    { level: 2, q: { en: 'In a picture network, what do the first layers usually detect?', ro: 'Într-o rețea pentru poze, ce detectează de obicei primele straturi?' }, a: [{ en: 'Simple things like edges and colors', ro: 'Lucruri simple, ca marginile și culorile' }, { en: 'Whole faces', ro: 'Fețe întregi' }, { en: "People's names", ro: 'Numele oamenilor' }, { en: 'Music', ro: 'Muzică' }], c: 0, why: { en: 'Early layers find simple patterns; later layers combine them into bigger ideas.', ro: 'Primele straturi găsesc tipare simple; straturile de după le combină în idei mai mari.' } },
    { level: 2, q: { en: 'What is backpropagation?', ro: 'Ce este propagarea înapoi?' }, a: [{ en: 'Sending the error backwards through the layers to adjust the weights', ro: 'Trimiterea erorii înapoi prin straturi ca să se ajusteze ponderile' }, { en: 'Walking backwards', ro: 'Mersul cu spatele' }, { en: 'Deleting the network', ro: 'Ștergerea rețelei' }, { en: 'Copying the data', ro: 'Copierea datelor' }], c: 0, why: { en: 'Backprop tells every weight how it contributed to the error, so gradient descent can fix it.', ro: 'Propagarea înapoi îi spune fiecărei ponderi cât a contribuit la eroare, ca s-o poată corecta coborârea pe gradient.' } },
    { level: 2, tf: true, q: { en: "True or false: a network with a hidden layer can solve problems that one neuron can't, like XOR.", ro: 'Adevărat sau fals: o rețea cu un strat ascuns poate rezolva probleme pe care un singur neuron nu le poate rezolva, ca XOR.' }, c: true, why: { en: 'True. Hidden neurons each draw a line, and the output combines them.', ro: 'Adevărat. Fiecare neuron ascuns desenează o linie, iar ieșirea le combină.' } },
    { level: 3, q: { en: 'How many weights (not counting biases) are in a 2 → 3 → 1 network?', ro: 'Câte ponderi (fără bias-uri) are o rețea 2 → 3 → 1?' }, a: [{ en: '9', ro: '9' }, { en: '6', ro: '6' }, { en: '5', ro: '5' }, { en: '3', ro: '3' }], c: 0, why: { en: '2 × 3 + 3 × 1 = 6 + 3 = 9.', ro: '2 × 3 + 3 × 1 = 6 + 3 = 9.' } },
    { level: 3, q: { en: 'Why are GPUs useful for deep learning?', ro: 'De ce sunt utile GPU-urile în învățarea adâncă?' }, a: [{ en: 'They do many multiplications at the same time', ro: 'Fac multe înmulțiri în același timp' }, { en: 'They are shiny', ro: 'Sunt strălucitoare' }, { en: 'They store photos', ro: 'Păstrează poze' }, { en: 'They make the internet faster', ro: 'Fac internetul mai rapid' }], c: 0, why: { en: 'Neural networks are mostly multiplications, and GPUs do thousands of them in parallel.', ro: 'Rețelele neuronale sunt mai ales înmulțiri, iar GPU-urile fac mii în paralel.' } },
    { level: 3, q: { en: 'What is an epoch?', ro: 'Ce este o epocă?' }, a: [{ en: 'One full pass through all the training data', ro: 'O trecere completă prin toate datele de antrenare' }, { en: 'A dinosaur', ro: 'Un dinozaur' }, { en: 'One single neuron', ro: 'Un singur neuron' }, { en: 'A type of loss', ro: 'Un tip de eroare' }], c: 0, why: { en: 'Each epoch, the network sees every training example once.', ro: 'În fiecare epocă, rețeaua vede o dată fiecare exemplu de antrenare.' } },
    { level: 3, q: { en: 'What does the universal approximation idea say?', ro: 'Ce spune ideea aproximării universale?' }, a: [{ en: 'With enough hidden neurons, a network can approximate almost any function', ro: 'Cu destui neuroni ascunși, o rețea poate aproxima aproape orice funcție' }, { en: 'Networks are always right', ro: 'Rețelele au mereu dreptate' }, { en: 'One neuron is always enough', ro: 'Un neuron e mereu de ajuns' }, { en: 'Networks cannot learn curves', ro: 'Rețelele nu pot învăța curbe' }], c: 0, why: { en: 'Many simple pieces (lines) can be combined into any shape you like.', ro: 'Multe bucăți simple (linii) pot fi combinate în orice formă vrei.' } },
  ],
};

void ease;
void arrow;
