// ============================================================================
//  hud.js — parte HTML sopra il gioco: testo nascosto, pannello quest,
//  toast "quest completata", banner finale.
// ============================================================================
import { textSegments, fullText } from "./quests.js";

const $ = (sel) => document.querySelector(sel);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export class Hud {
  constructor(tracker, { getScale, onReset, onMuteToggle, isMuted }) {
    this.tracker = tracker;
    this.getScale = getScale;
    this.onReset = onReset;
    this.onMuteToggle = onMuteToggle;
    this.isMuted = isMuted;

    this.el = {
      hud: $("#hud"),
      questBtn: $("#quest-btn"),
      questCount: $("#quest-count"),
      panel: $("#quest-panel"),
      close: $("#quest-close"),
      list: $("#quest-list"),
      mute: $("#mute-btn"),
      reset: $("#reset-btn"),
      hidden: $("#hidden-text"),
      toast: $("#toast"),
      final: $("#final-banner"),
      finalText: $("#final-text"),
      finalClose: $("#final-close"),
    };
    this.segEls = [];
    this.toastQueue = [];
    this.toastBusy = false;
    this.topBound = 110;

    this.el.questBtn.addEventListener("click", () => this.togglePanel());
    this.el.close.addEventListener("click", () => this.togglePanel(false));
    this.el.finalClose.addEventListener("click", () => {
      this.el.final.hidden = true;
    });
    this.el.mute.addEventListener("click", () => {
      this.onMuteToggle?.();
      this.renderMute();
    });
    this.el.reset.addEventListener("click", () => {
      const ok = window.confirm("Vuoi davvero azzerare tutte le quest e il messaggio nascosto?");
      if (!ok) return;
      this.tracker.reset();
      this.buildHiddenText();
      this.togglePanel(false);
      this.onReset?.();
    });

    this.buildHiddenText();
    this.renderQuests();
    this.renderMute();
  }

  // ----------------------------------------------------------- testo nascosto
  buildHiddenText() {
    const box = this.el.hidden;
    box.innerHTML = "";
    this.segEls = textSegments().map((seg) => {
      const span = document.createElement("span");
      const done = this.tracker.isDone(seg.questId);
      span.className = "seg " + (done ? "unlocked" : "locked");
      span.textContent = seg.text;
      box.appendChild(span);
      return span;
    });
    this.measure();
  }

  // Svela un segmento con effetto macchina da scrivere.
  async unlockSegment(index) {
    const span = this.segEls[index];
    if (!span || span.classList.contains("unlocked")) return;
    const text = span.textContent;
    span.classList.remove("locked");
    span.classList.add("unlocked", "fresh");
    span.textContent = "";
    const textNode = document.createTextNode("");
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.textContent = "_";
    span.append(textNode, cursor);
    for (let i = 1; i <= text.length; i++) {
      textNode.data = text.slice(0, i);
      await wait(40);
    }
    cursor.remove();
    await wait(1800);
    span.classList.remove("fresh");
  }

  // ----------------------------------------------------------- quest
  renderQuests() {
    const t = this.tracker;
    this.el.questCount.textContent = `${t.doneCount}/${t.quests.length}`;
    this.el.list.innerHTML = "";
    for (const q of t.quests) {
      const done = t.isDone(q.id);
      const li = document.createElement("li");
      if (done) li.className = "done";
      const box = document.createElement("span");
      box.className = "box";
      box.textContent = done ? "✓" : "";
      const title = document.createElement("span");
      title.className = "title";
      title.textContent = q.title;
      const prog = document.createElement("span");
      prog.className = "prog";
      prog.textContent = done ? "fatto" : t.progressText(q);
      li.append(box, title, prog);
      this.el.list.appendChild(li);
    }
  }

  markNew() {
    if (this.el.panel.hidden) this.el.questBtn.classList.add("has-new");
  }

  get panelOpen() {
    return !this.el.panel.hidden;
  }

  togglePanel(force) {
    const open = force ?? this.el.panel.hidden;
    this.el.panel.hidden = !open;
    this.el.questBtn.setAttribute("aria-expanded", String(open));
    if (open) {
      this.el.questBtn.classList.remove("has-new");
      this.renderQuests();
    }
  }

  renderMute() {
    this.el.mute.textContent = this.isMuted?.() ? "♪ suoni: OFF" : "♪ suoni: ON";
  }

  // ----------------------------------------------------------- toast
  showToast(text, ms = 2600) {
    this.toastQueue.push({ text, ms });
    if (!this.toastBusy) this.drainToasts();
  }

  async drainToasts() {
    this.toastBusy = true;
    while (this.toastQueue.length) {
      const { text, ms } = this.toastQueue.shift();
      this.el.toast.textContent = text;
      this.el.toast.hidden = false;
      await wait(ms);
      this.el.toast.hidden = true;
      await wait(200);
    }
    this.toastBusy = false;
  }

  // ----------------------------------------------------------- finale
  showFinal() {
    this.el.finalText.textContent = fullText();
    this.el.final.hidden = false;
  }

  hideAll() {
    this.el.final.hidden = true;
    this.el.toast.hidden = true;
    this.toastQueue.length = 0;
    this.togglePanel(false);
  }

  // Altezza dell'HUD in pixel logici: sotto inizia il prato giocabile.
  // Usa l'altezza reale della schermata (640 px logici) come riferimento,
  // così funziona anche se --px non è ancora aggiornato.
  measure() {
    const screen = this.el.hud.closest(".screen");
    const screenH = screen ? screen.getBoundingClientRect().height : 0;
    if (screenH < 10) return this.topBound; // schermata nascosta: tieni il valore precedente
    const h = (this.el.hud.getBoundingClientRect().height / screenH) * 640;
    if (h > 40 && h < 220) this.topBound = Math.round(h + 6);
    return this.topBound;
  }
}
