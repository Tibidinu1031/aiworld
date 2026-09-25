import { C, emoji, text, box, plotFrame, dot, seeded, gauss } from '../ui/draw.js';
import { polyfit, mse } from '../experiments/polyfit.js';

const truth = (x) => 0.5 + 0.3 * Math.sin(2.4 * x) + 0.1 * x;
const R = seeded(909);
const TX = Array.from({ length: 10 }, (_, i) => -0.95 + (i / 9) * 1.9 + (R() - 0.5) * 0.08);
const TY = TX.map((x) => truth(x) + gauss(R) * 0.07);
const VX = Array.from({ length: 10 }, (_, i) => -0.9 + (i / 9) * 1.8 + (R() - 0.5) * 0.1 + 0.05);
const VY = VX.map((x) => truth(x) + gauss(R) * 0.07);
const FITS = [1, 3, 9].map((d) => polyfit(TX, TY, d));

function plotCurve(g, f, fn, color, width = 4) {
  g.save();
  g.beginPath();
  g.rect(f.X(-1), f.Y(1.2), f.X(1) - f.X(-1), f.Y(-0.2) - f.Y(1.2));
  g.clip();
  g.strokeStyle = color;
  g.lineWidth = width;
  g.beginPath();
  for (let i = 0; i <= 160; i++) {
    const x = -1 + (2 * i) / 160;
    const y = Math.max(-1, Math.min(2, fn(x)));
    i ? g.lineTo(f.X(x), f.Y(y)) : g.moveTo(f.X(x), f.Y(y));
  }
  g.stroke();
  g.restore();
}

// Station 9: Memorizing vs understanding
export default {
  id: 's9',
  intro: [
    { who: 'ada', text: { en: 'Station 9 has one of the most important lessons in all of AI: memorizing is not the same as understanding.', ro: 'Stația 9 are una dintre cele mai importante lecții din toată IA: a memora nu e același lucru cu a înțelege.' } },
    { who: 'bip', text: { en: 'I memorized the whole map of the island! ...Wait, is that bad?', ro: 'Am memorat toată harta insulei! ...Stai, asta e rău?' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'Two students', ro: 'Doi elevi' },
      text: {
        en: 'Two students prepare for a math test.\n\n- **Student A** memorizes the answers to last year\'s test, word for word.\n- **Student B** practices and **understands** how the problems work.\n\nOn test day, the questions are **new**. Student B does great. Student A is lost!\n\nAIs can act like Student A: they can memorize their training examples instead of learning the real pattern. This is called **overfitting**.',
        ro: 'Doi elevi se pregătesc pentru un test la matematică.\n\n- **Elevul A** memorează cuvânt cu cuvânt răspunsurile de la testul de anul trecut.\n- **Elevul B** exersează și **înțelege** cum funcționează problemele.\n\nÎn ziua testului, întrebările sunt **noi**. Elevul B se descurcă de minune. Elevul A e pierdut!\n\nIA se pot purta ca Elevul A: își pot memora exemplele de antrenare în loc să învețe tiparul adevărat. Asta se numește **supra-învățare** (în engleză *overfitting*).',
      },
      visual: {
        type: 'vs',
        left: { e: '📝', bg: '#ffe9e6', title: { en: 'Memorizer', ro: 'Cel care memorează' }, items: [{ en: 'Perfect on old questions', ro: 'Perfect la întrebările vechi' }, { en: 'Lost on new questions', ro: 'Pierdut la întrebări noi' }, { en: 'Like an overfit AI', ro: 'Ca o IA supra-învățată' }] },
        right: { e: '💡', bg: '#e4f8ef', title: { en: 'Understander', ro: 'Cel care înțelege' }, items: [{ en: 'Learns the real pattern', ro: 'Învață tiparul adevărat' }, { en: 'Good on new questions', ro: 'Bun la întrebări noi' }, { en: 'Like a well-trained AI', ro: 'Ca o IA bine antrenată' }] },
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Training data and test data', ro: 'Date de antrenare și date de test' },
      text: {
        en: 'To catch a memorizer, teachers use **new questions**. AI scientists do the same:\n\n- the AI learns from the **training data**\n- then we check it on **test data** it has never seen\n\nIf it does well on training data but badly on test data, it memorized instead of learning. Only the test tells the truth!',
        ro: 'Ca să prindă un elev care doar memorează, profesorii folosesc **întrebări noi**. Oamenii de știință din IA fac la fel:\n\n- IA învață din **datele de antrenare**\n- apoi o verificăm pe **date de test** pe care nu le-a văzut niciodată\n\nDacă se descurcă bine pe datele de antrenare, dar prost pe cele de test, a memorat în loc să învețe. Doar testul spune adevărul!',
      },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 50, y: 40, w: W - 80, h: H - 110, xmin: -1, xmax: 1, ymin: -0.2, ymax: 1.2, grid: false });
        TX.forEach((x, i) => dot(g, f.X(x), f.Y(TY[i]), 9, C.blue));
        if ((t % 6) > 2.5) VX.forEach((x, i) => {
          g.save();
          g.translate(f.X(x), f.Y(VY[i]));
          g.rotate(Math.PI / 4);
          g.fillStyle = C.mint;
          g.fillRect(-8, -8, 16, 16);
          g.strokeStyle = C.ink;
          g.lineWidth = 2;
          g.strokeRect(-8, -8, 16, 16);
          g.restore();
        });
        text(g, '● ' + T({ en: 'training data', ro: 'date de antrenare' }), 160, 22, { size: 18, color: C.blue });
        if ((t % 6) > 2.5) text(g, '◆ ' + T({ en: 'test data (new!)', ro: 'date de test (noi!)' }), W - 160, 22, { size: 18, color: C.mint });
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'Too simple, too wiggly, just right', ro: 'Prea simplu, prea încâlcit, exact cum trebuie' },
      text: {
        en: 'Imagine drawing a curve through these dots:\n\n- **Too simple** (underfitting): a straight line misses the obvious bend. Bad on training AND test data.\n- **Too wiggly** (overfitting): the curve twists to touch every dot exactly. Perfect on training data, terrible on new data.\n- **Just right**: a smooth curve that follows the real trend. Good on both!\n\nLike Goldilocks and the three bowls of porridge.',
        ro: 'Imaginează-ți că desenezi o curbă prin aceste puncte:\n\n- **Prea simplă** (sub-învățare): o linie dreaptă ratează curbura evidentă. Proastă și pe datele de antrenare, ȘI pe cele de test.\n- **Prea încâlcită** (supra-învățare): curba se răsucește ca să atingă exact fiecare punct. Perfectă pe datele de antrenare, groaznică pe date noi.\n- **Exact cum trebuie**: o curbă netedă care urmează tendința reală. Bună pe amândouă!\n\nCa în povestea cu Bucle-Aurii și cele trei boluri de terci.',
      },
      visual: (g, t, W, H, T) => {
        const labels = [[{ en: 'Too simple', ro: 'Prea simplă' }, C.rose], [{ en: 'Just right', ro: 'Exact bine' }, C.mint], [{ en: 'Too wiggly', ro: 'Prea încâlcită' }, C.rose]];
        const order = [0, 1, 2];
        const w = (W - 40) / 3;
        order.forEach((k, i) => {
          const f = plotFrame(g, { x: 20 + i * w + 6, y: 70, w: w - 16, h: H - 150, xmin: -1, xmax: 1, ymin: -0.2, ymax: 1.2, grid: false });
          TX.forEach((x, j) => dot(g, f.X(x), f.Y(TY[j]), 5, C.blue, C.ink, 1.5));
          plotCurve(g, f, FITS[k], C.accent, 3);
          text(g, T(labels[k][0]), 20 + i * w + w / 2, 40, { size: 20, color: labels[k][1] });
          emoji(g, ['😕', '😄', '🤪'][k], 20 + i * w + w / 2, H - 50, 36);
        });
        void t;
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'Noise', ro: 'Zgomotul' },
      text: {
        en: 'Real data is never perfect. Measurements have small random errors, and luck plays a part. We call these random wobbles **noise**.\n\nThe dashed line is the true pattern. The dots are real measurements: close to the pattern, but a bit off because of noise.\n\nAn overfit model believes the noise is important and bends to fit every wobble. A good model ignores the noise and captures the real pattern.',
        ro: 'Datele reale nu sunt niciodată perfecte. Măsurătorile au mici erori întâmplătoare, iar norocul își are și el partea lui. Numim aceste mici abateri **zgomot**.\n\nLinia punctată este tiparul adevărat. Punctele sunt măsurători reale: aproape de tipar, dar puțin pe alături din cauza zgomotului.\n\nUn model supra-învățat crede că zgomotul e important și se îndoaie ca să prindă fiecare abatere. Un model bun ignoră zgomotul și prinde tiparul real.',
      },
      visual: (g, t, W, H, T) => {
        const f = plotFrame(g, { x: 50, y: 40, w: W - 80, h: H - 110, xmin: -1, xmax: 1, ymin: -0.2, ymax: 1.2, grid: false });
        g.setLineDash([10, 8]);
        plotCurve(g, f, truth, C.mint, 4);
        g.setLineDash([]);
        TX.forEach((x, i) => {
          const wob = Math.sin(t * 3 + i) * 0.01;
          g.strokeStyle = C.rose;
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(f.X(x), f.Y(truth(x)));
          g.lineTo(f.X(x), f.Y(TY[i] + wob));
          g.stroke();
          dot(g, f.X(x), f.Y(TY[i] + wob), 9, C.blue);
        });
        text(g, T({ en: 'red = noise', ro: 'roșu = zgomot' }), W - 110, 30, { size: 18, color: C.rose });
        text(g, T({ en: 'dashed = true pattern', ro: 'punctat = tiparul real' }), 170, 30, { size: 18, color: C.mint });
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'Watch the test error', ro: 'Urmărește eroarea de test' },
      text: {
        en: 'As we make a model more complex (more wiggly, more parameters):\n\n- the **training error** keeps going down, all the way to zero\n- the **test error** goes down at first, then goes back **up** when the model starts memorizing noise\n\nThe best model sits at the bottom of the test error curve. Finding that sweet spot is a big part of an AI engineer\'s job.',
        ro: 'Pe măsură ce facem un model mai complex (mai încâlcit, cu mai mulți parametri):\n\n- **eroarea de antrenare** tot scade, până la zero\n- **eroarea de test** scade la început, apoi **crește** din nou când modelul începe să memoreze zgomotul\n\nCel mai bun model stă la fundul curbei erorii de test. Găsirea acestui punct e o mare parte din munca unui inginer IA.',
      },
      visual: (g, t, W, H, T) => {
        const degs = Array.from({ length: 9 }, (_, i) => i + 1);
        const tr = degs.map((d) => mse(polyfit(TX, TY, d), TX, TY));
        const te = degs.map((d) => mse(polyfit(TX, TY, d), VX, VY));
        const mx = 0.06;
        const f = plotFrame(g, { x: 70, y: 40, w: W - 110, h: H - 120, xmin: 1, xmax: 9, ymin: 0, ymax: mx, xlabel: T({ en: 'how wiggly (complexity)', ro: 'cât de încâlcit (complexitate)' }), ylabel: T({ en: 'error', ro: 'eroare' }), ticks: 8 });
        const drawL = (arr, col) => {
          g.strokeStyle = col;
          g.lineWidth = 5;
          g.beginPath();
          arr.forEach((v, i) => (i ? g.lineTo(f.X(degs[i]), f.Y(Math.min(mx, v))) : g.moveTo(f.X(degs[i]), f.Y(Math.min(mx, v)))));
          g.stroke();
        };
        drawL(tr, C.blue);
        drawL(te, C.mint);
        const best = te.indexOf(Math.min(...te));
        dot(g, f.X(degs[best]), f.Y(te[best]), 12, C.sun);
        text(g, '⭐ ' + T({ en: 'just right', ro: 'exact bine' }), f.X(degs[best]), f.Y(te[best]) - 26, { size: 17 });
        text(g, '— ' + T({ en: 'training error', ro: 'eroarea de antrenare' }), W - 160, 30, { size: 16, color: C.blue });
        text(g, '— ' + T({ en: 'test error', ro: 'eroarea de test' }), W - 160, 54, { size: 16, color: C.mint });
        void t;
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'How to fight overfitting', ro: 'Cum luptăm cu supra-învățarea' },
      text: {
        en: 'AI engineers have a toolbox against overfitting:\n\n- **More data**: with more examples, the noise averages out and memorizing gets harder.\n- **Simpler models**: fewer parameters, less room to memorize.\n- **Regularization**: a penalty for extreme weights, which keeps the curve calm.\n- **Early stopping**: stop training as soon as the error on held-out data starts rising.\n- **Dropout**: randomly switch off some neurons during training, so the network can\'t rely on memorized tricks.\n- **Data augmentation**: create extra examples by flipping, rotating or cropping pictures.',
        ro: 'Inginerii IA au o trusă de unelte împotriva supra-învățării:\n\n- **Mai multe date**: cu mai multe exemple, zgomotul se echilibrează și memorarea devine mai grea.\n- **Modele mai simple**: mai puțini parametri, mai puțin loc de memorat.\n- **Regularizarea**: o penalizare pentru ponderile extreme, care ține curba liniștită.\n- **Oprirea timpurie**: oprești antrenarea imediat ce eroarea pe datele puse deoparte începe să crească.\n- **Dropout**: stingi la întâmplare unii neuroni în timpul antrenării, ca rețeaua să nu se bazeze pe trucuri memorate.\n- **Augmentarea datelor**: creezi exemple în plus întorcând, rotind sau decupând poze.',
      },
      visual: {
        type: 'emoji',
        cols: 3,
        title: { en: 'The anti-overfitting toolbox 🧰', ro: 'Trusa anti-supra-învățare 🧰' },
        items: [
          { e: '📚', t: { en: 'More data', ro: 'Mai multe date' } },
          { e: '✂️', t: { en: 'Simpler model', ro: 'Model mai simplu' } },
          { e: '⚖️', t: { en: 'Regularization', ro: 'Regularizare' } },
          { e: '⏱️', t: { en: 'Early stopping', ro: 'Oprire timpurie' } },
          { e: '💤', t: { en: 'Dropout', ro: 'Dropout' } },
          { e: '🔄', t: { en: 'Augmentation', ro: 'Augmentare' } },
        ],
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'The validation set', ro: 'Setul de validare' },
      text: {
        en: 'Careful scientists split data into **three** piles:\n\n- **Training set** (about 70%): the model learns its weights here.\n- **Validation set** (about 15%): used to choose settings, like how complex the model should be, or when to stop training.\n- **Test set** (about 15%): locked away and used **only once**, at the very end, for an honest final score.\n\nWhy three? If you keep checking the test set while choosing settings, you slowly "overfit" to the test set too!',
        ro: 'Oamenii de știință atenți împart datele în **trei** grămezi:\n\n- **Setul de antrenare** (cam 70%): aici modelul își învață ponderile.\n- **Setul de validare** (cam 15%): folosit ca să alegi setări, de exemplu cât de complex să fie modelul sau când să oprești antrenarea.\n- **Setul de test** (cam 15%): ținut sub cheie și folosit **o singură dată**, la sfârșit, pentru un scor final cinstit.\n\nDe ce trei? Dacă tot verifici setul de test în timp ce alegi setările, ajungi încet să te „supra-înveți” și pe setul de test!',
      },
      visual: (g, t, W, H, T) => {
        const parts = [[0.7, C.blue, { en: 'Training 70%', ro: 'Antrenare 70%' }, '📘'], [0.15, C.grape, { en: 'Validation 15%', ro: 'Validare 15%' }, '🎛️'], [0.15, C.mint, { en: 'Test 15%', ro: 'Test 15%' }, '🔒']];
        let x = 40;
        const w = W - 80;
        parts.forEach(([p, col, lab, e], i) => {
          const k = Math.min(1, Math.max(0, (t % 6) - i * 0.6));
          box(g, x, 170, w * p - 6, 90, { fill: col, r: 12 });
          g.globalAlpha = k;
          emoji(g, e, x + (w * p) / 2, 215, 40);
          text(g, T(lab), x + (w * p) / 2, i === 0 ? 300 : i === 1 ? 300 : 340, { size: 17, color: col, max: w * p + 60 });
          g.globalAlpha = 1;
          x += w * p;
        });
        text(g, T({ en: 'One dataset, three jobs', ro: 'Un set de date, trei treburi' }), W / 2, 100, { size: 24 });
      },
    },
  ],
  experiments: [{ id: 'overfitLab', req: 1 }],
  quiz: [
    { level: 1, q: { en: 'What is overfitting?', ro: 'Ce este supra-învățarea?' }, a: [{ en: 'When an AI memorizes its training examples instead of learning the real pattern', ro: 'Când o IA își memorează exemplele de antrenare în loc să învețe tiparul adevărat' }, { en: 'When a robot is too big for its box', ro: 'Când un robot e prea mare pentru cutia lui' }, { en: 'When the computer memory is full', ro: 'Când memoria calculatorului e plină' }, { en: 'When training is too short', ro: 'Când antrenarea e prea scurtă' }], c: 0, why: { en: 'An overfit model is great on training data but bad on new data.', ro: 'Un model supra-învățat e grozav pe datele de antrenare, dar prost pe date noi.' } },
    { level: 1, q: { en: 'Why do we test an AI on new data?', ro: 'De ce testăm o IA pe date noi?' }, a: [{ en: 'To check if it really learned, not just memorized', ro: 'Ca să verificăm dacă a învățat cu adevărat, nu doar a memorat' }, { en: 'Because the old data got lost', ro: 'Pentru că datele vechi s-au pierdut' }, { en: 'To make it slower', ro: 'Ca s-o facem mai lentă' }, { en: 'We never do that', ro: 'Nu facem niciodată asta' }], c: 0, why: { en: 'Only new, unseen examples show whether the AI can handle the real world.', ro: 'Doar exemplele noi, nevăzute, arată dacă IA se descurcă în lumea reală.' } },
    { level: 1, q: { en: 'A model that is too simple and misses the pattern is...', ro: 'Un model prea simplu, care ratează tiparul, face...' }, a: [{ en: 'Underfitting', ro: 'Sub-învățare' }, { en: 'Overfitting', ro: 'Supra-învățare' }, { en: 'Just right', ro: 'Exact ce trebuie' }, { en: 'Perfect', ro: 'Perfect' }], c: 0, why: { en: 'Underfitting = too simple. Overfitting = too complex.', ro: 'Sub-învățare = prea simplu. Supra-învățare = prea complex.' } },
    { level: 1, tf: true, q: { en: 'True or false: a model that is perfect on its training data is always great on new data.', ro: 'Adevărat sau fals: un model perfect pe datele de antrenare e mereu grozav pe date noi.' }, c: false, why: { en: 'False! It may have memorized noise. The test data tells the truth.', ro: 'Fals! Poate a memorat zgomotul. Datele de test spun adevărul.' } },
    { level: 1, e: '📝', q: { en: 'Which student will do better on a test with NEW questions?', ro: 'Care elev se va descurca mai bine la un test cu întrebări NOI?' }, a: [{ en: 'The one who understood the ideas', ro: 'Cel care a înțeles ideile' }, { en: 'The one who memorized last year\'s answers', ro: 'Cel care a memorat răspunsurile de anul trecut' }, { en: 'The one who stayed home', ro: 'Cel care a stat acasă' }, { en: 'Both will get zero', ro: 'Amândoi vor lua zero' }], c: 0, why: { en: 'Understanding generalizes to new questions; memorizing does not.', ro: 'Înțelegerea funcționează și la întrebări noi; memorarea, nu.' } },
    { level: 2, q: { en: 'What is noise in data?', ro: 'Ce este zgomotul în date?' }, a: [{ en: 'Small random errors or chance wobbles', ro: 'Mici erori întâmplătoare sau abateri din noroc' }, { en: 'Only loud sounds', ro: 'Doar sunetele puternice' }, { en: 'The most important pattern', ro: 'Cel mai important tipar' }, { en: 'The labels', ro: 'Etichetele' }], c: 0, why: { en: 'Noise is the random part of the data that has nothing to do with the real pattern.', ro: 'Zgomotul e partea întâmplătoare din date, care nu are legătură cu tiparul real.' } },
    { level: 2, q: { en: 'As a model gets more and more complex, the test error usually...', ro: 'Pe măsură ce un model devine tot mai complex, eroarea de test de obicei...' }, a: [{ en: 'Goes down first, then goes back up', ro: 'Scade la început, apoi crește din nou' }, { en: 'Always goes down', ro: 'Scade mereu' }, { en: 'Always stays the same', ro: 'Rămâne mereu la fel' }, { en: 'Becomes negative', ro: 'Devine negativă' }], c: 0, why: { en: 'That U-shape is the classic sign of overfitting.', ro: 'Forma de U este semnul clasic al supra-învățării.' } },
    { level: 2, tf: true, q: { en: 'True or false: an overfit model treats random noise as if it were important.', ro: 'Adevărat sau fals: un model supra-învățat tratează zgomotul întâmplător ca și cum ar fi important.' }, c: true, why: { en: 'True. It bends to fit every random wobble.', ro: 'Adevărat. Se îndoaie ca să prindă fiecare abatere întâmplătoare.' } },
    { level: 3, q: { en: 'What is early stopping?', ro: 'Ce este oprirea timpurie?' }, a: [{ en: 'Stopping training when the validation error starts to rise', ro: 'Oprirea antrenării când eroarea de validare începe să crească' }, { en: 'Turning off the computer before breakfast', ro: 'Oprirea calculatorului înainte de micul dejun' }, { en: 'Never training at all', ro: 'Să nu antrenezi deloc' }, { en: 'Training forever', ro: 'Antrenarea la nesfârșit' }], c: 0, why: { en: 'Stopping at the right moment keeps the model before it starts memorizing.', ro: 'Oprirea la momentul potrivit păstrează modelul dinainte să înceapă să memoreze.' } },
    { level: 3, q: { en: 'What is the validation set used for?', ro: 'La ce folosește setul de validare?' }, a: [{ en: 'Choosing settings, like how complex the model should be', ro: 'La alegerea setărilor, de exemplu cât de complex să fie modelul' }, { en: 'Only for the final grade', ro: 'Doar pentru nota finală' }, { en: 'Learning the weights', ro: 'La învățarea ponderilor' }, { en: 'Decorating charts', ro: 'La decorarea graficelor' }], c: 0, why: { en: 'Training set learns weights, validation set picks settings, test set gives the final honest score.', ro: 'Setul de antrenare învață ponderile, setul de validare alege setările, setul de test dă scorul final cinstit.' } },
    { level: 3, q: { en: 'Which of these helps fight overfitting?', ro: 'Care dintre acestea ajută împotriva supra-învățării?' }, a: [{ en: 'Getting more training data', ro: 'Mai multe date de antrenare' }, { en: 'Making the model memorize more', ro: 'Să faci modelul să memoreze mai mult' }, { en: 'Deleting the test set', ro: 'Să ștergi setul de test' }, { en: 'Testing only on the training data', ro: 'Să testezi doar pe datele de antrenare' }], c: 0, why: { en: 'More data makes the real pattern clearer and memorizing harder.', ro: 'Mai multe date fac tiparul real mai clar și memorarea mai grea.' } },
  ],
};

void box;
