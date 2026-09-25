import { STATIONS } from './index.js';
import { sp, state } from '../state.js';

export function pagesFor(id, level = state.level) {
  return STATIONS[id].pages.filter((p) => (p.level || 1) <= level);
}

export function expsFor(id, level = state.level) {
  return STATIONS[id].experiments.filter((e) => (e.min || 1) <= level);
}

export function requiredExps(id, level = state.level) {
  return STATIONS[id].experiments.filter((e) => (e.req || 1) <= level);
}

export function learnDone(id, level = state.level) {
  const seen = sp(id).seen;
  return pagesFor(id, level).every((p) => seen.includes(p.id));
}

export function expsDone(id, level = state.level) {
  const done = sp(id).exps;
  return requiredExps(id, level).every((e) => done.includes(e.id));
}

export function testUnlocked(id, level = state.level) {
  return learnDone(id, level) && expsDone(id, level);
}
