// Island challenges: physical puzzles solved with Bip and real objects in the 3D world.
// They are bonus content: the lessons, experiments and tests work the same without them.
export const CHALLENGES = {
  s1: {
    title: { en: 'Tag the machines', ro: 'Etichetează aparatele' },
    desc: { en: 'Five objects on pedestals: tag each one as "learns from data" or "follows rules".', ro: 'Cinci obiecte pe piedestale: etichetează-le „învață din date” sau „urmează reguli”.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! Five objects stand on pedestals. Walk to each one and press E to tag it: 🧠 learns from data, or 📜 follows fixed rules. Press E again to change the tag.', ro: 'Provocarea insulei! Cinci obiecte stau pe piedestale. Mergi la fiecare și apasă E ca să-l etichetezi: 🧠 învață din date sau 📜 urmează reguli fixe. Apasă E din nou ca să schimbi eticheta.' } },
      { who: 'bip', text: { en: 'When all five tags are right, the pedestals light up green!', ro: 'Când toate cele cinci etichete sunt corecte, piedestalele se aprind verde!' } },
    ],
    outro: { en: 'Perfect tagging! Face unlock, video suggestions and voice assistants learned from data. Calculators and alarm clocks just follow rules.', ro: 'Etichetare perfectă! Deblocarea cu fața, sugestiile video și asistenții vocali au învățat din date. Calculatoarele de buzunar și ceasurile deșteptătoare doar urmează reguli.' },
  },
  s2: {
    title: { en: 'Label the fruit', ro: 'Etichetează fructele' },
    desc: { en: 'Push every fruit into the circle with the right label.', ro: 'Împinge fiecare fruct în cercul cu eticheta potrivită.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! Push or kick each fruit into the right circle: apples 🍎 on one side, oranges 🍊 on the other. Walk into a fruit to push it gently, or press F to kick it.', ro: 'Provocarea insulei! Împinge sau lovește fiecare fruct în cercul potrivit: merele 🍎 într-o parte, portocalele 🍊 în cealaltă. Mergi în fruct ca să-l împingi ușor sau apasă F ca să-l lovești.' } },
      { who: 'bip', text: { en: 'Careful: a green apple is still an apple! A label says what a thing is, not just its color.', ro: 'Atenție: un măr verde tot măr e! O etichetă spune ce este un lucru, nu doar ce culoare are.' } },
    ],
    outro: { en: 'Every fruit has the right label. That is exactly how people build a dataset for AI!', ro: 'Fiecare fruct are eticheta corectă. Exact așa construiesc oamenii un set de date pentru IA!' },
  },
  s3: {
    title: { en: 'Odd one out', ro: 'Intrusul' },
    desc: { en: 'Three rounds: find the ball whose feature is different and push it into the gold circle.', ro: 'Trei runde: găsește mingea cu o trăsătură diferită și împinge-o în cercul auriu.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! Five balls, and one is different. Push the odd one into the gold circle. Round 1: look at the color. Round 2: look at the size.', ro: 'Provocarea insulei! Cinci mingi, iar una e diferită. Împinge intrusa în cercul auriu. Runda 1: uită-te la culoare. Runda 2: uită-te la mărime.' } },
      { who: 'bip', text: { en: 'Round 3 is tricky: they all look the same. Push them to feel which one is different!', ro: 'Runda 3 e mai grea: toate arată la fel. Împinge-le ca să simți care e diferită!' } },
    ],
    outro: { en: 'You found three features: color, size and weight. Some features you can see, and some you can only measure!', ro: 'Ai găsit trei trăsături: culoarea, mărimea și greutatea. Pe unele le vezi, pe altele le poți doar măsura!' },
  },
  s4: {
    title: { en: 'Be the mystery point', ro: 'Fii punctul misterios' },
    desc: { en: 'Walk on the grid: you are the new example and the 3 nearest pillars vote.', ro: 'Mergi pe grilă: tu ești exemplul nou, iar cei mai apropiați 3 stâlpi votează.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! Step onto the grid: YOU are the new example. Glowing lines connect you to your 3 nearest pillars, and they vote.', ro: 'Provocarea insulei! Urcă pe grilă: TU ești exemplul nou. Linii luminoase te leagă de cei mai apropiați 3 stâlpi, iar ei votează.' } },
      { who: 'bip', text: { en: 'Find a spot where all 3 vote RED, one where all 3 vote BLUE, and one on the border where the vote is only 2 to 1.', ro: 'Găsește un loc unde toți 3 votează ROȘU, unul unde toți 3 votează ALBASTRU și unul la frontieră, unde votul e doar 2 la 1.' } },
    ],
    outro: { en: 'You walked across the decision boundary! Near the border the votes are close, and that is where an AI is least sure.', ro: 'Ai traversat frontiera de decizie! Lângă frontieră voturile sunt strânse, iar acolo o IA e cel mai puțin sigură.' },
  },
  s5: {
    title: { en: 'Two valleys', ro: 'Două văi' },
    desc: { en: 'Get one ball to rest at the bottom of the Loss Valley and another in the small side dip.', ro: 'Fă o bilă să stea pe fundul Văii Erorii și alta în gropița de pe margine.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! Get one ball to rest at the very bottom of the Loss Valley, the global minimum, AND another ball in the little side dip, a local minimum, at the same time.', ro: 'Provocarea insulei! Fă o bilă să stea chiar pe fundul Văii Erorii, minimul global, ȘI altă bilă în gropița de pe margine, un minim local, în același timp.' } },
      { who: 'bip', text: { en: 'Push the balls gently, or drop new ones from the yellow dispenser!', ro: 'Împinge bilele ușor sau dă drumul altora din dozatorul galben!' } },
    ],
    outro: { en: 'The ball in the side dip is stuck in a local minimum: it cannot feel that a deeper valley is right next to it. AI training can get stuck the same way!', ro: 'Bila din gropiță e blocată într-un minim local: nu simte că lângă ea e o vale mai adâncă. Și antrenarea IA se poate bloca la fel!' },
  },
  s6: {
    title: { en: 'Wake the neuron', ro: 'Trezește neuronul' },
    desc: { en: 'Stand on pressure plates and push balls onto them until the neuron fires.', ro: 'Stai pe plăcile de presiune și împinge mingi pe ele până se aprinde neuronul.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! These three pressure plates are the neuron\'s inputs: ☀️ weight 2, 📚 weight 2, 🧑‍🤝‍🧑 weight 1. The bias is −3.', ro: 'Provocarea insulei! Aceste trei plăci de presiune sunt intrările neuronului: ☀️ pondere 2, 📚 pondere 2, 🧑‍🤝‍🧑 pondere 1. Bias-ul este −3.' } },
      { who: 'bip', text: { en: 'A plate turns on when I stand on it or a ball rests on it. Make the total bigger than 0 to wake the neuron!', ro: 'O placă pornește când stau pe ea sau când o minge se oprește pe ea. Fă totalul mai mare decât 0 ca să trezești neuronul!' } },
    ],
    outro: { en: 'It fired! 2 + 2 − 3 = 1, which is more than 0. Only the right combination of inputs wakes this neuron.', ro: 'S-a aprins! 2 + 2 − 3 = 1, adică mai mult decât 0. Doar combinația potrivită de intrări trezește acest neuron.' },
  },
  s7: {
    title: { en: 'The XOR puzzle', ro: 'Puzzle-ul XOR' },
    desc: { en: 'Two plates feed a tiny network with a hidden layer. Discover when its lamp lights up.', ro: 'Două plăci alimentează o rețea mică, cu un strat ascuns. Descoperă când se aprinde lampa.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! Plates A and B feed a tiny network with a hidden layer. First light the lamp using only ONE plate.', ro: 'Provocarea insulei! Plăcile A și B alimentează o rețea mică, cu un strat ascuns. Mai întâi aprinde lampa folosind o SINGURĂ placă.' } },
      { who: 'bip', text: { en: 'Then press BOTH plates and watch what happens. Finally, light it with the OTHER plate. Balls can press plates too!', ro: 'Apoi apasă AMBELE plăci și vezi ce se întâmplă. La final, aprinde-o cu CEALALTĂ placă. Și mingile pot apăsa plăcile!' } },
    ],
    outro: { en: 'The lamp lights for A or for B, but not for both: that is XOR! One neuron can never do this, but a hidden layer can.', ro: 'Lampa se aprinde pentru A sau pentru B, dar nu pentru amândouă: asta e XOR! Un singur neuron nu poate face asta, dar un strat ascuns poate.' },
  },
  s8: {
    title: { en: 'Pixel floor', ro: 'Podeaua de pixeli' },
    desc: { en: 'Walk over the tiles to switch pixels on and off and copy the picture.', ro: 'Mergi pe dale ca să aprinzi și să stingi pixeli și copiază imaginea.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! Every tile of this floor is a pixel. Stepping onto a tile switches it between dark (0) and bright (1).', ro: 'Provocarea insulei! Fiecare dală a acestei podele e un pixel. Când pășești pe o dală, ea se schimbă între întunecat (0) și luminos (1).' } },
      { who: 'bip', text: { en: 'Copy the picture on the board by walking. Plan your path! The board also shows the numbers the computer sees. Press E at the flag to clear the floor.', ro: 'Copiază imaginea de pe panou mergând pe dale. Plănuiește-ți drumul! Panoul arată și numerele pe care le vede calculatorul. Apasă E la steag ca să ștergi podeaua.' } },
    ],
    outro: { en: 'You drew with pixels! To a computer, your picture is just 36 numbers, 0s and 1s.', ro: 'Ai desenat cu pixeli! Pentru un calculator, imaginea ta înseamnă doar 36 de numere, de 0 și 1.' },
  },
  s9: {
    title: { en: 'Trust the pattern', ro: 'Ai încredere în tipar' },
    desc: { en: 'Jump along stepping stones over the sea. Some are invisible: predict where they are!', ro: 'Sari pe pietrele de peste mare. Unele sunt invizibile: ghicește unde sunt!' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! These stepping stones rise over the sea in a steady pattern, but some of them are invisible!', ro: 'Provocarea insulei! Aceste pietre urcă deasupra mării după un tipar regulat, dar unele dintre ele sunt invizibile!' } },
      { who: 'bip', text: { en: 'Learn the pattern from the stones you can see, then jump where the next ones should be. If I miss, I sink back to the last stone. Beep!', ro: 'Învață tiparul din pietrele pe care le vezi, apoi sari acolo unde ar trebui să fie următoarele. Dacă ratez, mă întorc pe ultima piatră. Bip!' } },
    ],
    outro: { en: 'You predicted stones you had never seen. That is generalization: learning the real pattern instead of memorizing!', ro: 'Ai prezis pietre pe care nu le-ai văzut niciodată. Asta e generalizarea: să înveți tiparul adevărat, nu să memorezi!' },
  },
  s10: {
    title: { en: 'Group them yourself', ro: 'Grupează-le singur' },
    desc: { en: 'Unlabeled balls, unnamed circles: put similar balls together.', ro: 'Mingi fără etichete, cercuri fără nume: pune mingile asemănătoare împreună.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! These balls have no labels, and the three circles have no names. Push the balls into the circles so that similar balls end up together.', ro: 'Provocarea insulei! Aceste mingi nu au etichete, iar cele trei cercuri nu au nume. Împinge mingile în cercuri astfel încât mingile asemănătoare să ajungă împreună.' } },
      { who: 'bip', text: { en: 'Nobody tells you the groups. You decide what "similar" means!', ro: 'Nimeni nu-ți spune grupurile. Tu decizi ce înseamnă „asemănător”!' } },
    ],
    outro: { en: 'You found the groups without anyone telling you the answer. That is unsupervised learning, just like k-means!', ro: 'Ai găsit grupurile fără ca cineva să-ți spună răspunsul. Asta e învățarea nesupravegheată, exact ca la k-means!' },
  },
  s11: {
    title: { en: 'You are the agent', ro: 'Tu ești agentul' },
    desc: { en: 'Control a launcher with more / less power buttons and learn from the reward.', ro: 'Controlează un lansator cu butoanele de mai multă / mai puțină putere și învață din recompensă.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! Now YOU are the learning agent. Use the three buttons: ▼ less power, 🚀 fire, ▲ more power.', ro: 'Provocarea insulei! Acum TU ești agentul care învață. Folosește cele trei butoane: ▼ mai puțină putere, 🚀 lansează, ▲ mai multă putere.' } },
      { who: 'bip', text: { en: 'After each shot you get a reward: how far you missed. Use it to hit the floating target. Real gravity, real air!', ro: 'După fiecare lansare primești o recompensă: cu cât ai ratat. Folosește-o ca să nimerești ținta plutitoare. Gravitație adevărată, aer adevărat!' } },
    ],
    outro: { en: 'You learned from rewards, exactly like a reinforcement learning agent: try, get a score, adjust, try again!', ro: 'Ai învățat din recompense, exact ca un agent de învățare prin recompensă: încerci, primești un scor, ajustezi, încerci din nou!' },
  },
  s12: {
    title: { en: 'Walk a sentence', ro: 'Mergi pe o propoziție' },
    desc: { en: 'Step on word pads to build a sentence, choosing only likely next words.', ro: 'Pășește pe plăcuțele cu cuvinte ca să construiești o propoziție, alegând doar cuvinte probabile.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! Each pad is a word. Step on the pads in order to build a sentence. Pads glow brighter when their word is more likely to come next.', ro: 'Provocarea insulei! Fiecare plăcuță e un cuvânt. Pășește pe plăcuțe, pe rând, ca să construiești o propoziție. Plăcuțele strălucesc mai tare când cuvântul lor e mai probabil să urmeze.' } },
      { who: 'bip', text: { en: 'Build a whole sentence of at least 3 words that ends with the period pad (.), using only glowing pads!', ro: 'Construiește o propoziție întreagă, de cel puțin 3 cuvinte, care se termină cu plăcuța punct (.), folosind doar plăcuțe luminoase!' } },
    ],
    outro: { en: 'Your sentence followed the likely words, one step at a time. That is how a language model writes!', ro: 'Propoziția ta a urmat cuvintele probabile, pas cu pas. Exact așa scrie un model de limbaj!' },
  },
  s13: {
    title: { en: 'Balance the data', ro: 'Echilibrează datele' },
    desc: { en: 'The data is one-sided. Push balls onto the empty pan until the scale balances.', ro: 'Datele sunt părtinitoare. Împinge mingi în taler până se echilibrează balanța.' },
    intro: [
      { who: 'ada', text: { en: 'Island challenge! The left pan is full of examples of big dogs 🐕. The right pan, small dogs 🐩, is empty. The data is one-sided, so an AI trained on it would be unfair.', ro: 'Provocarea insulei! Talerul din stânga e plin de exemple de câini mari 🐕. Talerul din dreapta, câinii mici 🐩, e gol. Datele sunt părtinitoare, deci o IA antrenată pe ele ar fi nedreaptă.' } },
      { who: 'bip', text: { en: 'Push balls onto the right pan until the scale is balanced!', ro: 'Împinge mingi în talerul din dreapta până se echilibrează balanța!' } },
    ],
    outro: { en: 'Balanced! When every group has enough examples, an AI can learn to treat everyone fairly.', ro: 'Echilibrat! Când fiecare grup are destule exemple, o IA poate învăța să-i trateze corect pe toți.' },
  },
};
