import { STATION_META } from './meta.js';
import { sp, state } from '../state.js';
import { L } from '../i18n.js';
import { learnDone, expsDone } from './progress.js';

// The opening scene.
export const INTRO = [
  { who: 'bip', mood: 'happy', text: { en: 'Beep boop! Hello, {name}! I am Bip, a little robot.', ro: 'Bip bip! Salut, {name}! Eu sunt Bip, un roboțel.' } },
  { who: 'bip', text: { en: 'Last night a huge storm hit Neura Island, and a lightning bolt scrambled my brain. I forgot everything about how I think!', ro: 'Azi-noapte o furtună uriașă a lovit Insula Neura și un fulger mi-a încurcat creierul. Am uitat tot despre cum gândesc!' } },
  { who: 'ada', text: { en: "Don't worry, Bip. I am Professor Ada. I'm a hologram, so I can pop up on any island to help you.", ro: 'Nu-ți face griji, Bip. Eu sunt profesoara Ada. Sunt o hologramă, așa că pot apărea pe orice insulă ca să te ajut.' } },
  { who: 'ada', text: { en: "Bip's brain is an artificial intelligence, an AI. Around this island there are 13 learning stations. Each one teaches one piece of how AI works.", ro: 'Creierul lui Bip este o inteligență artificială, pe scurt IA (în engleză AI). În jurul acestei insule sunt 13 stații de învățare. Fiecare te învață o bucățică din felul în care funcționează IA.' } },
  { who: 'ada', text: { en: 'At every station: read the lessons, play with the experiments, then pass a short test. Every test you pass gives you a Knowledge Core.', ro: 'La fiecare stație: citește lecțiile, joacă-te cu experimentele, apoi trece un test scurt. Fiecare test trecut îți aduce un Nucleu de cunoaștere.' } },
  { who: 'ada', text: { en: 'Each core lights up one layer of the Core Tower behind me, and a new bridge appears. Collect all 13 to restore Bip completely!', ro: 'Fiecare nucleu aprinde un strat al Turnului Nucleului din spatele meu și apare un pod nou. Adună toate cele 13 ca să-l refaci complet pe Bip!' } },
  { who: 'bip', mood: 'happy', text: { en: '{name}, will you help me? Move with W A S D, drag the mouse to look around, and jump with Space. Follow the golden light to Station 1!', ro: '{name}, mă ajuți? Mergi cu W A S D, trage cu mouse-ul ca să te uiți în jur și sari cu Spațiu. Urmează lumina aurie spre Stația 1!' } },
];

export function stationPassedLines(meta) {
  if (meta.num === 13) {
    return [
      { who: 'bip', mood: 'happy', text: { en: 'Thirteen cores! My brain feels so... organized! Beep!', ro: 'Treisprezece nuclee! Creierul meu se simte atât de... ordonat! Bip!' } },
      { who: 'ada', text: { en: 'Wonderful work, {name}! A final bridge now leads back to the Core Tower. Go there for the Final Challenge.', ro: 'Treabă minunată, {name}! Un ultim pod duce acum înapoi la Turnul Nucleului. Mergi acolo pentru Provocarea Finală.' } },
    ];
  }
  const next = STATION_META[meta.num];
  const cheers = [
    { en: 'Brilliant!', ro: 'Genial!' },
    { en: 'Excellent!', ro: 'Excelent!' },
    { en: 'Well done!', ro: 'Bravo!' },
    { en: 'Fantastic!', ro: 'Fantastic!' },
  ];
  const cheer = cheers[meta.num % cheers.length];
  return [
    { who: 'ada', text: { en: `${cheer.en} You earned Knowledge Core ${meta.num}. Look at the tower: another layer is glowing.`, ro: `${cheer.ro} Ai câștigat Nucleul de cunoaștere ${meta.num}. Uită-te la turn: încă un strat strălucește.` } },
    { who: 'bip', mood: 'happy', text: { en: `I can feel it! A bridge to Station ${next.num}, "${next.title.en}", is being built. Let's go!`, ro: `Simt asta! Se construiește un pod spre Stația ${next.num}, „${next.title.ro}”. Hai să mergem!` } },
  ];
}

export function finalLines() {
  return [
    { who: 'bip', mood: 'happy', text: { en: 'BEEP BEEP BOOP! All my layers are glowing! I remember everything: data, features, neurons, training, rewards, language... and being fair and safe.', ro: 'BIP BIP BUP! Toate straturile mele strălucesc! Îmi amintesc tot: date, trăsături, neuroni, antrenare, recompense, limbaj... și cum să fiu corect și sigur.' } },
    { who: 'ada', text: { en: 'You did more than fix Bip, {name}. You now understand how AI really works. That is a superpower. Use it wisely!', ro: 'Ai făcut mai mult decât să-l repari pe Bip, {name}. Acum înțelegi cum funcționează cu adevărat IA. Asta e o superputere. Folosește-o cu înțelepciune!' } },
    { who: 'ada', text: { en: 'Your certificate is at the tower terminal. You can keep exploring, collect every Data Crystal, or replay stations at a harder level.', ro: 'Diploma ta te așteaptă la terminalul turnului. Poți explora mai departe, poți aduna toate Cristalele de date sau poți relua stațiile la un nivel mai greu.' } },
  ];
}

// What Professor Ada says when you talk to her.
export function adaTalk(game, isl) {
  if (!isl || isl.id === 'hub') {
    const passed = STATION_META.filter((m) => sp(m.id).passed).length;
    if (state.finalPassed) {
      return [{ who: 'ada', text: { en: 'Bip is fully restored. Try a harder level, kick some balls into the sea, or hunt for the last Data Crystals!', ro: 'Bip este complet refăcut. Încearcă un nivel mai greu, lovește câteva mingi în mare sau caută ultimele Cristale de date!' } }];
    }
    if (passed === 13) return [{ who: 'ada', text: { en: 'All 13 cores! Step up to the terminal at the foot of the tower for the Final Challenge.', ro: 'Toate cele 13 nuclee! Apropie-te de terminalul de la baza turnului pentru Provocarea Finală.' } }];
    return [
      { who: 'ada', text: { en: `You have ${passed} of 13 cores. The golden light always shows where to go next.`, ro: `Ai ${passed} din 13 nuclee. Lumina aurie îți arată mereu unde să mergi mai departe.` } },
      { who: 'ada', text: { en: 'Tip: the balls near the hill obey real physics. Kick them with F and watch what gravity and mass do. The signs with an "i" explain it.', ro: 'Sfat: mingile de lângă deal respectă fizica adevărată. Lovește-le cu F și vezi ce fac gravitația și masa. Panourile cu „i” explică totul.' } },
      { who: 'ada', text: { en: 'Stand on a glowing teleport pad and press E to jump to any station you have unlocked. You can also press M.', ro: 'Stai pe o platformă de teleportare luminoasă și apasă E ca să sari la orice stație deblocată. Poți apăsa și M.' } },
    ];
  }
  const meta = STATION_META[isl.idx];
  const p = sp(meta.id);
  if (!game.world.isUnlocked(meta.id)) {
    return [{ who: 'ada', text: { en: `Station ${meta.num} is still locked. Pass Station ${meta.num - 1} first!`, ro: `Stația ${meta.num} este încă încuiată. Trece mai întâi de Stația ${meta.num - 1}!` } }];
  }
  if (p.passed) {
    return [
      { who: 'ada', text: { en: `You already passed "${L(meta.title)}". You can come back any time to replay the experiments or try the test again.`, ro: `Ai trecut deja de „${L(meta.title)}”. Poți reveni oricând să te joci din nou cu experimentele sau să dai testul iar.` } },
    ];
  }
  if (!learnDone(meta.id)) {
    return [
      { who: 'ada', text: { en: `Welcome to Station ${meta.num}: "${L(meta.title)}". Press E at the terminal next to me and start with the lessons.`, ro: `Bine ai venit la Stația ${meta.num}: „${L(meta.title)}”. Apasă E la terminalul de lângă mine și începe cu lecțiile.` } },
      { who: 'ada', text: { en: 'And look around the island: the big model here shows the same idea in 3D. Read the sign with the "i"!', ro: 'Și uită-te în jur pe insulă: modelul mare de aici arată aceeași idee în 3D. Citește panoul cu „i”!' } },
    ];
  }
  if (!expsDone(meta.id)) {
    return [{ who: 'ada', text: { en: 'Great reading! Now open the Experiments tab at the terminal. Doing is the best way to understand.', ro: 'Ai citit foarte bine! Acum deschide fila Experimente de la terminal. Cel mai bine înțelegi făcând.' } }];
  }
  return [{ who: 'ada', text: { en: "You're ready for the test! Don't worry about mistakes: I'll explain every answer.", ro: 'Ești gata de test! Nu-ți face griji pentru greșeli: îți explic fiecare răspuns.' } }];
}
