// SVG faces for the dialog boxes and lesson bubbles.
export function bipFace(size = 64, mood = 'normal') {
  const eyes =
    mood === 'happy'
      ? `<path d="M31 50 q7 -9 14 0" stroke="#5ff3ff" stroke-width="5" fill="none" stroke-linecap="round"/>
         <path d="M55 50 q7 -9 14 0" stroke="#5ff3ff" stroke-width="5" fill="none" stroke-linecap="round"/>`
      : `<rect x="33" y="40" width="10" height="17" rx="5" fill="#5ff3ff"/>
         <rect x="57" y="40" width="10" height="17" rx="5" fill="#5ff3ff"/>`;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">
    <line x1="50" y1="18" x2="50" y2="6" stroke="#1d2340" stroke-width="3"/>
    <circle cx="50" cy="6" r="5" fill="#ffd23f" stroke="#1d2340" stroke-width="2"/>
    <rect x="6" y="40" width="10" height="22" rx="4" fill="#ff6b3d" stroke="#1d2340" stroke-width="2.5"/>
    <rect x="84" y="40" width="10" height="22" rx="4" fill="#ff6b3d" stroke="#1d2340" stroke-width="2.5"/>
    <rect x="13" y="18" width="74" height="66" rx="22" fill="#f4f6fb" stroke="#1d2340" stroke-width="3.5"/>
    <rect x="22" y="30" width="56" height="42" rx="13" fill="#1b2238"/>
    ${eyes}
    <path d="M42 63 q8 6 16 0" stroke="#5ff3ff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

export function adaFace(size = 64) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">
    <line x1="50" y1="18" x2="50" y2="6" stroke="#1d2340" stroke-width="3"/>
    <circle cx="50" cy="6" r="5" fill="#ff8fd0" stroke="#1d2340" stroke-width="2"/>
    <rect x="6" y="40" width="10" height="22" rx="4" fill="#b388ff" stroke="#1d2340" stroke-width="2.5"/>
    <rect x="84" y="40" width="10" height="22" rx="4" fill="#b388ff" stroke="#1d2340" stroke-width="2.5"/>
    <rect x="13" y="18" width="74" height="66" rx="22" fill="#e4dbff" stroke="#1d2340" stroke-width="3.5"/>
    <rect x="22" y="30" width="56" height="42" rx="13" fill="#2a1d5c"/>
    <circle cx="38" cy="48" r="9" fill="none" stroke="#ffe082" stroke-width="3"/>
    <circle cx="62" cy="48" r="9" fill="none" stroke="#ffe082" stroke-width="3"/>
    <line x1="47" y1="47" x2="53" y2="47" stroke="#ffe082" stroke-width="3"/>
    <circle cx="38" cy="48" r="3.5" fill="#ffffff"/>
    <circle cx="62" cy="48" r="3.5" fill="#ffffff"/>
    <path d="M43 63 q7 5 14 0" stroke="#ffffff" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}

export function face(who, size, mood) {
  return who === 'ada' ? adaFace(size) : bipFace(size, mood);
}
