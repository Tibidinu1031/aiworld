import { state, bus } from './state.js';

// All sounds are synthesized with the Web Audio API, so the game ships no audio files.
let ac = null;
let master = null;
let ambience = null;

// Sound only ever starts after the player really clicked or pressed a key.
function userHasInteracted() {
  const ua = navigator.userActivation;
  return !ua || ua.hasBeenActive;
}

function ctx() {
  if (!ac) {
    if (!userHasInteracted()) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ac = new AC();
    master = ac.createGain();
    master.gain.value = 0.55;
    master.connect(ac.destination);
  }
  if (ac.state === 'suspended' && !document.hidden) ac.resume();
  return ac;
}

export function unlockAudio() {
  if (!ctx()) return;
  startAmbience();
}

// Go quiet when the game's tab is hidden or the window is minimized; come back when it's visible.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopSpeaking();
  if (!ac) return;
  if (document.hidden) ac.suspend();
  else ac.resume();
});
window.addEventListener('pagehide', () => {
  stopSpeaking();
  if (ac) ac.close();
  ac = null;
  master = null;
  ambience = null;
});

function tone({ f = 440, f2 = null, dur = 0.15, type = 'sine', vol = 0.3, delay = 0, attack = 0.005 }) {
  const a = ctx();
  if (!a || !state.sound) return;
  const t0 = a.currentTime + delay;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f, t0);
  if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(master);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

function noise({ dur = 0.3, vol = 0.3, filter = 1200, q = 1, delay = 0, type = 'lowpass', sweep = null }) {
  const a = ctx();
  if (!a || !state.sound) return;
  const t0 = a.currentTime + delay;
  const len = Math.floor(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const bf = a.createBiquadFilter();
  bf.type = type;
  bf.frequency.setValueAtTime(filter, t0);
  if (sweep) bf.frequency.exponentialRampToValueAtTime(sweep, t0 + dur);
  bf.Q.value = q;
  const g = a.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(bf).connect(g).connect(master);
  src.start(t0);
}

const SFX = {
  click: () => tone({ f: 660, f2: 880, dur: 0.06, type: 'triangle', vol: 0.18 }),
  hover: () => tone({ f: 900, dur: 0.03, type: 'sine', vol: 0.05 }),
  open: () => {
    tone({ f: 440, f2: 880, dur: 0.18, type: 'triangle', vol: 0.2 });
    tone({ f: 660, f2: 1320, dur: 0.18, type: 'sine', vol: 0.1, delay: 0.05 });
  },
  close: () => tone({ f: 700, f2: 350, dur: 0.15, type: 'triangle', vol: 0.15 }),
  jump: () => tone({ f: 300, f2: 620, dur: 0.16, type: 'square', vol: 0.06 }),
  land: () => noise({ dur: 0.12, vol: 0.25, filter: 300 }),
  kick: () => {
    noise({ dur: 0.08, vol: 0.4, filter: 900 });
    tone({ f: 160, f2: 60, dur: 0.12, type: 'sine', vol: 0.35 });
  },
  bounce: () => tone({ f: 220, f2: 140, dur: 0.07, type: 'sine', vol: 0.12 }),
  splash: () => {
    noise({ dur: 0.6, vol: 0.4, filter: 2500, sweep: 400 });
    tone({ f: 500, f2: 120, dur: 0.3, type: 'sine', vol: 0.12 });
  },
  pop: () => {
    tone({ f: 880, f2: 1760, dur: 0.12, type: 'sine', vol: 0.25 });
    tone({ f: 1320, f2: 2640, dur: 0.15, type: 'triangle', vol: 0.12, delay: 0.06 });
  },
  good: () => {
    tone({ f: 660, dur: 0.1, type: 'triangle', vol: 0.22 });
    tone({ f: 880, dur: 0.16, type: 'triangle', vol: 0.22, delay: 0.09 });
  },
  bad: () => {
    tone({ f: 300, f2: 220, dur: 0.22, type: 'sawtooth', vol: 0.08 });
    tone({ f: 240, f2: 180, dur: 0.25, type: 'triangle', vol: 0.12, delay: 0.05 });
  },
  win: () => {
    [523, 659, 784, 1047].forEach((f, i) => tone({ f, dur: 0.22, type: 'triangle', vol: 0.22, delay: i * 0.11 }));
    tone({ f: 1568, dur: 0.5, type: 'sine', vol: 0.12, delay: 0.46 });
  },
  fanfare: () => {
    const notes = [523, 523, 659, 784, 659, 784, 1047];
    notes.forEach((f, i) => tone({ f, dur: 0.25, type: 'square', vol: 0.07, delay: i * 0.14 }));
    notes.forEach((f, i) => tone({ f: f / 2, dur: 0.25, type: 'triangle', vol: 0.15, delay: i * 0.14 }));
  },
  whoosh: () => noise({ dur: 0.7, vol: 0.35, filter: 300, sweep: 4000, type: 'bandpass', q: 2 }),
  build: () => tone({ f: 180 + Math.random() * 60, dur: 0.06, type: 'square', vol: 0.05 }),
  beep: () => tone({ f: 700 + Math.random() * 500, dur: 0.05, type: 'square', vol: 0.03 }),
  blip: () => tone({ f: 520 + Math.random() * 300, dur: 0.04, type: 'sine', vol: 0.08 }),
  launch: () => {
    noise({ dur: 0.25, vol: 0.3, filter: 600, sweep: 2000 });
    tone({ f: 200, f2: 500, dur: 0.2, type: 'sine', vol: 0.15 });
  },
  step: () => tone({ f: 1200, dur: 0.02, type: 'sine', vol: 0.02 }),
};

export function sfx(name) {
  try {
    SFX[name] && SFX[name]();
  } catch {
    /* audio is optional */
  }
}

// Gentle ocean ambience: looping filtered noise with a slow swell.
function startAmbience() {
  const a = ctx();
  if (!a || ambience) return;
  const len = a.sampleRate * 4;
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = last * 0.97 + (Math.random() * 2 - 1) * 0.03;
    d[i] = last * 3;
  }
  const src = a.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 500;
  const g = a.createGain();
  g.gain.value = 0;
  const lfo = a.createOscillator();
  lfo.frequency.value = 0.09;
  const lfoGain = a.createGain();
  lfoGain.gain.value = 0.05;
  lfo.connect(lfoGain).connect(g.gain);
  src.connect(lp).connect(g).connect(master);
  src.start();
  lfo.start();
  ambience = { g, base: 0.09 };
  setAmbience(state.sound);
}

export function setAmbience(on) {
  if (!ambience || !ac) return;
  ambience.g.gain.cancelScheduledValues(ac.currentTime);
  ambience.g.gain.linearRampToValueAtTime(on ? ambience.base : 0, ac.currentTime + 0.5);
}

// ---------- Text to speech ----------
// Browsers ship very different voices. Natural (neural) voices sound human; the old
// "Desktop" voices sound robotic. We rank what the device has and pick the best one,
// and we never read Romanian with an English voice.
let voices = [];
const listeners = [];
function refreshVoices() {
  try {
    voices = window.speechSynthesis ? window.speechSynthesis.getVoices() : [];
  } catch {
    voices = [];
  }
  listeners.forEach((f) => f());
}
if (typeof window !== 'undefined' && window.speechSynthesis) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
  // Some browsers fill the list late and never fire the event.
  setTimeout(refreshVoices, 1200);
}

export function onVoicesChanged(fn) {
  listeners.push(fn);
}

export function canSpeak() {
  return typeof window !== 'undefined' && !!window.speechSynthesis;
}

const NATURAL = /natural|neural|online|google|premium|enhanced|siri|wavenet/i;
// Friendly voices that suit Bip (Ana is a child voice in Microsoft Edge).
const FAVORITES = { en: /\b(ana|aria|jenny|emma|ava|libby|sonia|samantha|google us english)\b/i, ro: /\b(alina|emil|ioana|andrei)\b/i };

export function isNaturalVoice(v) {
  return !!v && NATURAL.test(v.name) && !/desktop/i.test(v.name);
}

function score(v, lang) {
  let sc = 0;
  const vl = (v.lang || '').toLowerCase().replace('_', '-');
  if (lang === 'en') sc += vl === 'en-us' ? 20 : vl === 'en-gb' ? 15 : 10;
  if (NATURAL.test(v.name)) sc += 100;
  if (FAVORITES[lang].test(v.name)) sc += 25;
  if (/desktop|espeak/i.test(v.name)) sc -= 40;
  if (/zira|hazel|susan/i.test(v.name)) sc += 5; // clearest of the basic Windows voices
  if (v.localService === false) sc += 5;
  return sc;
}

// All voices for a language, best first.
export function voicesFor(lang) {
  return voices
    .filter((v) => (v.lang || '').toLowerCase().replace('_', '-').startsWith(lang))
    .sort((a, b) => score(b, lang) - score(a, lang));
}

export function pickVoice(lang) {
  const list = voicesFor(lang);
  const chosen = lang === 'ro' ? state.voiceRo : state.voiceEn;
  return (chosen && list.find((v) => v.name === chosen)) || list[0] || null;
}

// Split long text into sentences; Chrome stops long utterances after ~15 seconds.
function chunks(text) {
  const parts = text.match(/[^.!?…]+[.!?…]*["”»)]*\s*/g) || [text];
  const out = [];
  let cur = '';
  for (const p of parts) {
    if ((cur + p).length > 180 && cur) {
      out.push(cur.trim());
      cur = p;
    } else cur += p;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

let speakToken = 0;
export function speak(text, onEnd, langOverride) {
  if (!canSpeak()) return false;
  stopSpeaking();
  const clean = String(text)
    .replace(/<[^>]+>/g, ' ')
    .replace(/[*_#`]/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return false;
  const lang = langOverride || (state.lang === 'ro' ? 'ro' : 'en');
  const v = pickVoice(lang);
  if (!v) {
    bus.emit('novoice', lang);
    if (onEnd) onEnd();
    return false;
  }
  const natural = isNaturalVoice(v);
  const token = ++speakToken;
  const list = chunks(clean);
  list.forEach((part, i) => {
    const u = new SpeechSynthesisUtterance(part);
    u.voice = v;
    u.lang = v.lang;
    u.rate = natural ? 1 : 0.9;
    u.pitch = 1;
    if (i === list.length - 1 && onEnd) u.onend = () => token === speakToken && onEnd();
    window.speechSynthesis.speak(u);
  });
  return true;
}

export function stopSpeaking() {
  speakToken++;
  try {
    window.speechSynthesis && window.speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}
