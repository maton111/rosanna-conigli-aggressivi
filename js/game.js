// ============================================================================
//  game.js — il prato: conigli aggressivi che saltellano, carote, coniglio
//  dorato nascosto, particelle e fumetti. Tutto su canvas 360x640 tranne i
//  fumetti (HTML nell'overlay, per il testo a capo).
// ============================================================================
import { RABBITS, SPR, RABBIT_SIZE as RS } from "./sprites.js";
import { rand, randInt, pick, clamp, lerp, makeCanvas } from "./pixel.js";
import {
  PHRASES, GOLDEN_PHRASE, RABBIT_COUNT, CARROT_COUNT, FAST_QUEST_SECONDS,
  GOLDEN_APPEAR_EVERY, GOLDEN_VISIBLE_FOR, BUBBLE_SECONDS,
} from "./config.js";
import { sfx } from "./sfx.js";

const W = 360;
const H = 640;
const FENCE_Y = H - 36;
const CARROT_W = 16;
const CARROT_H = 24;

// Cespugli e alberi (disegnati DAVANTI ai conigli: ci si può nascondere dietro).
const BUSHES = [
  { x: 14, y: 250, w: 48, h: 30 },
  { x: 292, y: 372, w: 48, h: 30 },
  { x: 156, y: 526, w: 48, h: 30 },
];
const TREES = [
  { x: -16, y: 128, w: 48, h: 60 },
  { x: 322, y: 196, w: 48, h: 60 },
  { x: -12, y: 470, w: 48, h: 60 },
  { x: 318, y: 516, w: 48, h: 60 },
];

const CONFETTI_COLORS = ["#ff4d6d", "#ffd23f", "#4cc9f0", "#80ed99", "#ff9f1c", "#ffffff", "#c77dff"];

// ---------------------------------------------------------------- frasi
class PhraseBag {
  constructor(list) {
    this.list = list.length ? list : ["Sei la migliore!"];
    this.bag = [];
    this.last = null;
  }
  next() {
    if (!this.bag.length) {
      this.bag = [...this.list].sort(() => Math.random() - 0.5);
      // mai la stessa frase due volte di fila
      if (this.bag.length > 1 && this.bag[this.bag.length - 1] === this.last) this.bag.unshift(this.bag.pop());
    }
    this.last = this.bag.pop();
    return this.last;
  }
}

// ---------------------------------------------------------------- coniglio
class Rabbit {
  constructor(game, kind, x, y) {
    this.game = game;
    this.kind = kind; // "angry" | "gold"
    this.state = kind === "gold" ? "gold" : "angry"; // set di sprite
    this.sweet = false;
    this.x = x;
    this.y = y;
    this.jump = 0;
    this.dir = Math.random() < 0.5 ? -1 : 1;
    this.hop = null;
    this.rest = rand(0.2, 1.5);
    this.growl = 0;
    this.growlCd = rand(1.5, 5);
    this.flash = 0;
    this.pause = 0;
    this.visible = kind !== "gold";
    this.bubble = null;
    this.bubbleT = 0;
    this.bubbleW = 0;
    this.bubbleH = 0;
  }

  get cx() {
    return this.x + RS / 2;
  }
  get drawY() {
    return this.y - this.jump;
  }

  update(dt) {
    if (this.pause > 0) this.pause -= dt;
    if (this.hop) {
      const h = this.hop;
      h.t += dt;
      const p = clamp(h.t / h.dur, 0, 1);
      this.x = lerp(h.fromX, h.toX, p);
      this.y = lerp(h.fromY, h.toY, p);
      this.jump = Math.sin(p * Math.PI) * h.height;
      if (p >= 1) {
        this.hop = null;
        this.jump = 0;
        this.rest = this.sweet ? rand(0.6, 2.2) : rand(0.15, 1.1);
      }
    } else if (this.pause <= 0) {
      this.rest -= dt;
      if (this.rest <= 0) this.startHop();
    }
    if (!this.sweet && this.kind === "angry") {
      this.growlCd -= dt;
      if (this.growlCd <= 0) {
        this.growlCd = rand(2.5, 7);
        this.growl = 0.55;
        if (Math.random() < 0.35) sfx.growl();
      }
    }
    if (this.growl > 0) this.growl -= dt;
    if (this.flash > 0) this.flash -= dt;
    if (this.bubble) {
      this.bubbleT -= dt;
      if (this.bubbleT <= 0) this.game.removeBubble(this);
    }
  }

  startHop(target) {
    const b = this.game.bounds;
    let tx;
    let ty;
    if (target) {
      tx = target.x;
      ty = target.y;
    } else {
      const dist = this.sweet ? rand(16, 44) : rand(28, 80);
      const ang = rand(0, Math.PI * 2);
      tx = clamp(this.x + Math.cos(ang) * dist, b.left, b.right);
      ty = clamp(this.y + Math.sin(ang) * dist, b.top, b.bottom);
    }
    if (Math.abs(tx - this.x) > 2) this.dir = tx < this.x ? -1 : 1;
    const d = Math.hypot(tx - this.x, ty - this.y);
    this.hop = {
      fromX: this.x, fromY: this.y, toX: tx, toY: ty, t: 0,
      dur: clamp(d / (this.sweet ? 90 : 150), 0.25, 0.6),
      height: clamp(d * 0.25, 6, 18),
    };
  }

  draw(ctx) {
    const set = RABBITS[this.state];
    const frames = this.dir > 0 ? set.right : set.left;
    const frame = this.hop ? 1 : 0;
    // ombra
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    const sw = RS - 20 - Math.round(this.jump / 3);
    ctx.fillRect(Math.round(this.cx - sw / 2), Math.round(this.y) + RS - 4, sw, 4);
    // corpo (con tremolio se ringhia)
    const shake = this.growl > 0 ? Math.round(Math.sin(this.growl * 70) * 2) : 0;
    const dx = Math.round(this.x + shake);
    const dy = Math.round(this.drawY);
    ctx.drawImage(frames[frame], dx, dy);
    if (this.flash > 0) {
      ctx.globalAlpha = clamp(this.flash / 0.12, 0, 1);
      ctx.drawImage(this.dir > 0 ? set.flash : set.flashLeft, dx, dy);
      ctx.globalAlpha = 1;
    }
    if (this.growl > 0 && !this.sweet && this.kind === "angry") {
      ctx.drawImage(SPR.angryMark, dx + RS - 8, dy - 12);
    }
  }

  contains(px, py) {
    const pad = 6;
    return px >= this.x - pad && px <= this.x + RS + pad && py >= this.drawY - pad && py <= this.y + RS + pad;
  }
}

// ---------------------------------------------------------------- carota
class Carrot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.taken = false;
    this.phase = rand(0, 6);
  }
  contains(px, py) {
    const pad = 8;
    return px >= this.x - pad && px <= this.x + CARROT_W + pad && py >= this.y - pad && py <= this.y + CARROT_H + pad;
  }
  draw(ctx, t) {
    const dy = Math.round(Math.sin(t * 3 + this.phase) * 1.5);
    ctx.fillStyle = "rgba(0,0,0,0.15)";
    ctx.fillRect(this.x + 3, this.y + CARROT_H - 1, 10, 3);
    ctx.drawImage(SPR.carrot, this.x, this.y + dy);
  }
}

// ---------------------------------------------------------------- gioco
export class Game {
  constructor({ canvas, overlay, tracker, hud, getScale }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.overlay = overlay;
    this.tracker = tracker;
    this.hud = hud;
    this.getScale = getScale || (() => 1);

    this.bounds = { left: 6, right: W - 6 - RS, top: 110, bottom: FENCE_Y - RS + 6 };
    this.setTopBound(hud.topBound);
    this.bg = buildBackground();
    this.fg = buildForeground();
    this.phrases = new PhraseBag(PHRASES);

    this.rabbits = [];
    this.carrots = [];
    this.particles = [];
    this.stats = { sweet: 0, total: RABBIT_COUNT, golden: false, carrots: 0, fast: false };
    this.elapsed = 0;
    this.running = false;
    this.last = 0;

    this.spawnRabbits();
    this.spawnCarrots();
    this.gold = new Rabbit(this, "gold", 0, 0);
    this.goldTimer = rand(GOLDEN_APPEAR_EVERY[0], GOLDEN_APPEAR_EVERY[1]) * 0.6;
    this.goldVisibleT = 0;
    this.goldBush = null;
    this.goldLeaving = false;

    this.onPointer = this.onPointer.bind(this);
    this.loop = this.loop.bind(this);
    canvas.addEventListener("pointerdown", this.onPointer);
    tracker.update({ ...this.stats });
  }

  setTopBound(y) {
    this.bounds.top = clamp(Math.round(y), 46, 220);
  }

  // ------------------------------------------------------------ spawn
  spawnRabbits() {
    const b = this.bounds;
    for (let i = 0; i < RABBIT_COUNT; i++) {
      let x = 0;
      let y = 0;
      for (let tries = 0; tries < 30; tries++) {
        x = rand(b.left, b.right);
        y = rand(b.top, b.bottom);
        const far = this.rabbits.every((r) => Math.hypot(r.x - x, r.y - y) > 44);
        if (far) break;
      }
      this.rabbits.push(new Rabbit(this, "angry", x, y));
    }
  }

  spawnCarrots() {
    const b = this.bounds;
    const blocked = [...BUSHES, ...TREES];
    for (let i = 0; i < CARROT_COUNT; i++) {
      let x = 0;
      let y = 0;
      for (let tries = 0; tries < 40; tries++) {
        x = randInt(b.left + 4, W - 24);
        y = randInt(b.top + 4, FENCE_Y - CARROT_H - 8);
        const hit = blocked.some((r) => x < r.x + r.w + 6 && x + CARROT_W > r.x - 6 && y < r.y + r.h + 6 && y + CARROT_H > r.y - 6);
        const near = this.carrots.some((c) => Math.hypot(c.x - x, c.y - y) < 40);
        if (!hit && !near) break;
      }
      this.carrots.push(new Carrot(x, y));
    }
  }

  // ------------------------------------------------------------ loop
  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.loop);
  }

  destroy() {
    this.running = false;
    this.canvas.removeEventListener("pointerdown", this.onPointer);
    this.overlay.innerHTML = "";
  }

  loop(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.elapsed += dt;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  }

  update(dt) {
    for (const r of this.rabbits) r.update(dt);
    this.updateGold(dt);
    this.updateParticles(dt);
    for (const r of this.rabbits) if (r.bubble) this.positionBubble(r);
    if (this.gold.bubble) this.positionBubble(this.gold);
  }

  updateGold(dt) {
    const g = this.gold;
    if (this.stats.golden) {
      // trovato: resta nel prato come un coniglio carino e brillante
      g.update(dt);
      if (Math.random() < 0.06) this.spawnParticle("sparkle", g.x + rand(0, RS), g.drawY + rand(0, RS), 0, -10, 0.5);
      return;
    }
    if (!g.visible) {
      this.goldTimer -= dt;
      if (this.goldTimer <= 0) {
        const bush = pick(BUSHES);
        this.goldBush = bush;
        g.x = bush.x;
        g.y = bush.y - 12;
        g.visible = true;
        g.hop = null;
        g.pause = 0;
        this.goldVisibleT = GOLDEN_VISIBLE_FOR;
        this.goldLeaving = false;
        this.poof(g.cx, g.y + RS / 2);
        sfx.poof();
        // salta fuori dal cespuglio verso il centro del prato
        const b = this.bounds;
        const tx = clamp(bush.x + (bush.x < W / 2 ? rand(60, 110) : -rand(60, 110)), b.left, b.right);
        const ty = clamp(g.y + rand(-50, 50), b.top, b.bottom);
        g.startHop({ x: tx, y: ty });
      }
      return;
    }
    g.update(dt);
    if (Math.random() < 0.35) this.spawnParticle("sparkle", g.x + rand(0, RS), g.drawY + rand(0, RS), rand(-8, 8), -14, 0.45);
    if (!this.goldLeaving) {
      this.goldVisibleT -= dt;
      if (this.goldVisibleT <= 0) {
        this.goldLeaving = true;
        g.pause = 999;
        g.hop = null;
        g.startHop({ x: this.goldBush.x, y: this.goldBush.y - 12 });
      }
    } else if (!g.hop) {
      g.visible = false;
      this.poof(g.cx, g.y + RS / 2);
      sfx.poof();
      this.goldTimer = rand(GOLDEN_APPEAR_EVERY[0], GOLDEN_APPEAR_EVERY[1]);
    }
  }

  // ------------------------------------------------------------ input
  onPointer(e) {
    e.preventDefault();
    if (this.hud.anyPanelOpen) {
      this.hud.closePanels();
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    this.tap(px, py);
  }

  tap(px, py) {
    const order = this.drawOrder();
    for (let i = order.length - 1; i >= 0; i--) {
      const r = order[i];
      if (r.contains(px, py)) {
        this.tapRabbit(r);
        return;
      }
    }
    for (const c of this.carrots) {
      if (!c.taken && c.contains(px, py)) {
        this.takeCarrot(c);
        return;
      }
    }
    this.grassPuff(px, py);
    sfx.tap();
  }

  tapRabbit(r) {
    if (r.kind === "gold") {
      if (!this.stats.golden) this.foundGold();
      else {
        this.showBubble(r, Math.random() < 0.5 ? GOLDEN_PHRASE : this.phrases.next(), true);
        this.burst(r, "sparkle", 6);
        r.pause = 1;
        r.flash = 0.08;
        sfx.talk();
      }
      return;
    }
    if (!r.sweet) this.sweeten(r);
    else {
      this.showBubble(r, this.phrases.next());
      this.burst(r, "heart", 3);
      r.pause = 1.2;
      r.flash = 0.08;
      sfx.talk();
    }
  }

  sweeten(r) {
    r.sweet = true;
    r.state = "sweet";
    r.flash = 0.15;
    r.pause = 1.6;
    r.hop = null;
    r.jump = 0;
    r.growl = 0;
    this.burst(r, "heart", 10);
    sfx.sweet();
    this.showBubble(r, this.phrases.next());
    this.stats.sweet++;
    if (this.elapsed <= FAST_QUEST_SECONDS) this.stats.fast = true;
    this.tracker.update({ sweet: this.stats.sweet, fast: this.stats.fast });
  }

  foundGold() {
    const g = this.gold;
    this.stats.golden = true;
    g.sweet = true;
    g.pause = 1.8;
    g.hop = null;
    g.jump = 0;
    g.flash = 0.15;
    this.goldLeaving = false;
    this.burst(g, "sparkle", 14);
    this.burst(g, "heart", 6);
    sfx.golden();
    this.showBubble(g, GOLDEN_PHRASE, true);
    this.tracker.update({ golden: true });
  }

  takeCarrot(c) {
    c.taken = true;
    for (let i = 0; i < 8; i++) {
      this.spawnParticle("bit", c.x + 8, c.y + 12, rand(-60, 60), rand(-90, -20), rand(0.4, 0.7), pick(["#ff8c1a", "#ffb15c", "#3cb043"]));
    }
    this.spawnParticle("text", c.x + 8, c.y, 0, -30, 0.9, "#fff", "+1");
    sfx.carrot();
    this.stats.carrots++;
    this.tracker.update({ carrots: this.stats.carrots });
  }

  // Festa finale: coriandoli e tutti i conigli che saltano.
  celebrate() {
    for (let i = 0; i < 140; i++) {
      this.spawnParticle("confetti", rand(0, W), rand(-260, -10), rand(-20, 20), rand(40, 90), rand(3, 5), pick(CONFETTI_COLORS));
    }
    for (const r of this.rabbits) {
      r.pause = 0;
      r.rest = rand(0, 0.5);
    }
  }

  // ------------------------------------------------------------ fumetti
  showBubble(r, text, golden = false) {
    if (!r.bubble) {
      const el = document.createElement("div");
      el.className = "bubble";
      this.overlay.appendChild(el);
      r.bubble = el;
    }
    r.bubble.classList.toggle("golden", golden);
    r.bubble.textContent = text;
    r.bubbleT = BUBBLE_SECONDS;
    const s = this.getScale() || 1;
    r.bubbleW = r.bubble.offsetWidth / s;
    r.bubbleH = r.bubble.offsetHeight / s;
    this.positionBubble(r);
  }

  removeBubble(r) {
    if (r.bubble) r.bubble.remove();
    r.bubble = null;
  }

  positionBubble(r) {
    const el = r.bubble;
    const cx = clamp(r.cx, r.bubbleW / 2 + 4, W - r.bubbleW / 2 - 4);
    const hudBottom = this.bounds.top - 6;
    const above = r.drawY - r.bubbleH - 10 >= hudBottom;
    el.classList.toggle("below", !above);
    el.style.left = `${(cx / W) * 100}%`;
    el.style.top = above ? `${((r.drawY - 8) / H) * 100}%` : `${((r.y + RS + 10) / H) * 100}%`;
  }

  // ------------------------------------------------------------ particelle
  spawnParticle(kind, x, y, vx, vy, life, color, text) {
    this.particles.push({ kind, x, y, vx, vy, life, t: 0, color, text, phase: rand(0, 6) });
  }

  burst(r, kind, n) {
    for (let i = 0; i < n; i++) {
      this.spawnParticle(kind, r.cx + rand(-16, 16), r.drawY + rand(2, 34), rand(-35, 35), rand(-80, -25), rand(0.6, 1.2));
    }
  }

  poof(x, y) {
    for (let i = 0; i < 8; i++) this.spawnParticle("poof", x + rand(-10, 10), y + rand(-10, 10), rand(-25, 25), rand(-25, 5), rand(0.35, 0.6));
  }

  grassPuff(x, y) {
    for (let i = 0; i < 4; i++) this.spawnParticle("bit", x, y, rand(-40, 40), rand(-70, -30), rand(0.3, 0.5), pick(["#3e8e41", "#2e7d32", "#7ed957"]));
  }

  updateParticles(dt) {
    const list = this.particles;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.t += dt;
      if (p.t >= p.life) {
        list.splice(i, 1);
        continue;
      }
      if (p.kind === "confetti") {
        p.x += (p.vx + Math.sin(p.t * 4 + p.phase) * 25) * dt;
        p.y += p.vy * dt;
        if (p.y > H) list.splice(i, 1);
        continue;
      }
      if (p.kind === "bit") p.vy += 220 * dt;
      if (p.kind === "heart") p.vy -= 10 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  drawParticles(ctx) {
    for (const p of this.particles) {
      const k = p.t / p.life;
      switch (p.kind) {
        case "heart": {
          ctx.globalAlpha = 1 - k * k;
          ctx.drawImage(k < 0.6 ? SPR.heart : SPR.heartSmall, Math.round(p.x), Math.round(p.y));
          break;
        }
        case "sparkle": {
          ctx.globalAlpha = 1 - k;
          const spr = Math.floor(p.t * 10) % 2 ? SPR.sparkle : SPR.sparkleSmall;
          ctx.drawImage(spr, Math.round(p.x), Math.round(p.y));
          break;
        }
        case "poof": {
          ctx.globalAlpha = 0.8 * (1 - k);
          const size = Math.round(4 + 10 * k);
          ctx.fillStyle = "#f4f1ff";
          ctx.fillRect(Math.round(p.x - size / 2), Math.round(p.y - size / 2), size, size);
          break;
        }
        case "bit": {
          ctx.globalAlpha = 1 - k;
          ctx.fillStyle = p.color;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), 3, 3);
          break;
        }
        case "confetti": {
          ctx.globalAlpha = 1;
          ctx.fillStyle = p.color;
          const flip = Math.floor(p.t * 6 + p.phase) % 2;
          ctx.fillRect(Math.round(p.x), Math.round(p.y), flip ? 4 : 2, flip ? 3 : 5);
          break;
        }
        case "text": {
          ctx.globalAlpha = 1 - k;
          ctx.font = '8px "Press Start 2P", monospace';
          ctx.textAlign = "center";
          ctx.fillStyle = "#1c1a2e";
          ctx.fillText(p.text, Math.round(p.x) + 1, Math.round(p.y) + 1);
          ctx.fillStyle = p.color;
          ctx.fillText(p.text, Math.round(p.x), Math.round(p.y));
          break;
        }
        default:
          break;
      }
    }
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------ disegno
  drawOrder() {
    const list = this.rabbits.slice();
    if (this.gold.visible) list.push(this.gold);
    list.sort((a, b) => a.y - b.y);
    return list;
  }

  draw() {
    const { ctx } = this;
    ctx.drawImage(this.bg, 0, 0);
    for (const c of this.carrots) if (!c.taken) c.draw(ctx, this.elapsed);
    for (const r of this.drawOrder()) r.draw(ctx);
    ctx.drawImage(this.fg, 0, 0);
    this.drawParticles(ctx);
    this.drawCounters(ctx);
  }

  drawCounters(ctx) {
    // targhetta in basso a sinistra sopra la staccionata
    const y = FENCE_Y + 8;
    ctx.fillStyle = "rgba(28,26,46,0.85)";
    ctx.fillRect(6, y, 132, 22);
    ctx.drawImage(SPR.heartSmall, 12, y + 8);
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff6dc";
    ctx.fillText(`${this.stats.sweet}/${this.stats.total}`, 24, y + 12);
    ctx.drawImage(SPR.carrot, 72, y + 1, 12, 18);
    ctx.fillText(`${this.stats.carrots}/${CARROT_COUNT}`, 88, y + 12);

    // timer della quest "veloce" nei primi secondi
    if (!this.stats.fast && !this.tracker.isDone("fast") && this.elapsed < FAST_QUEST_SECONDS) {
      const left = Math.ceil(FAST_QUEST_SECONDS - this.elapsed);
      ctx.fillStyle = "rgba(28,26,46,0.85)";
      ctx.fillRect(W - 96, y, 90, 22);
      ctx.fillStyle = left <= 3 ? "#ff4d6d" : "#ffd23f";
      ctx.textAlign = "right";
      ctx.fillText(`VELOCE ${left}s`, W - 12, y + 12);
    }
    ctx.textBaseline = "alphabetic";
    ctx.textAlign = "left";
  }
}

// ---------------------------------------------------------------- scenario
function buildBackground() {
  const { canvas, ctx } = makeCanvas(W, H);
  ctx.fillStyle = "#5cb85a";
  ctx.fillRect(0, 0, W, H);
  // chiazze a blocchi
  ctx.fillStyle = "#54ad52";
  for (let y = 0; y < FENCE_Y; y += 8) {
    for (let x = 0; x < W; x += 8) if (Math.random() < 0.28) ctx.fillRect(x, y, 8, 8);
  }
  ctx.fillStyle = "#63c260";
  for (let y = 0; y < FENCE_Y; y += 8) {
    for (let x = 0; x < W; x += 8) if (Math.random() < 0.12) ctx.fillRect(x, y, 8, 8);
  }
  // fili d'erba
  ctx.fillStyle = "#3e8e41";
  for (let i = 0; i < 240; i++) {
    const x = randInt(0, W - 3);
    const y = randInt(0, FENCE_Y - 4);
    ctx.fillRect(x, y, 1, 3);
    ctx.fillRect(x + 2, y + 1, 1, 2);
  }
  for (let i = 0; i < 40; i++) ctx.drawImage(SPR.tuft, randInt(0, W - 10), randInt(0, FENCE_Y - 8));
  for (let i = 0; i < 34; i++) ctx.drawImage(pick(SPR.flowers), randInt(0, W - 10), randInt(0, FENCE_Y - 12));
  // staccionata
  for (let x = 0; x < W; x += 48) ctx.drawImage(SPR.fence, x, FENCE_Y);
  return canvas;
}

function buildForeground() {
  const { canvas, ctx } = makeCanvas(W, H);
  for (const b of BUSHES) ctx.drawImage(SPR.bush, b.x, b.y);
  for (const t of TREES) ctx.drawImage(SPR.tree, t.x, t.y);
  return canvas;
}
