// ============================================================================
//  main.js — avvio, scala dello schermo, passaggio tra schermate.
// ============================================================================
import { TitleScreen } from "./title.js";
import { Game } from "./game.js";
import { Hud } from "./hud.js";
import { QuestTracker } from "./quests.js";
import { initAudio, sfx, isMuted, setMuted } from "./sfx.js";

const W = 360;
const H = 640;
const $ = (sel) => document.querySelector(sel);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const app = $("#app");
const titleScreen = $("#title-screen");
const gameScreen = $("#game-screen");
const fade = $("#fade");

let scale = 1;
let game = null;
let busy = false;

// ---------------------------------------------------------------- scala
function resize() {
  const vw = window.innerWidth || document.documentElement.clientWidth;
  const vh = window.innerHeight || document.documentElement.clientHeight;
  if (!vw || !vh) return; // finestra non ancora visibile
  scale = Math.max(0.2, Math.min(vw / W, vh / H));
  app.style.setProperty("--px", String(scale));
  if (hud) {
    hud.measure();
    game?.setTopBound(hud.topBound);
  }
}
const getScale = () => scale;

// ---------------------------------------------------------------- oggetti
const title = new TitleScreen($("#title-canvas"));

const tracker = new QuestTracker({
  onComplete(quest, index) {
    sfx.quest();
    hud.showToast(`✓ QUEST COMPLETATA!\n${quest.title}`);
    hud.unlockSegment(index);
    hud.markNew();
  },
  onAllComplete() {
    sfx.complete();
    game?.celebrate();
    setTimeout(() => hud.showFinal(), 1800);
  },
  onUpdate() {
    hud.renderQuests();
  },
});

const hud = new Hud(tracker, {
  getScale,
  isMuted,
  onMuteToggle: () => setMuted(!isMuted()),
  onReset: () => {
    if (game) startGame();
  },
});

// ---------------------------------------------------------------- schermate
function show(which) {
  titleScreen.classList.toggle("active", which === "title");
  gameScreen.classList.toggle("active", which === "game");
}

async function fadeTo(fn) {
  if (busy) return;
  busy = true;
  fade.classList.add("on");
  await wait(380);
  fn();
  await wait(80);
  fade.classList.remove("on");
  busy = false;
}

function startGame() {
  game?.destroy();
  hud.hideAll();
  hud.measure();
  game = new Game({ canvas: $("#game-canvas"), overlay: $("#overlay"), tracker, hud, getScale });
  game.start();
}

$("#start-btn").addEventListener("click", () => {
  initAudio();
  sfx.start();
  fadeTo(() => {
    title.stop();
    show("game");
    startGame();
  });
});

$("#home-btn").addEventListener("click", () => {
  fadeTo(() => {
    game?.destroy();
    game = null;
    hud.hideAll();
    show("title");
    title.start();
  });
});

// Accesso dalla console del browser per debug: rosanna.game, rosanna.tracker
window.rosanna = {
  get game() {
    return game;
  },
  tracker,
  hud,
};

// ---------------------------------------------------------------- avvio
window.addEventListener("resize", resize);
window.addEventListener("orientationchange", () => setTimeout(resize, 150));
if (document.fonts?.ready) document.fonts.ready.then(resize);
resize();
title.start();
