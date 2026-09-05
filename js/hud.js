// ============================================================================
//  hud.js — parte HTML sopra il gioco: pannello del messaggio nascosto,
//  pannello quest, toast "quest completata", banner finale.
//
//  Il messaggio si svela SEMPRE in ordine: la prima quest completata mostra
//  il pezzo 1, la seconda il pezzo 2 e così via, qualunque quest sia stata
//  risolta. Conta solo QUANTE quest sono fatte, non quali.
// ============================================================================
import { textSegments, fullText } from "./quests.js";

const $ = (sel) => document.querySelector(sel);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export class Hud {
  constructor(tracker, { getScale, onReset, onMuteToggle, isMuted }) {
    this.tracker = tracker;
    this.getScale = getScale;
    this.onReset = onReset;
    this.onMuteToggle = onMuteToggle;
    this.isMuted = isMuted;

    this.el = {
      hud: $("#hud"),
      msgBtn: $("#msg-btn"),
      msgCount: $("#msg-count"),
      msgCount2: $("#msg-count-2"),
      msgPanel: $("#msg-panel"),
      msgClose: $("#msg-close"),
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
    this.revealed = 0; // quanti pezzi del messaggio sono già visibili
    this.revealing = false;
    this.toastQueue = [];
    this.toastBusy = false;
    this.topBound = 52;

    this.el.questBtn.addEventListener("click", () => this.togglePanel());
    this.el.close.addEventListener("click", () => this.togglePanel(false));
    this.el.msgBtn.addEventListener("click", () => this.toggleMsg());
    this.el.msgClose.addEventListener("click", () => this.toggleMsg(false));
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
      this.toggleMsg(false);
      this.onReset?.();
    });

    this.buildHiddenText();
    this.renderQuests();
    this.renderMute();
  }

  // ----------------------------------------------------------- messaggio
  // Ricostruisce il testo: i primi N pezzi visibili, il resto oscurato.
  buildHiddenText() {
    const box = this.el.hidden;
    box.innerHTML = "";
    this.revealing = false;
    this.revealed = this.tracker.doneCount;
    this.segEls = textSegments().map((seg, i) => {
      const span = document.createElement("span");
      span.className = "seg " + (i < this.revealed ? "unlocked" : "locked");
      span.textContent = seg.text;
      box.appendChild(span);
      return span;
    });
    box.scrollTop = 0;
    this.renderMsgCount();
    this.measure();
  }

  renderMsgCount() {
    const label = `${this.revealed}/${this.segEls.length}`;
    this.el.msgCount.textContent = label;
    this.el.msgCount2.textContent = label;
  }

  // Svela i pezzi mancanti, uno dopo l'altro e sempre dal primo in poi.
  async revealNext() {
    this.el.msgBtn.classList.add("has-new");
    if (this.revealing) return; // il ciclo già attivo prenderà anche i nuovi
    this.revealing = true;
    this.togglePanel(false);
    this.toggleMsg(true);
    await wait(500);
    while (this.revealed < this.tracker.doneCount) {
      const index = this.revealed;
      this.revealed++;
      this.renderMsgCount();
      await this.typeSegment(index);
      await wait(400);
    }
    this.revealing = false;
    this.el.msgBtn.classList.remove("has-new");
  }

  // Effetto macchina da scrivere su un pezzo.
  async typeSegment(index) {
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
    // i pezzi lunghi scorrono più veloci: ogni pezzo dura circa 3 secondi
    const perChar = clamp(3000 / Math.max(1, text.length), 10, 34);
    for (let i = 1; i <= text.length; i++) {
      textNode.data = text.slice(0, i);
      if (i % 6 === 0) cursor.scrollIntoView({ block: "nearest" });
      await wait(perChar);
    }
    cursor.scrollIntoView({ block: "nearest" });
    cursor.remove();
    await wait(1500);
    span.classList.remove("fresh");
  }

  get msgOpen() {
    return !this.el.msgPanel.hidden;
  }

  toggleMsg(force) {
    const open = force ?? this.el.msgPanel.hidden;
    this.el.msgPanel.hidden = !open;
    this.el.msgBtn.setAttribute("aria-expanded", String(open));
    if (open) {
      this.el.panel.hidden = true;
      this.el.questBtn.setAttribute("aria-expanded", "false");
      if (!this.revealing) this.el.msgBtn.classList.remove("has-new");
    }
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

  get anyPanelOpen() {
    return this.panelOpen || this.msgOpen;
  }

  // Chiude i pannelli aperti (usato quando si tocca il prato).
  // Il messaggio non si chiude mentre si sta ancora scrivendo.
  closePanels() {
    if (this.panelOpen) this.togglePanel(false);
    if (this.msgOpen && !this.revealing) this.toggleMsg(false);
  }

  togglePanel(force) {
    const open = force ?? this.el.panel.hidden;
    this.el.panel.hidden = !open;
    this.el.questBtn.setAttribute("aria-expanded", String(open));
    if (open) {
      this.el.questBtn.classList.remove("has-new");
      this.renderQuests();
      if (!this.revealing) this.toggleMsg(false);
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
    this.toggleMsg(false);
  }

  // Altezza dell'HUD in pixel logici: sotto inizia il prato giocabile.
  // Usa l'altezza reale della schermata (640 px logici) come riferimento,
  // così funziona anche se --px non è ancora aggiornato.
  measure() {
    const screen = this.el.hud.closest(".screen");
    const screenH = screen ? screen.getBoundingClientRect().height : 0;
    if (screenH < 10) return this.topBound; // schermata nascosta: tieni il valore precedente
    const h = (this.el.hud.getBoundingClientRect().height / screenH) * 640;
    if (h > 20 && h < 220) this.topBound = Math.round(h + 6);
    return this.topBound;
  }
}
