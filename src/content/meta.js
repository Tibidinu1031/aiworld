import { STATION_COLORS } from '../world/layout.js';

// Short station info used by the 3D world, the map and the HUD.
export const STATION_META = [
  { id: 's1', icon: '🤖', title: { en: 'What is AI?', ro: 'Ce este IA?' } },
  { id: 's2', icon: '🍎', title: { en: 'Data: Food for AI', ro: 'Datele: hrana IA' } },
  { id: 's3', icon: '📏', title: { en: 'Features & Patterns', ro: 'Trăsături și tipare' } },
  { id: 's4', icon: '🎯', title: { en: 'Classification', ro: 'Clasificarea' } },
  { id: 's5', icon: '⛰️', title: { en: 'Training: Learning from Mistakes', ro: 'Antrenarea: învățăm din greșeli' } },
  { id: 's6', icon: '⚡', title: { en: 'The Artificial Neuron', ro: 'Neuronul artificial' } },
  { id: 's7', icon: '🕸️', title: { en: 'Neural Networks', ro: 'Rețele neuronale' } },
  { id: 's8', icon: '👁️', title: { en: 'Computer Vision', ro: 'Vederea artificială' } },
  { id: 's9', icon: '🎓', title: { en: 'Memorizing vs Understanding', ro: 'Pe de rost sau pe înțeles?' } },
  { id: 's10', icon: '🫧', title: { en: 'Clustering', ro: 'Gruparea' } },
  { id: 's11', icon: '🏆', title: { en: 'Learning from Rewards', ro: 'Învățarea prin recompense' } },
  { id: 's12', icon: '💬', title: { en: 'Language AI & Chatbots', ro: 'IA care vorbește' } },
  { id: 's13', icon: '🛡️', title: { en: 'Fair & Safe AI', ro: 'IA corectă și sigură' } },
].map((m, i) => ({ ...m, num: i + 1, color: STATION_COLORS[i] }));

export function metaById(id) {
  return STATION_META.find((m) => m.id === id);
}
