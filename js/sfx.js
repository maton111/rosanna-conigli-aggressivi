// ============================================================================
//  sfx.js — suoni 8-bit generati al volo con WebAudio (nessun file audio).
// ============================================================================
let ctx = null;
let muted = false;

try {
  muted = localStorage.getItem("rosanna-conigli-muto") === "1";
} catch {
  /* localStorage non disponibile: pazienza */
}

// Va chiamato dentro un gesto dell'utente (click su START).
export function initAudio() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
}

export function isMuted() {
  return muted;
}
export function setMuted(m) {
  muted = !!m;
  try {
    localStorage.setItem("rosanna-conigli-muto", muted ? "1" : "0");
  } catch {
    /* ignora */
  }
}

function tone(freq, start, dur, type = "square", vol = 0.07, slide = 0) {
  if (!ctx || muted) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

const seq = (notes, step, dur, type, vol) => notes.forEach((f, i) => tone(f, i * step, dur, type, vol));

export const sfx = {
  start: () => seq([440, 554, 659, 880], 0.08, 0.16, "square", 0.06),
  tap: () => tone(220, 0, 0.06, "square", 0.05),
  growl: () => tone(90, 0, 0.14, "sawtooth", 0.025, -40),
  sweet: () => seq([523, 659, 784, 1046], 0.07, 0.14, "square", 0.06),
  talk: () => seq([660, 880], 0.05, 0.06, "square", 0.04),
  carrot: () => tone(600, 0, 0.09, "triangle", 0.09, 350),
  poof: () => tone(220, 0, 0.18, "triangle", 0.05, -160),
  golden: () => seq([880, 1108, 1318, 1760, 2093], 0.06, 0.22, "triangle", 0.06),
  quest: () => seq([392, 523, 659, 784, 1046], 0.1, 0.2, "square", 0.06),
  complete: () => seq([523, 659, 784, 1046, 784, 1046, 1318, 1568], 0.12, 0.28, "square", 0.06),
};
