import { C, emoji, text, box, ease } from '../ui/draw.js';

// Station 1: What is AI?
export default {
  id: 's1',
  intro: [
    { who: 'ada', text: { en: "Welcome to Station 1, {name}! Here we'll find out what AI really is, and what it isn't.", ro: 'Bine ai venit la Stația 1, {name}! Aici aflăm ce este cu adevărat IA și ce nu este.' } },
    { who: 'bip', text: { en: "I hope I'm more than a toaster with a smile. Beep!", ro: 'Sper că sunt mai mult decât un prăjitor de pâine cu zâmbet. Bip!' } },
  ],
  pages: [
    {
      id: 'p1',
      level: 1,
      title: { en: 'Hello, smart machines!', ro: 'Salut, mașini isteție!' },
      text: {
        en: '**AI** stands for **Artificial Intelligence**. It is the name for computer programs that can do things we usually think need a clever brain:\n\n- recognizing what is in a picture\n- understanding what you say\n- translating between languages\n- playing games\n\n"Artificial" means made by people. So AI is intelligence that people built into machines.',
        ro: '**IA** înseamnă **Inteligență Artificială** (în engleză, *AI*). Așa numim programele de calculator care pot face lucruri pentru care, de obicei, e nevoie de un creier isteț:\n\n- să recunoască ce e într-o poză\n- să înțeleagă ce spui\n- să traducă dintr-o limbă în alta\n- să joace jocuri\n\n„Artificial” înseamnă făcut de oameni. Deci IA este inteligență construită de oameni în mașini.',
      },
      bip: { en: "Wait... so I'm an AI? Beep! That explains a lot.", ro: 'Stai... deci eu sunt o IA? Bip! Asta explică multe.' },
      visual: {
        type: 'emoji',
        cols: 2,
        items: [
          { e: '📷', t: { en: 'Sees pictures', ro: 'Vede poze' } },
          { e: '🗣️', t: { en: 'Understands speech', ro: 'Înțelege vorbirea' } },
          { e: '🌍', t: { en: 'Translates', ro: 'Traduce' } },
          { e: '♟️', t: { en: 'Plays games', ro: 'Joacă jocuri' } },
        ],
      },
    },
    {
      id: 'p2',
      level: 1,
      title: { en: 'Rules or learning?', ro: 'Reguli sau învățare?' },
      text: {
        en: 'There are two ways to make a computer do something smart.\n\n**1. Write rules.** A person writes every instruction, like *"If the temperature is below 20 °C, turn on the heater."* The computer follows the rules exactly, but it can\'t handle anything the rules don\'t cover.\n\n**2. Let it learn.** We show the computer lots of **examples** and it finds the pattern by itself. This is called **machine learning**, and it is how most modern AI works.',
        ro: 'Există două feluri de a face un calculator să facă ceva isteț.\n\n**1. Scriem reguli.** Un om scrie fiecare instrucțiune, de exemplu *„Dacă temperatura e sub 20 °C, pornește încălzirea.”* Calculatorul urmează regulile exact, dar nu se descurcă cu nimic din ce nu scrie în reguli.\n\n**2. Îl lăsăm să învețe.** Îi arătăm calculatorului multe **exemple** și el găsește singur tiparul. Asta se numește **învățare automată** (în engleză *machine learning*) și așa funcționează majoritatea IA moderne.',
      },
      visual: {
        type: 'vs',
        mid: { en: 'vs', ro: 'vs' },
        left: {
          e: '📜',
          bg: '#eef2ff',
          title: { en: 'Rules', ro: 'Reguli' },
          items: [
            { en: 'A person writes every step', ro: 'Un om scrie fiecare pas' },
            { en: 'Always does the same thing', ro: 'Face mereu același lucru' },
            { en: 'Gets stuck on new situations', ro: 'Se blochează la situații noi' },
          ],
        },
        right: {
          e: '🧠',
          bg: '#fff1f7',
          title: { en: 'Learning', ro: 'Învățare' },
          items: [
            { en: 'Learns from many examples', ro: 'Învață din multe exemple' },
            { en: 'Finds patterns by itself', ro: 'Găsește singură tipare' },
            { en: 'Can handle new situations', ro: 'Se descurcă și în situații noi' },
          ],
        },
      },
    },
    {
      id: 'p3',
      level: 1,
      title: { en: 'AI is all around you', ro: 'IA este peste tot în jurul tău' },
      text: {
        en: 'You have probably used AI today without noticing!\n\n- a phone that unlocks when it sees your face\n- videos an app suggests for you\n- a voice assistant that answers questions\n- an email app that hides spam\n- a map that finds the fastest route\n\nAI is not magic and it is not alive. It is **math + data + computers** working together.',
        ro: 'Probabil ai folosit IA azi fără să observi!\n\n- un telefon care se deblochează când îți vede fața\n- filmulețele pe care ți le sugerează o aplicație\n- un asistent vocal care răspunde la întrebări\n- o aplicație de e-mail care ascunde mesajele spam\n- o hartă care găsește drumul cel mai rapid\n\nIA nu este magie și nu este vie. Este **matematică + date + calculatoare** care lucrează împreună.',
      },
      bip: { en: "Math, data and computers... that's my recipe! Beep boop.", ro: 'Matematică, date și calculatoare... asta e rețeta mea! Bip bup.' },
      visual: {
        type: 'emoji',
        cols: 3,
        items: [
          { e: '📱', t: { en: 'Face unlock', ro: 'Deblocare cu fața' } },
          { e: '📺', t: { en: 'Suggestions', ro: 'Sugestii' } },
          { e: '🔊', t: { en: 'Voice helper', ro: 'Asistent vocal' } },
          { e: '📧', t: { en: 'Spam filter', ro: 'Filtru de spam' } },
          { e: '🗺️', t: { en: 'Best route', ro: 'Cel mai bun drum' } },
          { e: '🎮', t: { en: 'Game characters', ro: 'Personaje din jocuri' } },
        ],
      },
    },
    {
      id: 'p4',
      level: 2,
      title: { en: 'Why not just write rules?', ro: 'De ce nu scriem pur și simplu reguli?' },
      text: {
        en: 'Try writing rules to recognize a cat. *"It has pointy ears."* So does a fox. *"It has whiskers."* So does a seal. *"It has a tail."* Some cats don\'t!\n\nCats can be any color, curled up, half hidden, photographed from above... There are far too many cases to write rules for.\n\nInstead, we show a computer **thousands of labeled photos** of cats and not-cats, and it learns the pattern itself. That is the big idea of machine learning.',
        ro: 'Încearcă să scrii reguli ca să recunoști o pisică. *„Are urechi ascuțite.”* Și vulpea are. *„Are mustăți.”* Și foca are. *„Are coadă.”* Unele pisici nu au!\n\nPisicile pot avea orice culoare, pot sta ghemuite, pe jumătate ascunse, fotografiate de sus... Sunt mult prea multe situații ca să scrii reguli pentru toate.\n\nÎn schimb, îi arătăm calculatorului **mii de fotografii etichetate** cu pisici și non-pisici, iar el învață singur tiparul. Asta e marea idee a învățării automate.',
      },
      visual: (g, t, W, H, T) => {
        const rules = [
          { en: 'Pointy ears', ro: 'Urechi ascuțite' },
          { en: 'Whiskers', ro: 'Mustăți' },
          { en: 'Four legs', ro: 'Patru picioare' },
          { en: 'A tail', ro: 'Coadă' },
          { en: 'Fur', ro: 'Blană' },
        ];
        emoji(g, '🐱', 110, 90, 90);
        emoji(g, '🦊', W - 110, 90, 90);
        text(g, T({ en: 'Cat', ro: 'Pisică' }), 110, 160, { size: 22 });
        text(g, T({ en: 'Fox', ro: 'Vulpe' }), W - 110, 160, { size: 22 });
        rules.forEach((r, i) => {
          const k = ease((t - 0.4 - i * 0.5) * 2);
          if (k <= 0) return;
          const y = 200 + i * 44;
          g.globalAlpha = k;
          box(g, 200, y - 18, W - 400, 36, { fill: '#f6f9ff', r: 10, shadow: false, lw: 2.5 });
          text(g, T(r), W / 2, y, { size: 19 });
          text(g, '✓', 110, y, { size: 28, color: C.mint });
          text(g, '✓', W - 110, y, { size: 28, color: C.mint });
          g.globalAlpha = 1;
        });
        const k = ease((t - 3.2) * 2);
        if (k > 0) {
          g.globalAlpha = k;
          box(g, 70, H - 58, W - 140, 44, { fill: C.sun, r: 14 });
          text(g, T({ en: 'Same rules, different animals! 🤔', ro: 'Aceleași reguli, animale diferite! 🤔' }), W / 2, H - 36, { size: 21 });
          g.globalAlpha = 1;
        }
      },
    },
    {
      id: 'p5',
      level: 2,
      title: { en: 'The three ingredients', ro: 'Cele trei ingrediente' },
      text: {
        en: 'Every machine learning system needs three things:\n\n- **Data**: lots of examples to learn from.\n- **A model**: the part that learns. Think of it as a machine full of little adjustable **knobs**.\n- **Training**: practicing on the data and slowly turning the knobs until the answers get good.\n\nAfter training, the model can make **predictions** about new things it has never seen before.',
        ro: 'Orice sistem de învățare automată are nevoie de trei lucruri:\n\n- **Date**: multe exemple din care să învețe.\n- **Un model**: partea care învață. Gândește-te la el ca la o mașinărie plină de mici **butoane reglabile**.\n- **Antrenare**: exersarea pe date și rotirea încetișor a butoanelor până când răspunsurile devin bune.\n\nDupă antrenare, modelul poate face **predicții** despre lucruri noi, pe care nu le-a mai văzut niciodată.',
      },
      visual: {
        type: 'flow',
        steps: [
          { e: '📚', t: { en: 'Data', ro: 'Date' }, color: '#fff4d6' },
          { e: '⚙️', t: { en: 'Model', ro: 'Model' }, color: '#e6f4ff' },
          { e: '🏋️', t: { en: 'Training', ro: 'Antrenare' }, color: '#eafbe9' },
          { e: '🎯', t: { en: 'Predictions', ro: 'Predicții' }, color: '#ffe9f2' },
        ],
      },
    },
    {
      id: 'p6',
      level: 3,
      title: { en: 'A short history of AI', ro: 'O scurtă istorie a IA' },
      text: {
        en: '- **1950**: Alan Turing asks *"Can machines think?"* and invents a test for it.\n- **1956**: the name *Artificial Intelligence* is born at a summer workshop at Dartmouth College.\n- **1997**: IBM\'s Deep Blue beats the world chess champion, mostly by searching through millions of moves.\n- **2012**: a deep neural network called AlexNet wins a huge picture-recognition contest by far. Deep learning takes off.\n- **2016**: AlphaGo beats champion Lee Sedol at the board game Go.\n- **2022 and after**: chatbots like ChatGPT, Claude and Gemini write and talk in many languages.',
        ro: '- **1950**: Alan Turing întreabă *„Pot mașinile să gândească?”* și inventează un test pentru asta.\n- **1956**: numele de *Inteligență Artificială* apare la un atelier de vară la Dartmouth College.\n- **1997**: Deep Blue de la IBM îl învinge pe campionul mondial de șah, mai ales căutând prin milioane de mutări.\n- **2012**: o rețea neuronală adâncă, numită AlexNet, câștigă cu mult un mare concurs de recunoaștere a pozelor. Învățarea adâncă pornește în forță.\n- **2016**: AlphaGo îl învinge pe campionul Lee Sedol la jocul Go.\n- **2022 și după**: chatboți ca ChatGPT, Claude și Gemini scriu și vorbesc în multe limbi.',
      },
      visual: {
        type: 'timeline',
        events: [
          { y: '1950', e: '🧑‍🔬', t: { en: 'Turing:\n"Can machines\nthink?"', ro: 'Turing:\n„Pot mașinile\nsă gândească?”' } },
          { y: '1956', e: '🏫', t: { en: 'The name\n"AI" is born', ro: 'Apare\nnumele „IA”' } },
          { y: '1997', e: '♟️', t: { en: 'Deep Blue\nwins at chess', ro: 'Deep Blue\ncâștigă la șah' } },
          { y: '2012', e: '🖼️', t: { en: 'Deep learning\nsees pictures', ro: 'Învățarea\nadâncă vede' } },
          { y: '2016', e: '⚫', t: { en: 'AlphaGo\nwins at Go', ro: 'AlphaGo\ncâștigă la Go' } },
          { y: '2022', e: '💬', t: { en: 'Chatbots\ntalk', ro: 'Chatboții\nvorbesc' } },
        ],
      },
    },
    {
      id: 'p7',
      level: 3,
      title: { en: 'Narrow AI and general AI', ro: 'IA îngustă și IA generală' },
      text: {
        en: 'Most AI today is **narrow**: very good at one job. A chess AI can\'t recognize cats, and a cat detector can\'t play chess.\n\nNewer **large language models** can do many different tasks with words, but they still make mistakes, and they don\'t have feelings or experiences the way people do.\n\n**Artificial General Intelligence (AGI)** would be an AI as capable as a person at almost any thinking task. Scientists disagree about when, or even if, it will happen. That is one reason why making AI safe and helpful matters so much.',
        ro: 'Majoritatea IA de azi sunt **înguste**: foarte bune la o singură treabă. O IA de șah nu poate recunoaște pisici, iar un detector de pisici nu poate juca șah.\n\n**Modelele mari de limbaj**, mai noi, pot face multe sarcini diferite cu cuvinte, dar tot greșesc și nu au sentimente sau trăiri așa cum au oamenii.\n\n**Inteligența Artificială Generală (AGI)** ar fi o IA la fel de capabilă ca un om la aproape orice sarcină de gândire. Oamenii de știință nu sunt de acord când va apărea, sau chiar dacă va apărea. Și de aceea contează atât de mult ca IA să fie sigură și de ajutor.',
      },
      visual: {
        type: 'vs',
        left: {
          e: '🔧',
          bg: '#eafbe9',
          title: { en: 'Narrow AI', ro: 'IA îngustă' },
          items: [
            { en: 'One job, done very well', ro: 'O singură treabă, făcută foarte bine' },
            { en: "Chess AI can't see cats", ro: 'IA de șah nu vede pisici' },
            { en: 'Almost all AI today', ro: 'Aproape toate IA de azi' },
          ],
        },
        right: {
          e: '🧰',
          bg: '#f3ecff',
          title: { en: 'General AI', ro: 'IA generală' },
          items: [
            { en: 'Almost any thinking task', ro: 'Aproape orice sarcină de gândire' },
            { en: 'Does not exist yet', ro: 'Încă nu există' },
            { en: 'Scientists still debate it', ro: 'Oamenii de știință încă dezbat' },
          ],
        },
      },
    },
  ],
  experiments: [
    { id: 'aiOrNot', req: 1 },
    { id: 'ruleBuilder', req: 2 },
  ],
  quiz: [
    {
      level: 1,
      q: { en: 'What does "AI" stand for?', ro: 'Ce înseamnă „IA”?' },
      a: [
        { en: 'Artificial Intelligence', ro: 'Inteligență Artificială' },
        { en: 'Automatic Internet', ro: 'Internet Automat' },
        { en: 'Amazing Ideas', ro: 'Idei Uimitoare' },
        { en: 'Animal Information', ro: 'Informații despre Animale' },
      ],
      c: 0,
      why: { en: 'AI means Artificial Intelligence: intelligence that people built into machines.', ro: 'IA înseamnă Inteligență Artificială: inteligență construită de oameni în mașini.' },
    },
    {
      level: 1,
      q: { en: 'In machine learning, how does a computer learn?', ro: 'În învățarea automată, cum învață un calculator?' },
      a: [
        { en: 'By looking at lots of examples', ro: 'Uitându-se la multe exemple' },
        { en: 'By sleeping at night', ro: 'Dormind noaptea' },
        { en: 'By reading your mind', ro: 'Citindu-ți gândurile' },
        { en: 'It can never learn', ro: 'Nu poate învăța niciodată' },
      ],
      c: 0,
      why: { en: 'Machine learning means finding patterns in many examples, instead of following rules written by hand.', ro: 'Învățarea automată înseamnă găsirea tiparelor în multe exemple, în loc să urmezi reguli scrise de mână.' },
    },
    {
      level: 1,
      e: '📱',
      q: { en: 'Which of these uses AI?', ro: 'Care dintre acestea folosește IA?' },
      a: [
        { en: 'A phone that unlocks when it sees your face', ro: 'Un telefon care se deblochează când îți vede fața' },
        { en: 'A light switch', ro: 'Un întrerupător de lumină' },
        { en: 'A pencil', ro: 'Un creion' },
        { en: 'A paper map', ro: 'O hartă de hârtie' },
      ],
      c: 0,
      why: { en: 'Face unlock uses an AI that learned what your face looks like. A light switch just follows one simple rule.', ro: 'Deblocarea cu fața folosește o IA care a învățat cum arată fața ta. Un întrerupător urmează doar o regulă simplă.' },
    },
    {
      level: 1,
      tf: true,
      q: { en: 'True or false: AI is magic and it is alive.', ro: 'Adevărat sau fals: IA este magie și este vie.' },
      c: false,
      why: { en: 'False! AI is math, data and computers working together. It is not magic and it is not alive.', ro: 'Fals! IA înseamnă matematică, date și calculatoare care lucrează împreună. Nu e magie și nu e vie.' },
    },
    {
      level: 1,
      tf: true,
      e: '🧮',
      q: { en: 'True or false: a calculator that always follows the same fixed rules is a good example of machine learning.', ro: 'Adevărat sau fals: un calculator de buzunar care urmează mereu aceleași reguli fixe este un bun exemplu de învățare automată.' },
      c: false,
      why: { en: 'False. A calculator follows fixed rules written by people. It never learns from examples.', ro: 'Fals. Un calculator de buzunar urmează reguli fixe scrise de oameni. Nu învață niciodată din exemple.' },
    },
    {
      level: 1,
      q: { en: 'What does "artificial" mean in "Artificial Intelligence"?', ro: 'Ce înseamnă „artificial” în „Inteligență Artificială”?' },
      a: [
        { en: 'Made by people', ro: 'Făcut de oameni' },
        { en: 'Found in nature', ro: 'Găsit în natură' },
        { en: 'Very fast', ro: 'Foarte rapid' },
        { en: 'Invisible', ro: 'Invizibil' },
      ],
      c: 0,
      why: { en: 'Artificial means made by people, like artificial flowers or an artificial lake.', ro: 'Artificial înseamnă făcut de oameni, ca florile artificiale sau un lac artificial.' },
    },
    {
      level: 2,
      q: { en: 'Why is it hard to write rules to recognize a cat?', ro: 'De ce este greu să scrii reguli ca să recunoști o pisică?' },
      a: [
        { en: 'Cats look very different in photos, and other animals share cat features', ro: 'Pisicile arată foarte diferit în poze, iar alte animale au aceleași trăsături' },
        { en: 'Cats are invisible to cameras', ro: 'Pisicile sunt invizibile pentru camere' },
        { en: 'Computers cannot follow rules', ro: 'Calculatoarele nu pot urma reguli' },
        { en: 'Writing rules is not allowed', ro: 'Nu este voie să scrii reguli' },
      ],
      c: 0,
      why: { en: 'Foxes also have pointy ears and whiskers, and cats can be any color or pose. Learning from examples works much better.', ro: 'Și vulpile au urechi ascuțite și mustăți, iar pisicile pot avea orice culoare sau poziție. Învățarea din exemple funcționează mult mai bine.' },
    },
    {
      level: 2,
      q: { en: 'What are the three main ingredients of machine learning?', ro: 'Care sunt cele trei ingrediente principale ale învățării automate?' },
      a: [
        { en: 'Data, a model and training', ro: 'Date, un model și antrenare' },
        { en: 'Wires, glue and paint', ro: 'Fire, lipici și vopsea' },
        { en: 'Keyboard, mouse and screen', ro: 'Tastatură, mouse și ecran' },
        { en: 'Luck, magic and time', ro: 'Noroc, magie și timp' },
      ],
      c: 0,
      why: { en: 'Data gives examples, the model learns, and training adjusts the model until it gets good.', ro: 'Datele dau exemple, modelul învață, iar antrenarea ajustează modelul până devine bun.' },
    },
    {
      level: 2,
      q: { en: 'What is a "model" in AI?', ro: 'Ce este un „model” în IA?' },
      a: [
        { en: 'The part that learns, like a math machine with adjustable knobs', ro: 'Partea care învață, ca o mașinărie matematică cu butoane reglabile' },
        { en: 'A toy airplane', ro: 'Un avion de jucărie' },
        { en: 'A person who poses for photos', ro: 'O persoană care pozează pentru fotografii' },
        { en: 'The computer screen', ro: 'Ecranul calculatorului' },
      ],
      c: 0,
      why: { en: 'In AI, the model is the learning part. Training turns its knobs so its answers get better.', ro: 'În IA, modelul este partea care învață. Antrenarea îi rotește butoanele ca răspunsurile să devină mai bune.' },
    },
    {
      level: 3,
      q: { en: 'Who asked "Can machines think?" in 1950?', ro: 'Cine a întrebat „Pot mașinile să gândească?” în 1950?' },
      a: [
        { en: 'Alan Turing', ro: 'Alan Turing' },
        { en: 'Isaac Newton', ro: 'Isaac Newton' },
        { en: 'Marie Curie', ro: 'Marie Curie' },
        { en: 'Leonardo da Vinci', ro: 'Leonardo da Vinci' },
      ],
      c: 0,
      why: { en: 'Alan Turing asked this in 1950 and proposed the famous Turing Test.', ro: 'Alan Turing a întrebat asta în 1950 și a propus faimosul Test Turing.' },
    },
    {
      level: 3,
      q: { en: 'What is "narrow AI"?', ro: 'Ce este „IA îngustă”?' },
      a: [
        { en: 'AI that is very good at one specific task', ro: 'IA foarte bună la o singură sarcină anume' },
        { en: 'AI that is very thin', ro: 'IA foarte subțire' },
        { en: 'AI that can do everything a human can', ro: 'IA care poate face tot ce poate face un om' },
        { en: 'AI that only works in small rooms', ro: 'IA care merge doar în camere mici' },
      ],
      c: 0,
      why: { en: 'Narrow AI is specialized: a chess AI plays chess, a translator translates. Most AI today is narrow.', ro: 'IA îngustă este specializată: o IA de șah joacă șah, un traducător traduce. Majoritatea IA de azi sunt înguste.' },
    },
    {
      level: 3,
      q: { en: 'When did the name "Artificial Intelligence" first appear at a workshop?', ro: 'Când a apărut prima dată numele „Inteligență Artificială” la un atelier?' },
      a: [
        { en: '1956', ro: '1956' },
        { en: '1856', ro: '1856' },
        { en: '1999', ro: '1999' },
        { en: '2020', ro: '2020' },
      ],
      c: 0,
      why: { en: 'The name was coined for the Dartmouth summer workshop in 1956.', ro: 'Numele a fost inventat pentru atelierul de vară de la Dartmouth, în 1956.' },
    },
    {
      level: 3,
      tf: true,
      e: '⚫',
      q: { en: 'True or false: AlphaGo beat a world champion at the game Go in 2016.', ro: 'Adevărat sau fals: AlphaGo a învins un campion mondial la jocul Go în 2016.' },
      c: true,
      why: { en: 'True. AlphaGo beat Lee Sedol in 2016, something many experts thought would take many more years.', ro: 'Adevărat. AlphaGo l-a învins pe Lee Sedol în 2016, lucru despre care mulți experți credeau că va mai dura mulți ani.' },
    },
  ],
};
