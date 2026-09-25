import { C, emoji, text, box, ease, plotFrame, dot, line, seeded, gauss, arrow } from '../ui/draw.js';

const R = seeded(55);
const TEMPS = Array.from({ length: 14 }, (_, i) => 14 + i * 1.5 + R() * 1.2);
const SALES = TEMPS.map((t) => 3 * t - 20 + gauss(R) * 5);
const bowl = (x) => 0.25 * (x - 1) ** 2 + 0.5;
const bumpy = (x) => 0.12 * (x - 3) ** 2 - 2 * Math.exp(-((x + 2.5) ** 2) / 0.6) + 1;

function curve(g, f, fx, fn, color = C.ink, width = 4) {
  g.strokeStyle = color;
  g.lineWidth = width;
  g.beginPath();
  for (let i = 0; i <= 120; i++) {
    const x = fx.xmin + ((fx.xmax - fx.xmin) * i) / 120;
    const px = f.X(x);
    const py = f.Y(fn(x));
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  g.stroke();
}

// Station 5: Training
export default {
  id: 's5',
  intro: [
    { who: 'ada', text: { en: 'Station 5 is where the real learning happens: training! Have you seen the Loss Valley on this island? Release some balls there.', ro: 'La Stația 5 are loc adevărata învățare: antrenarea! Ai văzut Valea Erorii de pe această insulă? Dă drumul câtorva bile acolo.' } },
    { who: 'bip', text: { en: 'Learning from mistakes? I make LOTS of mistakes. I must be learning a lot!', ro: 'Învățăm din greșeli? Eu fac MULTE greșeli. Înseamnă că învăț foarte mult!' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'Guess, check, fix', ro: 'Ghicește, verifică, corectează' },
      text: {
        en: 'This is how an AI learns during **training**:\n\n- **Guess**: the model makes a prediction.\n- **Check**: we compare it with the right answer. How wrong was it?\n- **Fix**: we adjust the model a tiny bit, so next time it is a little less wrong.\n- **Repeat**: thousands or millions of times!\n\nIt\'s like learning to shoot a basketball: throw, see where it lands, adjust, throw again.',
        ro: 'Așa învață o IA în timpul **antrenării**:\n\n- **Ghicește**: modelul face o predicție.\n- **Verifică**: o comparăm cu răspunsul corect. Cât de mult a greșit?\n- **Corectează**: ajustăm puțin modelul, ca data viitoare să greșească un pic mai puțin.\n- **Repetă**: de mii sau milioane de ori!\n\nE ca atunci când înveți să arunci la coș: arunci, vezi unde ajunge mingea, ajustezi, arunci din nou.',
      },
      bip: { en: 'Guess, check, fix, repeat... That is also how I learned to balance on my wheel!', ro: 'Ghicește, verifică, corectează, repetă... Tot așa am învățat să-mi țin echilibrul pe roată!' },
      visual: {
        type: 'flow',
        loop: true,
        loopLabel: { en: 'repeat many times', ro: 'repetă de multe ori' },
        steps: [
          { e: '🤔', t: { en: 'Guess', ro: 'Ghicește' }, color: '#fff4d6' },
          { e: '📏', t: { en: 'Check', ro: 'Verifică' }, color: '#e6f4ff' },
          { e: '🔧', t: { en: 'Fix a little', ro: 'Corectează\npuțin' }, color: '#eafbe9' },
        ],
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Measuring mistakes: the loss', ro: 'Măsurăm greșelile: eroarea' },
      text: {
        en: 'To fix mistakes, the AI must know **how big** they are. So we compute a single number called the **loss** (or error).\n\n- big loss = very wrong\n- small loss = almost right\n- zero loss = perfect\n\nThe whole goal of training is to make the loss **as small as possible**.',
        ro: 'Ca să-și corecteze greșelile, IA trebuie să știe **cât de mari** sunt. Așa că calculăm un singur număr numit **eroare** (în engleză *loss*).\n\n- eroare mare = foarte greșit\n- eroare mică = aproape corect\n- eroare zero = perfect\n\nTot scopul antrenării este ca eroarea să devină **cât mai mică**.',
      },
      visual: (g, t, W, H, T) => {
        const cx = W / 2;
        const cy = H - 110;
        const r = 190;
        const cols = ['#43b05c', '#ffc21a', '#ff8a1f', '#f2464b'];
        for (let i = 0; i < 4; i++) {
          g.beginPath();
          g.arc(cx, cy, r, Math.PI + (i * Math.PI) / 4, Math.PI + ((i + 1) * Math.PI) / 4);
          g.lineWidth = 36;
          g.strokeStyle = cols[i];
          g.stroke();
        }
        const loss = 0.95 * Math.exp(-(t % 8) * 0.55);
        const a = Math.PI + (Math.PI * loss);
        g.strokeStyle = C.ink;
        g.lineWidth = 7;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(a) * (r - 30), cy + Math.sin(a) * (r - 30));
        g.stroke();
        dot(g, cx, cy, 14, C.ink);
        text(g, T({ en: 'small', ro: 'mică' }), cx - r - 10, cy + 34, { size: 18 });
        text(g, T({ en: 'big', ro: 'mare' }), cx + r + 10, cy + 34, { size: 18 });
        text(g, T({ en: 'Loss: ', ro: 'Eroare: ' }) + (loss * 100).toFixed(0), cx, cy + 60, { size: 28, color: loss > 0.5 ? C.rose : C.mint });
        emoji(g, loss > 0.6 ? '😵' : loss > 0.25 ? '😐' : '😄', cx, 70, 60);
        text(g, T({ en: 'training step ', ro: 'pasul de antrenare ' }) + Math.floor((t % 8) * 12), cx, 130, { size: 18, color: C.ink2 });
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'A prediction line', ro: 'O linie care prezice' },
      text: {
        en: 'An ice cream shop wants to predict sales. On hot days they sell more ice cream. Each dot is one day: the temperature, and how many ice creams were sold.\n\nA simple model is a **straight line** through the dots. For any temperature, the line gives a prediction.\n\nTraining means moving the line, step by step, until it fits the dots as well as possible.',
        ro: 'O gelaterie vrea să prezică vânzările. În zilele calde vinde mai multă înghețată. Fiecare punct este o zi: temperatura și câte înghețate s-au vândut.\n\nUn model simplu este o **linie dreaptă** printre puncte. Pentru orice temperatură, linia dă o predicție.\n\nAntrenarea înseamnă să mutăm linia, pas cu pas, până se potrivește cât mai bine cu punctele.',
      },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 80, y: 30, w: W - 120, h: H - 110, xmin: 10, xmax: 36, ymin: 0, ymax: 100, xlabel: T({ en: 'Temperature (°C)', ro: 'Temperatura (°C)' }), ylabel: T({ en: 'Ice creams sold', ro: 'Înghețate vândute' }) });
        [10, 20, 30].forEach((v) => text(g, v + '°', f.X(v), H - 64, { size: 14, color: C.ink2 }));
        [0, 50, 100].forEach((v) => text(g, String(v), 60, f.Y(v), { size: 14, color: C.ink2 }));
        const k = ease((t % 7) / 4);
        const m = 0.2 + (3 - 0.2) * k;
        const b = 50 + (-20 - 50) * k;
        line(g, f.X(10), f.Y(m * 10 + b), f.X(36), f.Y(m * 36 + b), C.accent, 5);
        TEMPS.forEach((x, i) => emoji(g, '🍦', f.X(x), f.Y(SALES[i]), 22));
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'Knobs called parameters', ro: 'Butoane numite parametri' },
      text: {
        en: 'Our line has two **knobs**:\n\n- the **slope**: how steep the line is\n- the **intercept**: where the line starts\n\nThese knobs are called **parameters** (or **weights**). Training turns them bit by bit.\n\nOur line has 2 parameters. Big modern AIs have **millions, or even billions**, of parameters, and training adjusts every single one!',
        ro: 'Linia noastră are două **butoane**:\n\n- **panta**: cât de înclinată e linia\n- **ordonata la origine**: de unde pornește linia\n\nAceste butoane se numesc **parametri** (sau **ponderi**). Antrenarea le rotește puțin câte puțin.\n\nLinia noastră are 2 parametri. IA mari moderne au **milioane sau chiar miliarde** de parametri, iar antrenarea îl ajustează pe fiecare!',
      },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 60, y: 30, w: W - 90, h: H - 200, xmin: 10, xmax: 36, ymin: 0, ymax: 100 });
        const m = 3 + Math.sin(t * 0.9) * 1.5;
        const b = -20 + Math.cos(t * 0.6) * 25;
        line(g, f.X(10), f.Y(m * 10 + b), f.X(36), f.Y(m * 36 + b), C.accent, 5);
        TEMPS.forEach((x, i) => dot(g, f.X(x), f.Y(SALES[i]), 6, C.sky));
        const knob = (cx, label, v, ang) => {
          dot(g, cx, H - 80, 38, '#fff');
          g.strokeStyle = C.accent;
          g.lineWidth = 6;
          g.beginPath();
          g.moveTo(cx, H - 80);
          g.lineTo(cx + Math.cos(ang) * 30, H - 80 + Math.sin(ang) * 30);
          g.stroke();
          text(g, label, cx + 110, H - 92, { size: 18 });
          text(g, v, cx + 110, H - 66, { size: 20, color: C.accent });
        };
        knob(130, T({ en: 'slope', ro: 'panta' }), m.toFixed(2), -Math.PI / 2 + Math.sin(t * 0.9) * 1.2);
        knob(W / 2 + 60, T({ en: 'intercept', ro: 'ordonata' }), b.toFixed(1), -Math.PI / 2 + Math.cos(t * 0.6) * 1.2);
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'Rolling downhill: gradient descent', ro: 'Coborâm dealul: coborârea pe gradient' },
      text: {
        en: 'Imagine the loss as a landscape of hills and valleys. High ground = big error. The lowest valley = the smallest error.\n\nThe AI can\'t see the whole landscape. It can only feel **which way is downhill** right where it stands, like walking in fog.\n\nSo it takes a small step downhill. Then another. Then another. This method is called **gradient descent**, and it trains almost every modern AI.\n\nThe Loss Valley on this island shows the idea with real, rolling balls!',
        ro: 'Imaginează-ți eroarea ca pe un peisaj cu dealuri și văi. Teren înalt = eroare mare. Valea cea mai joasă = eroarea cea mai mică.\n\nIA nu poate vedea tot peisajul. Poate simți doar **în ce parte coboară terenul** exact acolo unde stă, ca atunci când mergi prin ceață.\n\nAșa că face un pas mic la vale. Apoi încă unul. Și încă unul. Metoda se numește **coborâre pe gradient** (în engleză *gradient descent*) și antrenează aproape orice IA modernă.\n\nValea Erorii de pe această insulă arată ideea cu bile adevărate care se rostogolesc!',
      },
      visual: (g, t, W, H, T) => {
        const fx = { xmin: -5, xmax: 6 };
        const f = plotFrame(g, { x: 50, y: 40, w: W - 80, h: H - 110, xmin: -5, xmax: 6, ymin: 0, ymax: 9, grid: false, xlabel: T({ en: 'knob setting', ro: 'poziția butonului' }), ylabel: T({ en: 'loss', ro: 'eroare' }) });
        curve(g, f, fx, bowl, C.ink, 5);
        const steps = Math.floor((t % 9) * 1.6);
        let x = -4.3;
        for (let i = 0; i < steps; i++) {
          const nx = x - 0.9 * 0.5 * (x - 1);
          arrow(g, f.X(x), f.Y(bowl(x)) - 16, f.X(nx), f.Y(bowl(nx)) - 16, { color: C.accent, width: 3, head: 10 });
          x = nx;
        }
        dot(g, f.X(x), f.Y(bowl(x)) - 14, 14, C.accent);
        emoji(g, '🌫️', f.X(x) + 40, f.Y(bowl(x)) - 60, 34);
        text(g, T({ en: 'step ', ro: 'pasul ' }) + steps, W - 90, 60, { size: 20 });
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'The learning rate', ro: 'Rata de învățare' },
      text: {
        en: 'How big is each step downhill? That is the **learning rate**.\n\n- **Too small**: tiny steps. You get there... eventually. Training takes forever.\n- **Too big**: you jump right over the valley, land on the other side, and may bounce higher and higher!\n- **Just right**: a few confident steps to the bottom.\n\nPicking a good learning rate is one of the first things AI engineers tune.',
        ro: 'Cât de mare e fiecare pas la vale? Aceasta este **rata de învățare**.\n\n- **Prea mică**: pași minusculi. Ajungi... cândva. Antrenarea durează o veșnicie.\n- **Prea mare**: sari peste vale, aterizezi pe partea cealaltă și poți sări tot mai sus!\n- **Potrivită**: câțiva pași siguri până jos.\n\nAlegerea unei rate de învățare bune este unul dintre primele lucruri pe care le reglează inginerii IA.',
      },
      visual: (g, t, W, H, T) => {
        const rates = [
          [0.25, C.sky, { en: 'too small', ro: 'prea mică' }],
          [1.6, C.mint, { en: 'just right', ro: 'potrivită' }],
          [4.3, C.rose, { en: 'too big', ro: 'prea mare' }],
        ];
        const w = (W - 40) / 3;
        rates.forEach(([lr, col, lab], i) => {
          const x0 = 20 + i * w;
          const f = plotFrame(g, { x: x0 + 8, y: 70, w: w - 24, h: H - 140, xmin: -5, xmax: 7, ymin: 0, ymax: 12, grid: false });
          curve(g, f, { xmin: -5, xmax: 7 }, bowl, C.ink, 3);
          let x = -4;
          const n = Math.floor((t % 6) * 2);
          for (let s = 0; s < n; s++) {
            const nx = x - lr * 0.5 * (x - 1);
            if (Math.abs(nx) > 8) break;
            line(g, f.X(x), f.Y(bowl(x)), f.X(nx), f.Y(bowl(nx)), col, 2.5);
            x = nx;
          }
          dot(g, f.X(Math.max(-5, Math.min(7, x))), f.Y(Math.min(12, bowl(x))), 9, col);
          text(g, T(lab), x0 + w / 2, 40, { size: 20, color: col });
        });
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'The math of the error', ro: 'Matematica erorii' },
      text: {
        en: 'A popular loss is the **mean squared error** (MSE):\n\n- for each example: error = prediction − real answer\n- **square** it (multiply it by itself): negative errors become positive, and big mistakes count a lot more\n- take the **average** over all examples\n\nThe **gradient** is the slope of the loss: it points uphill. So we step the other way:\n\n`new knob = old knob − learning rate × slope`',
        ro: 'O eroare foarte folosită este **eroarea pătratică medie** (în engleză *MSE*):\n\n- pentru fiecare exemplu: eroarea = predicția − răspunsul real\n- o **ridicăm la pătrat** (o înmulțim cu ea însăși): erorile negative devin pozitive, iar greșelile mari contează mult mai mult\n- facem **media** pe toate exemplele\n\n**Gradientul** este panta erorii: arată spre deal în sus. Așa că pășim în direcția opusă:\n\n`buton nou = buton vechi − rata de învățare × panta`',
      },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 70, y: 30, w: W - 110, h: H - 100, xmin: 10, xmax: 36, ymin: 0, ymax: 100 });
        const m = 2.2;
        const b = -2;
        line(g, f.X(10), f.Y(m * 10 + b), f.X(36), f.Y(m * 36 + b), C.accent, 4);
        const show = Math.min(TEMPS.length, Math.floor((t % 8) * 3));
        TEMPS.forEach((x, i) => {
          const y = SALES[i];
          const p = m * x + b;
          if (i < show) {
            const side = Math.abs(f.Y(p) - f.Y(y));
            g.fillStyle = y > p ? 'rgba(42,157,244,0.18)' : 'rgba(242,70,75,0.18)';
            g.fillRect(f.X(x), Math.min(f.Y(p), f.Y(y)), side, side);
            line(g, f.X(x), f.Y(p), f.X(x), f.Y(y), C.rose, 2, [4, 4]);
          }
          dot(g, f.X(x), f.Y(y), 6, C.sky);
        });
        const mse = TEMPS.reduce((s, x, i) => s + (m * x + b - SALES[i]) ** 2, 0) / TEMPS.length;
        box(g, 90, 44, 230, 44, { fill: '#fff', r: 12 });
        text(g, 'MSE = ' + mse.toFixed(0), 205, 66, { size: 20, color: C.rose });
        void T;
      },
    },
    {
      id: 'p8',
      level: 3,
      title: { en: 'Stuck in a small valley', ro: 'Blocat într-o vale mică' },
      text: {
        en: 'Real loss landscapes are bumpy, with many valleys. Walking downhill, you can get stuck in a small valley that is **not** the lowest point. That is a **local minimum**.\n\nTricks to escape:\n\n- **Momentum**: act like a heavy rolling ball that keeps some speed and can roll up and over small bumps. (Just like the real balls in the Loss Valley!)\n- **Random restarts**: start from several places and keep the best result.\n\nFun fact: in huge networks with millions of knobs, true dead-end valleys turn out to be rarer than scientists once feared.',
        ro: 'Peisajele reale ale erorii sunt pline de denivelări, cu multe văi. Coborând, poți rămâne blocat într-o vale mică ce **nu** este cel mai jos punct. Acesta e un **minim local**.\n\nTrucuri ca să scapi:\n\n- **Impulsul** (în engleză *momentum*): te porți ca o bilă grea care se rostogolește, își păstrează o parte din viteză și poate trece peste denivelări mici. (Exact ca bilele adevărate din Valea Erorii!)\n- **Reporniri aleatorii**: pornești din mai multe locuri și păstrezi cel mai bun rezultat.\n\nCuriozitate: în rețelele uriașe, cu milioane de butoane, văile fără ieșire sunt mai rare decât se temeau odată oamenii de știință.',
      },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 40, y: 50, w: W - 70, h: H - 110, xmin: -5, xmax: 6, ymin: 0, ymax: 7, grid: false });
        curve(g, f, { xmin: -5, xmax: 6 }, bumpy, C.ink, 5);
        const d = (x) => (bumpy(x + 0.001) - bumpy(x - 0.001)) / 0.002;
        let x1 = -4.6;
        let x2 = -4.6;
        let v = 0;
        const n = Math.floor((t % 10) * 8);
        for (let i = 0; i < n; i++) {
          x1 -= 0.3 * d(x1);
          v = 0.9 * v - 0.12 * d(x2);
          x2 += v;
        }
        dot(g, f.X(x1), f.Y(bumpy(x1)) - 12, 12, C.sky);
        dot(g, f.X(x2), f.Y(bumpy(x2)) - 12, 12, C.accent);
        text(g, '● ' + T({ en: 'plain steps', ro: 'pași simpli' }), 150, 28, { size: 18, color: C.sky });
        text(g, '● ' + T({ en: 'with momentum', ro: 'cu impuls' }), W - 170, 28, { size: 18, color: C.accent });
        text(g, T({ en: 'local minimum', ro: 'minim local' }), f.X(-2.4), f.Y(bumpy(-2.4)) + 36, { size: 16, color: C.grape });
        text(g, T({ en: 'global minimum', ro: 'minim global' }), f.X(3), f.Y(bumpy(3)) + 36, { size: 16, color: C.mint });
      },
    },
  ],
  experiments: [
    { id: 'lineFit', req: 1 },
    { id: 'hillDescent', req: 2 },
  ],
  quiz: [
    { level: 1, q: { en: 'What is the "loss" in AI training?', ro: 'Ce este „eroarea” (loss) în antrenarea IA?' }, a: [{ en: "A number that shows how wrong the AI's guesses are", ro: 'Un număr care arată cât de greșite sunt ghicirile IA' }, { en: 'When you lose a game', ro: 'Când pierzi un joc' }, { en: 'A missing robot', ro: 'Un robot pierdut' }, { en: "The computer's weight", ro: 'Greutatea calculatorului' }], c: 0, why: { en: 'The loss measures the size of the mistakes. Training tries to make it small.', ro: 'Eroarea măsoară cât de mari sunt greșelile. Antrenarea încearcă s-o facă mică.' } },
    { level: 1, q: { en: 'What is the goal of training?', ro: 'Care este scopul antrenării?' }, a: [{ en: 'Make the loss as small as possible', ro: 'Să facă eroarea cât mai mică' }, { en: 'Make the loss as big as possible', ro: 'Să facă eroarea cât mai mare' }, { en: 'Make the computer hot', ro: 'Să încălzească calculatorul' }, { en: 'Delete the data', ro: 'Să șteargă datele' }], c: 0, why: { en: 'Smaller loss means fewer and smaller mistakes.', ro: 'O eroare mai mică înseamnă greșeli mai puține și mai mici.' } },
    { level: 1, q: { en: 'In the training loop, what comes right after the model makes a guess?', ro: 'În bucla de antrenare, ce urmează imediat după ce modelul ghicește?' }, a: [{ en: 'Check how wrong the guess was', ro: 'Verificăm cât de greșită a fost ghicirea' }, { en: 'Turn off the computer', ro: 'Oprim calculatorul' }, { en: 'Celebrate forever', ro: 'Sărbătorim pentru totdeauna' }, { en: 'Delete the model', ro: 'Ștergem modelul' }], c: 0, why: { en: 'Guess, check, fix, repeat. Checking tells us how to fix.', ro: 'Ghicește, verifică, corectează, repetă. Verificarea ne spune cum să corectăm.' } },
    { level: 1, tf: true, q: { en: 'True or false: AI training usually repeats guess–check–fix many, many times.', ro: 'Adevărat sau fals: antrenarea IA repetă de obicei ghicește–verifică–corectează de foarte multe ori.' }, c: true, why: { en: 'True. Each round improves the model a little bit.', ro: 'Adevărat. Fiecare rundă îmbunătățește puțin modelul.' } },
    { level: 1, e: '🍦', q: { en: 'In the ice cream example, what does the line predict?', ro: 'În exemplul cu înghețata, ce prezice linia?' }, a: [{ en: 'How many ice creams will be sold at a given temperature', ro: 'Câte înghețate se vor vinde la o anumită temperatură' }, { en: 'The flavor of the ice cream', ro: 'Aroma înghețatei' }, { en: 'The color of the sky', ro: 'Culoarea cerului' }, { en: 'The name of the shop', ro: 'Numele gelateriei' }], c: 0, why: { en: 'The line turns a temperature into a predicted number of sales.', ro: 'Linia transformă o temperatură într-un număr prezis de vânzări.' } },
    { level: 2, q: { en: 'What are parameters?', ro: 'Ce sunt parametrii?' }, a: [{ en: 'The adjustable knobs of a model that training changes', ro: 'Butoanele reglabile ale unui model, pe care le schimbă antrenarea' }, { en: 'Parachute meters', ro: 'Contoare de parașute' }, { en: 'Keys on a keyboard', ro: 'Tastele unei tastaturi' }, { en: 'The names of the data', ro: 'Numele datelor' }], c: 0, why: { en: 'Parameters (weights) are the numbers inside the model that training tunes.', ro: 'Parametrii (ponderile) sunt numerele din interiorul modelului pe care le reglează antrenarea.' } },
    { level: 2, q: { en: 'In gradient descent, which way do we step?', ro: 'În coborârea pe gradient, în ce direcție pășim?' }, a: [{ en: 'Downhill, where the loss gets smaller', ro: 'La vale, unde eroarea scade' }, { en: 'Uphill', ro: 'La deal' }, { en: 'In a random direction every time', ro: 'Într-o direcție la întâmplare de fiecare dată' }, { en: 'We never move', ro: 'Nu ne mișcăm niciodată' }], c: 0, why: { en: 'Stepping downhill on the loss landscape makes the error smaller.', ro: 'Pașii la vale pe peisajul erorii fac eroarea mai mică.' } },
    { level: 2, tf: true, q: { en: 'True or false: big modern AIs can have billions of parameters.', ro: 'Adevărat sau fals: IA mari moderne pot avea miliarde de parametri.' }, c: true, why: { en: 'True. Large language models have billions of adjustable numbers.', ro: 'Adevărat. Modelele mari de limbaj au miliarde de numere reglabile.' } },
    { level: 3, q: { en: 'What happens if the learning rate is way too big?', ro: 'Ce se întâmplă dacă rata de învățare este mult prea mare?' }, a: [{ en: 'Steps overshoot the valley and the loss can bounce or grow', ro: 'Pașii sar peste vale, iar eroarea poate sări sau crește' }, { en: 'Training becomes perfect instantly', ro: 'Antrenarea devine perfectă imediat' }, { en: 'Nothing changes', ro: 'Nu se schimbă nimic' }, { en: 'The model gets smaller', ro: 'Modelul se micșorează' }], c: 0, why: { en: 'Huge steps jump across the valley and can make things worse and worse.', ro: 'Pașii uriași sar peste vale și pot face lucrurile din ce în ce mai rele.' } },
    { level: 3, q: { en: 'Why do we square the errors in the mean squared error?', ro: 'De ce ridicăm la pătrat erorile în eroarea pătratică medie?' }, a: [{ en: "So positive and negative errors don't cancel, and big mistakes count more", ro: 'Ca erorile pozitive și negative să nu se anuleze, iar greșelile mari să conteze mai mult' }, { en: 'Because squares look nice', ro: 'Pentru că pătratele arată frumos' }, { en: 'To make all numbers smaller', ro: 'Ca toate numerele să fie mai mici' }, { en: 'So the AI can draw squares', ro: 'Ca IA să poată desena pătrate' }], c: 0, why: { en: 'Squaring makes every error positive and punishes big errors much more than small ones.', ro: 'Ridicarea la pătrat face fiecare eroare pozitivă și pedepsește mult mai tare greșelile mari.' } },
    { level: 3, q: { en: 'What is a local minimum?', ro: 'Ce este un minim local?' }, a: [{ en: 'A small valley that is not the lowest point of the whole landscape', ro: 'O vale mică ce nu este cel mai jos punct al întregului peisaj' }, { en: 'The smallest computer', ro: 'Cel mai mic calculator' }, { en: 'The top of the highest hill', ro: 'Vârful celui mai înalt deal' }, { en: 'The minimum speed limit', ro: 'Limita minimă de viteză' }], c: 0, why: { en: 'Downhill steps can get trapped in a small valley. Momentum or restarts help escape.', ro: 'Pașii la vale pot rămâne prinși într-o vale mică. Impulsul sau repornirile ajută să scapi.' } },
    { level: 3, q: { en: 'How does momentum help gradient descent?', ro: 'Cum ajută impulsul coborârea pe gradient?' }, a: [{ en: 'It keeps some speed, so it can roll over small bumps', ro: 'Păstrează o parte din viteză, așa că poate trece peste denivelări mici' }, { en: 'It stops the training', ro: 'Oprește antrenarea' }, { en: 'It deletes the loss', ro: 'Șterge eroarea' }, { en: 'It makes every step random', ro: 'Face fiecare pas la întâmplare' }], c: 0, why: { en: 'Like a heavy rolling ball, momentum carries it through small dips toward deeper valleys.', ro: 'Ca o bilă grea care se rostogolește, impulsul o poartă prin gropițe mici spre văi mai adânci.' } },
  ],
};

export { TEMPS, SALES, bowl, bumpy };
void gauss;
void emoji;
