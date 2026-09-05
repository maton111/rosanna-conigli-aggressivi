// ============================================================================
//  quests.js — verifica delle quest, salvataggio del progresso, testo nascosto.
// ============================================================================
import {
  QUESTS, HIDDEN_TEXT, STORAGE_KEY, SWEET3_TARGET, CARROT_COUNT, FAST_QUEST_SECONDS,
} from "./config.js";

// Logica per ogni id di quest: progress(stato) -> testo, check(stato) -> completata?
const LOGIC = {
  sweet3: {
    progress: (s) => `${Math.min(s.sweet, SWEET3_TARGET)}/${SWEET3_TARGET}`,
    check: (s) => s.sweet >= SWEET3_TARGET,
  },
  sweetAll: {
    progress: (s) => `${s.sweet}/${s.total}`,
    check: (s) => s.total > 0 && s.sweet >= s.total,
  },
  golden: {
    progress: (s) => (s.golden ? "1/1" : "0/1"),
    check: (s) => s.golden,
  },
  carrots: {
    progress: (s) => `${Math.min(s.carrots, CARROT_COUNT)}/${CARROT_COUNT}`,
    check: (s) => s.carrots >= CARROT_COUNT,
  },
  fast: {
    progress: (s) => (s.fast ? "fatto!" : `< ${FAST_QUEST_SECONDS}s`),
    check: (s) => s.fast,
  },
};

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && typeof data === "object" && data.done && typeof data.done === "object") return data;
    }
  } catch {
    /* niente storage: si riparte da zero */
  }
  return { done: {} };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* ignora */
  }
}

export function resetProgress() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignora */
  }
}

export class QuestTracker {
  constructor({ onComplete, onAllComplete, onUpdate } = {}) {
    this.onComplete = onComplete;
    this.onAllComplete = onAllComplete;
    this.onUpdate = onUpdate;
    this.progress = loadProgress();
    this.state = { sweet: 0, total: 0, golden: false, carrots: 0, fast: false };
  }

  get quests() {
    return QUESTS;
  }
  isDone(id) {
    return !!this.progress.done[id];
  }
  get doneCount() {
    return QUESTS.filter((q) => this.isDone(q.id)).length;
  }
  get allDone() {
    return QUESTS.length > 0 && this.doneCount === QUESTS.length;
  }
  progressText(q) {
    const logic = LOGIC[q.id];
    return logic ? logic.progress(this.state) : "";
  }

  // Aggiorna lo stato di gioco e controlla se qualche quest è stata completata.
  update(patch) {
    Object.assign(this.state, patch);
    const wasAll = this.allDone;
    QUESTS.forEach((q, index) => {
      if (this.isDone(q.id)) return;
      const logic = LOGIC[q.id];
      if (logic && logic.check(this.state)) {
        this.progress.done[q.id] = true;
        saveProgress(this.progress);
        this.onComplete?.(q, index);
      }
    });
    this.onUpdate?.();
    if (!wasAll && this.allDone) this.onAllComplete?.();
  }

  reset() {
    resetProgress();
    this.progress = { done: {} };
    this.onUpdate?.();
  }
}

// Segmenti del testo nascosto, uno per quest (nello stesso ordine).
export function textSegments() {
  return QUESTS.map((q, i) => ({ questId: q.id, text: HIDDEN_TEXT[i] ?? "" }));
}
export function fullText() {
  return HIDDEN_TEXT.join("");
}
