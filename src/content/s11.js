import { C, emoji, text, box, ease, dot, line, arrow, rr } from '../ui/draw.js';

const G = 9.81;
function traj(v, deg, drag = 0) {
  const pts = [];
  let x = 0;
  let y = 1;
  const a = (deg * Math.PI) / 180;
  let vx = v * Math.cos(a);
  let vy = v * Math.sin(a);
  for (let i = 0; i < 2000 && y >= 0; i++) {
    pts.push([x, y]);
    const sp = Math.hypot(vx, vy);
    vx -= drag * sp * vx * 0.01;
    vy -= (G + drag * sp * vy) * 0.01;
    x += vx * 0.01;
    y += vy * 0.01;
  }
  pts.push([x, 0]);
  return pts;
}

// Station 11: Reinforcement learning
export default {
  id: 's11',
  intro: [
    { who: 'ada', text: { en: 'Station 11: learning from rewards! Did you see the AI launcher by the sea? It learns to hit its target just by trying.', ro: 'Stația 11: învățarea din recompense! Ai văzut lansatorul IA de lângă mare? Învață să-și nimerească ținta doar încercând.' } },
    { who: 'bip', text: { en: 'Trying things until they work? That is basically my whole life!', ro: 'Să încerci lucruri până merg? Asta e practic toată viața mea!' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'Learning by trying', ro: 'Învățăm încercând' },
      text: {
        en: 'How do you teach a puppy to sit? You don\'t show it a million labeled photos. You wait until it sits, then give it a **treat**!\n\nThis is **reinforcement learning (RL)**: an AI tries actions, gets **rewards** for good results and **penalties** for bad ones, and slowly learns what works.\n\nIt\'s also how you learned to ride a bike: wobble, fall, adjust, try again.',
        ro: 'Cum înveți un cățel să stea jos? Nu-i arăți un milion de poze etichetate. Aștepți până se așază, apoi îi dai o **recompensă**!\n\nAceasta este **învățarea prin recompensă** (în engleză *reinforcement learning*, RL): o IA încearcă acțiuni, primește **recompense** pentru rezultate bune și **penalizări** pentru cele rele, și învață încet ce funcționează.\n\nTot așa ai învățat și tu să mergi pe bicicletă: te clatini, cazi, te corectezi, încerci din nou.',
      },
      visual: (g, t, W, H, T) => {
        const cyc = t % 6;
        emoji(g, '🐕', W / 2 - 120, H / 2 + 20 - (cyc > 1.5 && cyc < 2 ? 0 : cyc < 1.5 ? 20 : 0), 110);
        emoji(g, '🧒', W / 2 + 140, H / 2, 110);
        box(g, W / 2 - 230, 40, 200, 60, { fill: '#fff', r: 16 });
        text(g, cyc < 1.5 ? T({ en: 'Sit!', ro: 'Stai!' }) : cyc < 3.5 ? '🐕 ' + T({ en: 'sits...', ro: 'se așază...' }) : '😋 🦴', W / 2 - 130, 70, { size: 24 });
        if (cyc > 3.5) {
          const k = ease((cyc - 3.5) * 1.5);
          emoji(g, '🦴', W / 2 + 90 - 200 * k, H / 2 - 60 + Math.sin(k * Math.PI) * -50, 44);
          box(g, 120, H - 90, W - 240, 56, { fill: '#e4f8ef', r: 16 });
          text(g, '+1 ' + T({ en: 'reward!', ro: 'recompensă!' }), W / 2, H - 62, { size: 24, color: C.mint });
        }
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Agent, environment, reward', ro: 'Agent, mediu, recompensă' },
      text: {
        en: 'RL has its own words:\n\n- the **agent** is the learner (a robot, a game character...)\n- the **environment** is the world it lives in\n- **actions** are the things it can do (move, jump, launch...)\n- the **reward** is a score after each action: good or bad\n\nThe agent\'s goal: collect as much reward as possible over time.',
        ro: 'RL are propriile cuvinte:\n\n- **agentul** este cel care învață (un robot, un personaj de joc...)\n- **mediul** este lumea în care trăiește\n- **acțiunile** sunt lucrurile pe care le poate face (să meargă, să sară, să lanseze...)\n- **recompensa** este un scor după fiecare acțiune: bun sau rău\n\nScopul agentului: să adune cât mai multă recompensă în timp.',
      },
      visual: (g, t, W, H, T) => {
        box(g, 60, H / 2 - 70, 180, 140, { fill: '#fff4d6', r: 18 });
        emoji(g, '🤖', 150, H / 2 - 18, 60);
        text(g, T({ en: 'Agent', ro: 'Agent' }), 150, H / 2 + 40, { size: 22 });
        box(g, W - 240, H / 2 - 70, 180, 140, { fill: '#e6f4ff', r: 18 });
        emoji(g, '🏝️', W - 150, H / 2 - 18, 60);
        text(g, T({ en: 'Environment', ro: 'Mediu' }), W - 150, H / 2 + 40, { size: 20 });
        const k = (t % 4) / 4;
        arrow(g, 250, H / 2 - 90, W - 250, H / 2 - 90, { color: C.accent, width: 5 });
        text(g, '🎮 ' + T({ en: 'action', ro: 'acțiune' }), W / 2, H / 2 - 115, { size: 20, color: C.accent });
        arrow(g, W - 250, H / 2 + 90, 250, H / 2 + 90, { color: C.mint, width: 5 });
        text(g, '⭐ ' + T({ en: 'reward + new situation', ro: 'recompensă + situație nouă' }), W / 2, H / 2 + 118, { size: 19, color: C.mint });
        dot(g, k < 0.5 ? 250 + (W - 500) * (k * 2) : W - 250 - (W - 500) * ((k - 0.5) * 2), k < 0.5 ? H / 2 - 90 : H / 2 + 90, 9, k < 0.5 ? C.accent : C.mint);
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'Practice makes perfect', ro: 'Exercițiul îl face pe maestru' },
      text: {
        en: 'At first, an RL agent is clumsy. Its actions are almost random. But every reward teaches it a little.\n\nAfter many tries, it finds better and better strategies. RL agents have learned to:\n\n- walk and run in physics simulations\n- play video games better than people\n- control robot arms\n- save energy in huge data centers\n\nWatch the launcher below: every throw lands a bit closer!',
        ro: 'La început, un agent RL e stângaci. Acțiunile lui sunt aproape la întâmplare. Dar fiecare recompensă îl învață câte puțin.\n\nDupă multe încercări, găsește strategii din ce în ce mai bune. Agenții RL au învățat să:\n\n- meargă și să alerge în simulări cu fizică\n- joace jocuri video mai bine decât oamenii\n- controleze brațe robotice\n- economisească energie în centre de date uriașe\n\nUită-te la lansatorul de mai jos: fiecare aruncare ajunge un pic mai aproape!',
      },
      visual: (g, t, W, H, T) => {
        const S = 17;
        const gy = H - 60;
        line(g, 20, gy, W - 20, gy, C.ink, 3);
        const tries = [[10, 30], [18, 70], [13, 42], [14.5, 45], [15.2, 44]];
        const n = Math.min(tries.length, 1 + Math.floor((t % 10) / 1.6));
        const target = 23;
        rr(g, 40 + target * S - 20, gy - 24, 40, 24, 6);
        g.fillStyle = C.rose;
        g.fill();
        tries.slice(0, n).forEach(([v, a], i) => {
          const p = traj(v, a);
          g.strokeStyle = i === n - 1 ? C.accent : 'rgba(255,107,61,0.25)';
          g.lineWidth = i === n - 1 ? 4 : 2;
          g.beginPath();
          p.forEach(([x, y], j) => (j ? g.lineTo(40 + x * S, gy - y * S) : g.moveTo(40 + x * S, gy - y * S)));
          g.stroke();
          const land = p[p.length - 1][0];
          dot(g, 40 + land * S, gy, 6, i === n - 1 ? C.accent : '#ffc4ad', null);
        });
        emoji(g, '🤖', 40, gy - 22, 34);
        text(g, T({ en: 'try ', ro: 'încercarea ' }) + n, W / 2, 34, { size: 22 });
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'Explore or exploit?', ro: 'Explorezi sau profiți?' },
      text: {
        en: 'Imagine choosing where to eat. You could go to your **favorite** restaurant (you know it\'s good), or try a **new** one (it might be even better... or worse).\n\n- **Exploit** = do what worked best so far.\n- **Explore** = try something new to learn more.\n\nAn agent that only exploits may never discover the best option. One that only explores never uses what it learned. Good agents **explore a lot at first**, then **exploit more** as they learn.',
        ro: 'Imaginează-ți că alegi unde să mănânci. Poți merge la restaurantul **preferat** (știi că e bun) sau poți încerca unul **nou** (poate e și mai bun... sau mai prost).\n\n- **A profita** (în engleză *exploit*) = faci ce a mers cel mai bine până acum.\n- **A explora** = încerci ceva nou ca să afli mai multe.\n\nUn agent care doar profită poate să nu descopere niciodată cea mai bună variantă. Unul care doar explorează nu folosește niciodată ce a învățat. Agenții buni **explorează mult la început**, apoi **profită mai mult** pe măsură ce învață.',
      },
      visual: {
        type: 'vs',
        left: { e: '🍕', bg: '#fff4d6', title: { en: 'Exploit', ro: 'Profiți' }, items: [{ en: 'Go to your favorite place', ro: 'Mergi la locul preferat' }, { en: 'Safe and known', ro: 'Sigur și cunoscut' }, { en: 'Might miss something better', ro: 'Poți rata ceva mai bun' }] },
        right: { e: '🧭', bg: '#e6f4ff', title: { en: 'Explore', ro: 'Explorezi' }, items: [{ en: 'Try a new place', ro: 'Încerci un loc nou' }, { en: 'Could be amazing', ro: 'Poate fi uimitor' }, { en: '...or not so good', ro: '...sau nu prea bun' }] },
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'Rewards that come later', ro: 'Recompense care vin mai târziu' },
      text: {
        en: 'Sometimes the reward only comes at the very end. In a maze, you get the prize only when you reach the exit, after many steps.\n\nThe agent has to figure out which of its **earlier** moves led to the reward. Over many tries, the value of the prize "flows backwards" to the steps before it: "this square is good, because from here I can reach the exit."\n\nIn the Robot Maze experiment you can watch this happen.',
        ro: 'Uneori recompensa vine abia la sfârșit. Într-un labirint primești premiul doar când ajungi la ieșire, după mulți pași.\n\nAgentul trebuie să-și dea seama care dintre mutările lui **de mai devreme** au dus la recompensă. După multe încercări, valoarea premiului „curge înapoi” spre pașii dinaintea lui: „căsuța asta e bună, pentru că de aici pot ajunge la ieșire.”\n\nÎn experimentul Labirintul robotului poți vedea cum se întâmplă asta.',
      },
      visual: (g, t, W, H, T) => {
        const n = 6;
        const s = 60;
        const x0 = (W - n * s) / 2;
        const y0 = 40;
        const path = [[0, 5], [0, 4], [1, 4], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [5, 1], [5, 0]];
        const k = (t % 9) / 9;
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
          const idx = path.findIndex(([px, py]) => px === x && py === y);
          const val = idx >= 0 ? Math.max(0, idx / (path.length - 1) - (1 - k * 1.2) + 0.1) : 0;
          rr(g, x0 + x * s + 2, y0 + y * s + 2, s - 4, s - 4, 8);
          g.fillStyle = idx >= 0 && val > 0 ? `rgba(31,191,162,${Math.min(1, val * 1.5)})` : '#f1f4fb';
          g.fill();
        }
        emoji(g, '🔋', x0 + 5 * s + s / 2, y0 + s / 2, 36);
        emoji(g, '🤖', x0 + s / 2, y0 + 5 * s + s / 2, 36);
        text(g, T({ en: 'value flows back from the prize', ro: 'valoarea curge înapoi de la premiu' }), W / 2, H - 20, { size: 18, color: C.mint });
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'Q-learning', ro: 'Învățarea Q' },
      text: {
        en: 'A classic RL method is **Q-learning**. The agent keeps a table of **Q-values**: for every situation and every action, "how good is it to do this here?"\n\nAfter each step it updates one entry:\n\n`Q ← Q + α · (reward + γ · best next Q − Q)`\n\n- **α** (alpha) is the learning rate\n- **γ** (gamma) is the **discount**: how much future rewards count compared to rewards right now\n\nWith γ close to 1 the agent plans far ahead. With γ close to 0 it only cares about the next step.',
        ro: 'O metodă clasică de RL este **învățarea Q** (în engleză *Q-learning*). Agentul ține un tabel cu **valori Q**: pentru fiecare situație și fiecare acțiune, „cât de bine e să fac asta aici?”\n\nDupă fiecare pas actualizează o căsuță:\n\n`Q ← Q + α · (recompensă + γ · cel mai bun Q următor − Q)`\n\n- **α** (alfa) este rata de învățare\n- **γ** (gama) este **factorul de reducere**: cât contează recompensele viitoare față de cele de acum\n\nCu γ aproape de 1, agentul plănuiește departe în viitor. Cu γ aproape de 0, îi pasă doar de pasul următor.',
      },
      visual: (g, t, W, H, T) => {
        const n = 5;
        const s = 76;
        const x0 = (W - n * s) / 2;
        const y0 = 40;
        const goal = [4, 0];
        for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
          const d = Math.abs(goal[0] - x) + Math.abs(goal[1] - y);
          const gam = 0.9;
          const v = Math.pow(gam, d);
          rr(g, x0 + x * s + 3, y0 + y * s + 3, s - 6, s - 6, 10);
          g.fillStyle = `rgba(31,191,162,${0.15 + v * 0.75})`;
          g.fill();
          if (d > 0) {
            const right = x < goal[0] && ((x + y) % 2 === 0 || y === goal[1]);
            const cx = x0 + x * s + s / 2;
            const cy = y0 + y * s + s / 2;
            if (right) arrow(g, cx - 14, cy, cx + 16, cy, { width: 3.5, head: 9 });
            else arrow(g, cx, cy + 14, cx, cy - 16, { width: 3.5, head: 9 });
            text(g, v.toFixed(2), cx, cy + 26, { size: 12, color: C.ink2 });
          }
        }
        emoji(g, '🔋', x0 + 4 * s + s / 2, y0 + s / 2, 36);
        text(g, 'γ = 0.9', W - 70, H - 26, { size: 18, color: C.grape });
        void T;
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'RL in the real world', ro: 'RL în lumea reală' },
      text: {
        en: '- **AlphaGo** learned partly by playing millions of games of Go against itself, then beat the world champion.\n- **Robots** learn to walk in computer simulations with realistic physics first, then move to the real world.\n- **Chatbots** are fine-tuned with feedback from people who rate answers. This is called **RLHF** (reinforcement learning from human feedback).\n\nA warning: agents chase their reward, not your intention. A badly designed reward can lead to **reward hacking**, like a game agent spinning in circles to collect the same points forever instead of finishing the race!',
        ro: '- **AlphaGo** a învățat în parte jucând milioane de partide de Go împotriva lui însuși, apoi l-a învins pe campionul mondial.\n- **Roboții** învață să meargă mai întâi în simulări pe calculator, cu fizică realistă, apoi trec în lumea reală.\n- **Chatboții** sunt reglați fin cu ajutorul oamenilor care notează răspunsurile. Asta se numește **RLHF** (învățare prin recompensă din feedback uman).\n\nAtenție: agenții urmăresc recompensa, nu intenția ta. O recompensă prost gândită poate duce la **păcălirea recompensei** (în engleză *reward hacking*), de exemplu un agent dintr-un joc care se învârte în cerc ca să adune la nesfârșit aceleași puncte, în loc să termine cursa!',
      },
      visual: {
        type: 'emoji',
        cols: 2,
        items: [
          { e: '⚫', t: { en: 'AlphaGo plays itself', ro: 'AlphaGo joacă cu sine' } },
          { e: '🦿', t: { en: 'Robots learn to walk', ro: 'Roboții învață să meargă' } },
          { e: '👍', t: { en: 'Chatbots learn from ratings', ro: 'Chatboții învață din note' } },
          { e: '🌀', t: { en: 'Beware reward hacking!', ro: 'Atenție la păcăleli!' } },
        ],
      },
    },
  ],
  experiments: [
    { id: 'launchLab', req: 1 },
    { id: 'gridWorld', min: 2, req: 2 },
  ],
  quiz: [
    { level: 1, q: { en: 'In reinforcement learning, how does the agent learn?', ro: 'În învățarea prin recompensă, cum învață agentul?' }, a: [{ en: 'By trying actions and getting rewards or penalties', ro: 'Încercând acțiuni și primind recompense sau penalizări' }, { en: 'By reading labels', ro: 'Citind etichete' }, { en: 'By copying files', ro: 'Copiind fișiere' }, { en: 'By sleeping', ro: 'Dormind' }], c: 0, why: { en: 'Trial and error, guided by rewards.', ro: 'Încercare și eroare, ghidate de recompense.' } },
    { level: 1, q: { en: 'What is a reward?', ro: 'Ce este o recompensă?' }, a: [{ en: 'A signal that says "that was good!"', ro: 'Un semnal care spune „a fost bine!”' }, { en: 'A kind of robot', ro: 'Un fel de robot' }, { en: 'The screen', ro: 'Ecranul' }, { en: 'A mistake', ro: 'O greșeală' }], c: 0, why: { en: 'Rewards tell the agent which actions lead to good results.', ro: 'Recompensele îi spun agentului ce acțiuni duc la rezultate bune.' } },
    { level: 1, e: '🐕', q: { en: 'Which is most like reinforcement learning?', ro: 'Ce seamănă cel mai mult cu învățarea prin recompensă?' }, a: [{ en: 'Training a puppy with treats', ro: 'Dresarea unui cățel cu recompense' }, { en: 'Reading a dictionary', ro: 'Citirea unui dicționar' }, { en: 'Looking at a map', ro: 'Privitul unei hărți' }, { en: 'Painting a wall', ro: 'Vopsirea unui perete' }], c: 0, why: { en: 'The puppy tries things and treats reward the right behavior.', ro: 'Cățelul încearcă lucruri, iar recompensele răsplătesc comportamentul corect.' } },
    { level: 1, tf: true, q: { en: 'True or false: at the start, an RL agent often acts almost randomly.', ro: 'Adevărat sau fals: la început, un agent RL acționează adesea aproape la întâmplare.' }, c: true, why: { en: 'True. It has not learned anything yet, so it tries things.', ro: 'Adevărat. Încă n-a învățat nimic, așa că încearcă diverse lucruri.' } },
    { level: 1, q: { en: 'What is the agent?', ro: 'Ce este agentul?' }, a: [{ en: 'The learner that takes actions', ro: 'Cel care învață și face acțiuni' }, { en: 'The reward', ro: 'Recompensa' }, { en: 'A wall', ro: 'Un perete' }, { en: 'The screen', ro: 'Ecranul' }], c: 0, why: { en: 'The agent acts in the environment and learns from the rewards.', ro: 'Agentul acționează în mediu și învață din recompense.' } },
    { level: 2, q: { en: 'What does "explore" mean in RL?', ro: 'Ce înseamnă „a explora” în RL?' }, a: [{ en: 'Trying new actions to discover something better', ro: 'Încerci acțiuni noi ca să descoperi ceva mai bun' }, { en: 'Always doing the same thing', ro: 'Faci mereu același lucru' }, { en: 'Turning off', ro: 'Te oprești' }, { en: 'Deleting rewards', ro: 'Ștergi recompensele' }], c: 0, why: { en: 'Exploring means trying the unknown to learn more.', ro: 'A explora înseamnă să încerci necunoscutul ca să afli mai mult.' } },
    { level: 2, q: { en: 'Why is only exploiting (never exploring) a problem?', ro: 'De ce e o problemă să profiți mereu (fără să explorezi niciodată)?' }, a: [{ en: 'You might never find a better strategy', ro: 'S-ar putea să nu găsești niciodată o strategie mai bună' }, { en: 'It uses too much paint', ro: 'Folosește prea multă vopsea' }, { en: 'It is against the law', ro: 'E împotriva legii' }, { en: 'It makes rewards too big', ro: 'Face recompensele prea mari' }], c: 0, why: { en: 'Without exploring, better options stay undiscovered.', ro: 'Fără explorare, variantele mai bune rămân nedescoperite.' } },
    { level: 2, tf: true, q: { en: 'True or false: sometimes the reward only comes after many steps, like finishing a maze.', ro: 'Adevărat sau fals: uneori recompensa vine doar după mulți pași, ca la terminarea unui labirint.' }, c: true, why: { en: 'True. The agent must learn which earlier moves led to the reward.', ro: 'Adevărat. Agentul trebuie să învețe care mutări de mai devreme au dus la recompensă.' } },
    { level: 3, q: { en: 'What is a Q-value?', ro: 'Ce este o valoare Q?' }, a: [{ en: 'A score for how good an action is in a certain situation', ro: 'Un scor pentru cât de bună e o acțiune într-o anumită situație' }, { en: 'A quiz question', ro: 'O întrebare de test' }, { en: "The robot's name", ro: 'Numele robotului' }, { en: 'A type of pixel', ro: 'Un tip de pixel' }], c: 0, why: { en: 'Q(situation, action) estimates the future reward of taking that action there.', ro: 'Q(situație, acțiune) estimează recompensa viitoare dacă faci acea acțiune acolo.' } },
    { level: 3, q: { en: 'What does the discount factor γ (gamma) control?', ro: 'Ce controlează factorul de reducere γ (gama)?' }, a: [{ en: 'How much future rewards count compared to immediate ones', ro: 'Cât contează recompensele viitoare față de cele imediate' }, { en: 'The price in a shop', ro: 'Prețul dintr-un magazin' }, { en: "The robot's speed", ro: 'Viteza robotului' }, { en: 'The size of the grid', ro: 'Mărimea grilei' }], c: 0, why: { en: 'High γ = plan ahead; low γ = care only about now.', ro: 'γ mare = plănuiești înainte; γ mic = îți pasă doar de acum.' } },
    { level: 3, q: { en: 'What is "reward hacking"?', ro: 'Ce este „păcălirea recompensei”?' }, a: [{ en: 'When an agent finds a loophole to get reward without doing the real task', ro: 'Când un agent găsește o portiță ca să primească recompensa fără să facă sarcina adevărată' }, { en: 'Stealing cookies', ro: 'Furatul prăjiturilor' }, { en: 'A computer password', ro: 'O parolă de calculator' }, { en: 'A very generous reward', ro: 'O recompensă foarte generoasă' }], c: 0, why: { en: 'Agents chase the reward they are given, so rewards must be designed carefully.', ro: 'Agenții urmăresc recompensa pe care o primesc, deci recompensele trebuie gândite cu grijă.' } },
    { level: 3, q: { en: 'How did AlphaGo get so good at Go?', ro: 'Cum a devenit AlphaGo atât de bun la Go?' }, a: [{ en: 'Partly by playing millions of games against itself', ro: 'În parte jucând milioane de partide împotriva lui însuși' }, { en: 'By reading one book', ro: 'Citind o singură carte' }, { en: 'By asking a friend', ro: 'Întrebând un prieten' }, { en: 'It never got good', ro: 'Nu a devenit niciodată bun' }], c: 0, why: { en: 'Self-play gave it endless practice with rewards for winning.', ro: 'Jocul cu sine i-a dat exercițiu nesfârșit, cu recompense pentru victorii.' } },
  ],
};

export { traj };
