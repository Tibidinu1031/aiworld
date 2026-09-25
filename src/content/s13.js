import { C, emoji, text, box, ease, rr } from '../ui/draw.js';

// Station 13: Fair and safe AI
export default {
  id: 's13',
  intro: [
    { who: 'ada', text: { en: 'The final station, {name}! Knowing how AI works is powerful. Here we learn how to make AI fair, and how to use it safely.', ro: 'Ultima stație, {name}! Să știi cum funcționează IA e o putere. Aici învățăm cum facem IA corectă și cum o folosim în siguranță.' } },
    { who: 'bip', text: { en: 'With great processing power comes great responsibility!', ro: 'O mare putere de calcul vine cu o mare responsabilitate!' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'AI can learn our mistakes', ro: 'IA poate învăța greșelile noastre' },
      text: {
        en: 'An AI learns from data. If the data is **one-sided** or **incomplete**, the AI can become **unfair**. This is called **bias**.\n\nExample: a smart pet door is trained with photos of dogs, so it opens only for dogs. But all the photos were of **big** dogs. Now it stays shut for small dogs! 🐕🚪\n\nThe AI isn\'t mean. It simply never learned that small dogs exist. The data left them out.',
        ro: 'O IA învață din date. Dacă datele sunt **părtinitoare** sau **incomplete**, IA poate deveni **nedreaptă**. Asta se numește **prejudecată** (în engleză *bias*).\n\nExemplu: o ușă inteligentă pentru animale e antrenată cu poze de câini, ca să se deschidă doar pentru câini. Dar toate pozele erau cu câini **mari**. Acum rămâne închisă pentru câinii mici! 🐕🚪\n\nIA nu e rea. Pur și simplu n-a învățat niciodată că există câini mici. Datele i-au lăsat pe dinafară.',
      },
      visual: (g, t, W, H, T) => {
        const cyc = t % 8;
        rr(g, W / 2 - 50, 120, 100, 200, 12);
        g.fillStyle = '#b37a4c';
        g.fill();
        g.lineWidth = 3;
        g.strokeStyle = C.ink;
        g.stroke();
        const big = cyc < 4;
        const open = big && cyc > 1.5;
        rr(g, W / 2 - 30, 220, 60, 90, 8);
        g.fillStyle = open ? '#fff' : '#8a5a3b';
        g.fill();
        g.stroke();
        const k = ease(((cyc % 4) - 0.2) / 1.3);
        emoji(g, big ? '🐕' : '🐩', 60 + k * (W / 2 - 150), 280, big ? 90 : 56);
        box(g, W / 2 + 80, 150, 220, 70, { fill: open ? '#e4f8ef' : big ? '#fff' : '#ffe9e6', r: 16 });
        text(g, big ? (open ? T({ en: 'Door opens ✅', ro: 'Ușa se deschide ✅' }) : '...') : T({ en: 'Stays shut! ❌', ro: 'Rămâne închisă! ❌' }), W / 2 + 190, 185, { size: 20 });
        text(g, T({ en: 'Trained only on big dogs', ro: 'Antrenată doar cu câini mari' }), W / 2, 60, { size: 20, color: C.grape });
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Is it real?', ro: 'E adevărat?' },
      text: {
        en: 'Generative AI can create pictures, voices and videos that look and sound **real**, but are fake. Fake videos of real people are called **deepfakes**.\n\nWhen you see something shocking online:\n\n- ask: who made this? Is the source trustworthy?\n- look for clues: strange hands, blurry edges, weird shadows, a voice that sounds a bit off\n- check if trusted news sites report it too\n- when in doubt, ask a trusted adult, and don\'t share it',
        ro: 'IA generativă poate crea poze, voci și filmulețe care arată și sună **adevărat**, dar sunt false. Filmulețele false cu oameni reali se numesc **deepfake-uri**.\n\nCând vezi ceva șocant online:\n\n- întreabă: cine a făcut asta? Sursa e de încredere?\n- caută indicii: mâini ciudate, margini încețoșate, umbre bizare, o voce care sună puțin ciudat\n- verifică dacă și site-urile de știri de încredere spun același lucru\n- dacă nu ești sigur, întreabă un adult de încredere și nu distribui',
      },
      visual: {
        type: 'emoji',
        cols: 2,
        items: [
          { e: '🕵️', t: { en: 'Who made it?', ro: 'Cine a făcut-o?' } },
          { e: '🖐️', t: { en: 'Look for odd details', ro: 'Caută detalii ciudate' } },
          { e: '📰', t: { en: 'Check trusted news', ro: 'Verifică știri de încredere' } },
          { e: '🧑‍🏫', t: { en: 'Ask an adult', ro: 'Întreabă un adult' } },
        ],
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'Be safe and smart with AI', ro: 'Fii în siguranță și isteț cu IA' },
      text: {
        en: 'AI is a tool, and **you** are the boss of how you use it.\n\n- Never share personal information: your full name, address, school, passwords or photos.\n- If an AI chat says something scary, strange or unkind, stop and tell a trusted adult.\n- Remember: an AI is not a person and not your friend, even if it sounds friendly.\n- Double-check important facts.\n- Be kind: don\'t use AI to trick or hurt others.',
        ro: 'IA este o unealtă, iar **tu** decizi cum o folosești.\n\n- Nu împărtăși niciodată informații personale: numele complet, adresa, școala, parolele sau pozele.\n- Dacă o conversație cu o IA spune ceva înfricoșător, ciudat sau răutăcios, oprește-te și spune-i unui adult de încredere.\n- Ține minte: o IA nu e o persoană și nu e prietenul tău, chiar dacă sună prietenos.\n- Verifică faptele importante.\n- Fii bun: nu folosi IA ca să-i păcălești sau să-i rănești pe alții.',
      },
      bip: { en: 'Even I am not a person. I am a very charming pile of math. Beep!', ro: 'Nici eu nu sunt o persoană. Sunt o grămadă foarte simpatică de matematică. Bip!' },
      visual: { type: 'big', e: '🛡️', t: { en: 'You are the boss of the AI', ro: 'Tu ești șeful IA' } },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'Fairness means testing for everyone', ro: 'Corectitudine înseamnă teste pentru toată lumea' },
      text: {
        en: 'To catch bias, don\'t just check the **overall** score. Check how well the AI works for **every group**.\n\nA pet door that is right 90% of the time sounds great... until you find it fails for nearly all small dogs.\n\nThe same happens with people: some face-recognition systems worked worse for people with darker skin, and some voice assistants understood some accents worse than others. The fix: test on every group, and add more **diverse data** where the AI is weak.',
        ro: 'Ca să prinzi prejudecățile, nu te uita doar la scorul **total**. Verifică cât de bine merge IA pentru **fiecare grup**.\n\nO ușă pentru animale care are dreptate în 90% din cazuri sună grozav... până descoperi că greșește la aproape toți câinii mici.\n\nLa fel se întâmplă și cu oamenii: unele sisteme de recunoaștere facială au mers mai prost pentru oamenii cu pielea mai închisă, iar unii asistenți vocali au înțeles unele accente mai prost decât altele. Soluția: testezi pe fiecare grup și adaugi **date mai variate** acolo unde IA e slabă.',
      },
      visual: (g, t, W, H, T) => {
        const k = ease((t % 8) / 2);
        const fixed = (t % 8) > 4;
        const groups = [[{ en: 'big dogs', ro: 'câini mari' }, 0.98, 0.98], [{ en: 'small dogs', ro: 'câini mici' }, 0.2, 0.93], [{ en: 'cats', ro: 'pisici' }, 0.95, 0.94], [{ en: 'foxes', ro: 'vulpi' }, 0.97, 0.96]];
        text(g, fixed ? T({ en: 'After adding small dogs to the data', ro: 'După ce adăugăm câini mici în date' }) : T({ en: 'Accuracy for each group', ro: 'Precizia pentru fiecare grup' }), W / 2, 40, { size: 21, color: fixed ? C.mint : C.ink });
        groups.forEach(([lab, a, b], i) => {
          const v = (fixed ? b : a) * k;
          const y = 100 + i * 80;
          text(g, T(lab), 150, y + 20, { size: 19, align: 'right' });
          rr(g, 170, y, 380, 40, 10);
          g.fillStyle = C.paper2;
          g.fill();
          rr(g, 170, y, Math.max(12, 380 * v), 40, 10);
          g.fillStyle = v < 0.6 ? C.rose : C.mint;
          g.fill();
          text(g, Math.round(v * 100) + '%', 170 + 380 * v + 30, y + 20, { size: 18 });
        });
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'Humans in charge', ro: 'Oamenii au ultimul cuvânt' },
      text: {
        en: 'AI can give great suggestions, but for **important decisions**, like health, school grades or jobs, a **human** should check and decide. AI can make mistakes, and people are responsible for the result.\n\nGood AI is also **transparent**: people should know when they are talking to an AI or looking at AI-made content.\n\nThink of AI as a very fast helper, not a boss.',
        ro: 'IA poate da sugestii grozave, dar pentru **decizii importante**, ca sănătatea, notele de la școală sau locurile de muncă, un **om** ar trebui să verifice și să decidă. IA poate greși, iar oamenii răspund de rezultat.\n\nO IA bună este și **transparentă**: oamenii ar trebui să știe când vorbesc cu o IA sau când se uită la conținut făcut de IA.\n\nGândește-te la IA ca la un ajutor foarte rapid, nu ca la un șef.',
      },
      visual: {
        type: 'flow',
        steps: [
          { e: '🤖', t: { en: 'AI suggests', ro: 'IA sugerează' }, color: '#ecdfff' },
          { e: '🧑‍⚕️', t: { en: 'Human checks', ro: 'Omul verifică' }, color: '#e6f4ff' },
          { e: '✅', t: { en: 'Human decides', ro: 'Omul decide' }, color: '#e4f8ef' },
        ],
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'Privacy and data rights', ro: 'Viața privată și drepturile asupra datelor' },
      text: {
        en: 'Many AIs learn from data about people: photos, messages, what we click. That data belongs to people and must be treated with respect.\n\nResponsible companies:\n\n- ask for **permission** before using personal data\n- **protect** it from leaks and hackers\n- let people **see** and **delete** their data\n\nLaws help. In Europe, the **GDPR** (since 2018) protects personal data, and the **EU AI Act** (adopted in 2024) sets rules for risky AI systems.',
        ro: 'Multe IA învață din date despre oameni: poze, mesaje, ce apăsăm. Datele acelea aparțin oamenilor și trebuie tratate cu respect.\n\nCompaniile responsabile:\n\n- cer **permisiunea** înainte să folosească date personale\n- le **protejează** de scurgeri și de hackeri\n- îi lasă pe oameni să-și **vadă** și să-și **șteargă** datele\n\nLegile ajută. În Europa, **GDPR** (din 2018) protejează datele personale, iar **Actul UE privind IA** (adoptat în 2024) stabilește reguli pentru sistemele IA riscante.',
      },
      visual: {
        type: 'emoji',
        cols: 3,
        items: [
          { e: '🙋', t: { en: 'Ask permission', ro: 'Cere permisiunea' } },
          { e: '🔐', t: { en: 'Protect data', ro: 'Protejează datele' } },
          { e: '🗑️', t: { en: 'Allow deleting', ro: 'Permite ștergerea' } },
        ],
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'Using AI honestly and wisely', ro: 'Folosim IA cinstit și înțelept' },
      text: {
        en: '- **Honesty**: if AI helped with your homework or art, say so. Use it to learn and get ideas, not to copy.\n- **Energy**: training and running big AIs uses a lot of electricity in data centers. Use AI when it really helps.\n- **Safety research**: many scientists work on making powerful AI **helpful, honest and harmless**, and on making sure it does what people really intend, not just what the reward says (remember reward hacking?).\n\nThe future of AI will be built by people who understand it. People like you!',
        ro: '- **Cinstea**: dacă IA te-a ajutat la teme sau la desen, spune asta. Folosește-o ca să înveți și să capeți idei, nu ca să copiezi.\n- **Energia**: antrenarea și folosirea IA mari consumă multă electricitate în centrele de date. Folosește IA când te ajută cu adevărat.\n- **Cercetarea pentru siguranță**: mulți oameni de știință lucrează ca IA puternice să fie **de ajutor, cinstite și inofensive** și să facă ce vor oamenii cu adevărat, nu doar ce spune recompensa (îți amintești de păcălirea recompensei?).\n\nViitorul IA va fi construit de oameni care o înțeleg. Oameni ca tine!',
      },
      visual: {
        type: 'emoji',
        cols: 3,
        items: [
          { e: '🙌', t: { en: 'Be honest', ro: 'Fii cinstit' } },
          { e: '⚡', t: { en: 'Save energy', ro: 'Economisește energie' } },
          { e: '🔬', t: { en: 'Make AI safe', ro: 'Fă IA sigură' } },
        ],
      },
    },
  ],
  experiments: [
    { id: 'safetyChoices', req: 1 },
    { id: 'biasLab', req: 1 },
  ],
  quiz: [
    { level: 1, q: { en: 'What is bias in AI?', ro: 'Ce este prejudecata (bias) în IA?' }, a: [{ en: 'When an AI is unfair because of one-sided or incomplete data', ro: 'Când o IA e nedreaptă din cauza datelor părtinitoare sau incomplete' }, { en: 'A type of battery', ro: 'Un tip de baterie' }, { en: 'A robot dance', ro: 'Un dans al roboților' }, { en: 'A very fast AI', ro: 'O IA foarte rapidă' }], c: 0, why: { en: 'Bias comes from data that leaves some groups out or treats them unequally.', ro: 'Prejudecata vine din date care lasă unele grupuri pe dinafară sau le tratează inegal.' } },
    { level: 1, e: '🐩', q: { en: 'A pet door AI was trained only with photos of big dogs. What might happen?', ro: 'O IA pentru o ușă de animale a fost antrenată doar cu poze de câini mari. Ce s-ar putea întâmpla?' }, a: [{ en: 'It might not open for small dogs', ro: 'S-ar putea să nu se deschidă pentru câinii mici' }, { en: 'It works perfectly for everyone', ro: 'Merge perfect pentru toți' }, { en: 'It turns into a cat', ro: 'Se transformă în pisică' }, { en: 'Nothing at all', ro: 'Nimic' }], c: 0, why: { en: 'It never saw small dogs, so it did not learn that they are dogs too.', ro: 'N-a văzut niciodată câini mici, deci n-a învățat că și ei sunt câini.' } },
    { level: 1, q: { en: 'What is a deepfake?', ro: 'Ce este un deepfake?' }, a: [{ en: 'A fake picture, video or voice made with AI that looks real', ro: 'O poză, un filmuleț sau o voce falsă, făcută cu IA, care pare adevărată' }, { en: 'A very deep swimming pool', ro: 'O piscină foarte adâncă' }, { en: 'A broken camera', ro: 'O cameră stricată' }, { en: 'A true story', ro: 'O poveste adevărată' }], c: 0, why: { en: 'Deepfakes use AI to make fake media of real people.', ro: 'Deepfake-urile folosesc IA ca să facă materiale false cu oameni reali.' } },
    { level: 1, tf: true, q: { en: 'True or false: if something online looks shocking, it is smart to check the source or ask a trusted adult.', ro: 'Adevărat sau fals: dacă ceva de pe internet pare șocant, e bine să verifici sursa sau să întrebi un adult de încredere.' }, c: true, why: { en: 'True. It might be fake, and checking first keeps you (and others) safe.', ro: 'Adevărat. Poate fi fals, iar verificarea te ține în siguranță (pe tine și pe alții).' } },
    { level: 1, q: { en: 'Who should be the boss when you use AI?', ro: 'Cine ar trebui să fie șeful când folosești IA?' }, a: [{ en: 'You (and the humans in charge)', ro: 'Tu (și oamenii responsabili)' }, { en: 'The AI, always', ro: 'Mereu IA' }, { en: 'Nobody', ro: 'Nimeni' }, { en: 'The computer mouse', ro: 'Mouse-ul calculatorului' }], c: 0, why: { en: 'AI is a tool. People decide how to use it and are responsible for it.', ro: 'IA e o unealtă. Oamenii decid cum o folosesc și răspund pentru ea.' } },
    { level: 1, e: '🏠', q: { en: 'A chatbot asks for your home address. What should you do?', ro: 'Un chatbot îți cere adresa de acasă. Ce ar trebui să faci?' }, a: [{ en: "Don't share it, and tell a trusted adult", ro: 'Nu o spui și îi spui unui adult de încredere' }, { en: 'Share it, chatbots are friendly', ro: 'O spui, chatboții sunt prietenoși' }, { en: 'Share it only once', ro: 'O spui doar o dată' }, { en: 'Share your school instead', ro: 'Spui în schimb școala' }], c: 0, why: { en: 'Personal information stays private, always.', ro: 'Informațiile personale rămân private, mereu.' } },
    { level: 2, q: { en: 'How can we make an AI fairer?', ro: 'Cum putem face o IA mai corectă?' }, a: [{ en: 'Test it on all groups and add more diverse training data', ro: 'O testăm pe toate grupurile și adăugăm date de antrenare mai variate' }, { en: 'Hide the problems', ro: 'Ascundem problemele' }, { en: 'Use less data', ro: 'Folosim mai puține date' }, { en: 'Test it on only one group', ro: 'O testăm pe un singur grup' }], c: 0, why: { en: 'Per-group testing finds the problem; diverse data fixes it.', ro: 'Testarea pe grupuri găsește problema; datele variate o rezolvă.' } },
    { level: 2, q: { en: 'Why should humans check AI in important decisions?', ro: 'De ce ar trebui oamenii să verifice IA în deciziile importante?' }, a: [{ en: 'AI can make mistakes, and people are responsible for the decision', ro: 'IA poate greși, iar oamenii răspund de decizie' }, { en: 'Because AI is lazy', ro: 'Pentru că IA e leneșă' }, { en: 'People like pressing buttons', ro: 'Oamenilor le place să apese butoane' }, { en: 'There is no reason', ro: 'Nu există niciun motiv' }], c: 0, why: { en: 'Especially in health, school or jobs, a person must check and decide.', ro: 'Mai ales la sănătate, școală sau locuri de muncă, un om trebuie să verifice și să decidă.' } },
    { level: 2, tf: true, q: { en: 'True or false: people should know when they are talking to an AI.', ro: 'Adevărat sau fals: oamenii ar trebui să știe când vorbesc cu o IA.' }, c: true, why: { en: 'True. Being transparent about AI builds trust.', ro: 'Adevărat. Transparența despre IA construiește încredere.' } },
    { level: 3, q: { en: 'What is the GDPR?', ro: 'Ce este GDPR?' }, a: [{ en: 'A European law that protects personal data', ro: 'O lege europeană care protejează datele personale' }, { en: 'A new video game', ro: 'Un joc video nou' }, { en: 'A kind of GPU chip', ro: 'Un fel de cip GPU' }, { en: 'A robot company', ro: 'O companie de roboți' }], c: 0, why: { en: 'The General Data Protection Regulation has protected people\'s data in the EU since 2018.', ro: 'Regulamentul general privind protecția datelor apără datele oamenilor în UE din 2018.' } },
    { level: 3, q: { en: 'If an AI helped you with your homework, what is the honest thing to do?', ro: 'Dacă o IA te-a ajutat la teme, care e lucrul cinstit de făcut?' }, a: [{ en: 'Say that you used AI and what it helped with', ro: 'Spui că ai folosit IA și la ce te-a ajutat' }, { en: 'Hide it', ro: 'O ascunzi' }, { en: 'Blame the AI for mistakes', ro: 'Dai vina pe IA pentru greșeli' }, { en: 'Say you wrote everything alone', ro: 'Spui că ai scris totul singur' }], c: 0, why: { en: 'Honesty about AI help is part of using it responsibly.', ro: 'Cinstea despre ajutorul IA face parte din folosirea ei responsabilă.' } },
    { level: 3, q: { en: 'What do AI safety researchers work on?', ro: 'La ce lucrează cercetătorii în siguranța IA?' }, a: [{ en: 'Making AI systems helpful, honest and harmless', ro: 'Ca sistemele IA să fie de ajutor, cinstite și inofensive' }, { en: 'Making robots run faster', ro: 'Ca roboții să alerge mai repede' }, { en: 'Painting robots', ro: 'Vopsirea roboților' }, { en: 'Hiding AI from people', ro: 'Ascunderea IA de oameni' }], c: 0, why: { en: 'They make sure powerful AI does what people truly intend, safely.', ro: 'Se asigură că IA puternice fac în siguranță ce vor oamenii cu adevărat.' } },
  ],
};

void box;
