// ============================================================================
//  title.js — schermata iniziale: notte medieval fantasy in pixel art.
//  Cielo a bande, stelle, luna, nuvole, montagne, castello con bandiere,
//  prato con lucciole e un coniglio in agguato.
// ============================================================================
import { SPR } from "./sprites.js";
import { rand, randInt, makeCanvas, pick } from "./pixel.js";

const W = 360;
const H = 640;
const HORIZON = 420; // dove finisce il cielo e inizia il prato

export class TitleScreen {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.sky = buildSky();
    this.land = buildLand();
    this.stars = Array.from({ length: 80 }, () => ({
      x: randInt(0, W - 1),
      y: randInt(0, 310),
      big: Math.random() < 0.18,
      phase: rand(0, Math.PI * 2),
      speed: rand(1.2, 3.5),
    }));
    this.clouds = [
      { x: 30, y: 150, spr: SPR.cloud, v: 7 },
      { x: 230, y: 215, spr: SPR.cloudSmall, v: 4.5 },
      { x: 120, y: 260, spr: SPR.cloudSmall, v: 5.5 },
    ];
    this.fireflies = Array.from({ length: 14 }, () => ({
      x: rand(10, W - 10),
      y: rand(HORIZON + 30, H - 40),
      phase: rand(0, Math.PI * 2),
      speed: rand(0.6, 1.4),
      amp: rand(6, 16),
    }));
    this.windows = [
      // [x, y, w, h]
      [116, 300, 6, 9], [134, 300, 6, 9], [116, 330, 6, 9], [134, 330, 6, 9],
      [218, 300, 6, 9], [236, 300, 6, 9], [218, 330, 6, 9], [236, 330, 6, 9],
      [172, 268, 6, 9], [184, 268, 6, 9], [150, 344, 6, 9], [204, 344, 6, 9],
    ];
    this.windowLit = this.windows.map(() => Math.random() < 0.8);
    this.flickerT = 0;
    this.time = 0;
    this.running = false;
    this.last = 0;
    this.loop = this.loop.bind(this);
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
  }

  loop(now) {
    if (!this.running) return;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  }

  update(dt) {
    for (const c of this.clouds) {
      c.x += c.v * dt;
      if (c.x > W + 10) c.x = -c.spr.width - 10;
    }
    this.flickerT -= dt;
    if (this.flickerT <= 0) {
      this.flickerT = rand(0.25, 0.6);
      const i = randInt(0, this.windows.length - 1);
      this.windowLit[i] = Math.random() < 0.85;
    }
  }

  draw() {
    const { ctx, time } = this;
    ctx.drawImage(this.sky, 0, 0);

    // stelle che scintillano
    for (const s of this.stars) {
      const a = 0.45 + 0.55 * Math.abs(Math.sin(time * s.speed + s.phase));
      ctx.globalAlpha = a;
      ctx.fillStyle = s.big ? "#fff8d6" : "#e9e4ff";
      const size = s.big ? 2 : 1;
      ctx.fillRect(s.x, s.y, size, size);
      if (s.big && a > 0.9) {
        ctx.fillRect(s.x - 1, s.y, 1, 1);
        ctx.fillRect(s.x + 2, s.y, 1, 1);
        ctx.fillRect(s.x, s.y - 1, 1, 1);
        ctx.fillRect(s.x, s.y + 2, 1, 1);
      }
    }
    ctx.globalAlpha = 1;

    // luna e nuvole
    ctx.drawImage(SPR.moon, 310, 22);
    ctx.globalAlpha = 0.85;
    for (const c of this.clouds) ctx.drawImage(c.spr, Math.round(c.x), c.y);
    ctx.globalAlpha = 1;

    // terra, castello, prato (pre-renderizzati)
    ctx.drawImage(this.land, 0, 0);

    // finestre accese
    ctx.fillStyle = "#ffd166";
    this.windows.forEach(([x, y, w, h], i) => {
      if (this.windowLit[i]) ctx.fillRect(x, y, w, h);
    });

    // bandiere che sventolano
    const frame = Math.floor(time * 4) % 2;
    drawFlag(ctx, 120, 244, frame);
    drawFlag(ctx, 240, 244, frame);
    drawFlag(ctx, 180, 226, frame ^ 1);

    // lucciole
    for (const f of this.fireflies) {
      const t = time * f.speed + f.phase;
      const x = f.x + Math.sin(t) * f.amp;
      const y = f.y + Math.cos(t * 0.7) * 4;
      const a = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.3));
      ctx.globalAlpha = a;
      ctx.fillStyle = "#e6ff5c";
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
    ctx.globalAlpha = 1;

    // coniglio in agguato con gli occhi rossi che brillano
    const rx = 296;
    const ry = 566 + Math.round(Math.sin(time * 2) * 1.5);
    ctx.drawImage(SPR.rabbitShadow, rx, ry);
    const blink = Math.sin(time * 1.1) > 0.97;
    if (!blink) {
      ctx.fillStyle = "#ff2a2a";
      ctx.fillRect(rx + 8, ry + 18, 4, 3);
      ctx.fillRect(rx + 20, ry + 18, 4, 3);
    }
  }
}

// ---------------------------------------------------------------- disegni
function drawFlag(ctx, x, y, frame) {
  ctx.fillStyle = "#3b2a1e";
  ctx.fillRect(x, y, 2, 16); // asta
  ctx.fillStyle = "#e63946";
  if (frame === 0) {
    ctx.fillRect(x + 2, y, 10, 6);
    ctx.fillRect(x + 12, y + 1, 2, 4);
  } else {
    ctx.fillRect(x + 2, y, 8, 6);
    ctx.fillRect(x + 10, y - 1, 3, 5);
  }
}

function buildSky() {
  const { canvas, ctx } = makeCanvas(W, H);
  const bands = ["#0a0820", "#100d2e", "#161340", "#1d1852", "#2a1f62", "#3c2a6e", "#5b3872", "#7d4a70"];
  const bandH = Math.ceil(HORIZON / bands.length);
  bands.forEach((c, i) => {
    ctx.fillStyle = c;
    ctx.fillRect(0, i * bandH, W, bandH);
  });
  // fascia rosata all'orizzonte
  ctx.fillStyle = "#a45d78";
  ctx.fillRect(0, HORIZON - 12, W, 12);
  return canvas;
}

function mountain(ctx, cx, peakY, halfW, baseY, color, step = 4) {
  ctx.fillStyle = color;
  for (let y = peakY; y < baseY; y += step) {
    const t = (y - peakY) / (baseY - peakY);
    const w = Math.round(halfW * t);
    ctx.fillRect(cx - w, y, w * 2 + 2, step);
  }
}

function buildLand() {
  const { canvas, ctx } = makeCanvas(W, H);

  // montagne lontane e vicine
  mountain(ctx, 40, 330, 90, HORIZON, "#3b2f63", 4);
  mountain(ctx, 150, 300, 110, HORIZON, "#3b2f63", 4);
  mountain(ctx, 270, 320, 100, HORIZON, "#3b2f63", 4);
  mountain(ctx, 350, 340, 80, HORIZON, "#3b2f63", 4);
  mountain(ctx, 0, 360, 80, HORIZON, "#2a2150", 4);
  mountain(ctx, 95, 372, 70, HORIZON, "#2a2150", 4);
  mountain(ctx, 300, 358, 90, HORIZON, "#2a2150", 4);
  // neve sulle cime
  ctx.fillStyle = "#cfc6ff";
  ctx.fillRect(148, 300, 6, 4);
  ctx.fillRect(146, 304, 10, 4);
  ctx.fillRect(268, 320, 6, 4);
  ctx.fillRect(266, 324, 10, 4);

  // collina del castello
  ctx.fillStyle = "#1e3a34";
  for (let y = 386; y < HORIZON; y += 4) {
    const t = (y - 386) / (HORIZON - 386);
    const w = Math.round(80 + 110 * Math.sqrt(t));
    ctx.fillRect(180 - w, y, w * 2, 4);
  }

  // castello (silhouette scura)
  const dark = "#171430";
  const darker = "#100e24";
  ctx.fillStyle = dark;
  ctx.fillRect(104, 262, 32, 138); // torre sinistra
  ctx.fillRect(224, 262, 32, 138); // torre destra
  ctx.fillRect(136, 300, 88, 100); // muro centrale
  ctx.fillRect(160, 244, 40, 60); // torrione centrale
  // merli
  ctx.fillStyle = dark;
  for (let x = 104; x < 136; x += 8) ctx.fillRect(x, 254, 4, 8);
  for (let x = 224; x < 256; x += 8) ctx.fillRect(x, 254, 4, 8);
  for (let x = 160; x < 200; x += 8) ctx.fillRect(x, 236, 4, 8);
  for (let x = 136; x < 224; x += 8) ctx.fillRect(x, 292, 4, 8);
  // tetti a punta sulle torri
  ctx.fillStyle = "#2b1f4a";
  for (let i = 0; i < 8; i++) {
    ctx.fillRect(104 + i * 2, 252 - i * 2, 32 - i * 4, 2);
    ctx.fillRect(224 + i * 2, 252 - i * 2, 32 - i * 4, 2);
  }
  // portone
  ctx.fillStyle = darker;
  ctx.fillRect(170, 372, 20, 28);
  ctx.fillRect(172, 368, 16, 4);
  ctx.fillRect(174, 366, 12, 2);
  // luce del portone
  ctx.fillStyle = "#c98a2e";
  ctx.fillRect(178, 380, 4, 20);
  // pietre (dettaglio)
  ctx.fillStyle = "#1f1b3d";
  for (let y = 306; y < 396; y += 10) {
    for (let x = 140 + ((y / 10) % 2) * 6; x < 220; x += 12) ctx.fillRect(x, y, 6, 3);
  }

  // prato
  ctx.fillStyle = "#2f7a3a";
  ctx.fillRect(0, HORIZON, W, H - HORIZON);
  ctx.fillStyle = "#3a8a44";
  ctx.fillRect(0, HORIZON, W, 6);
  // erba più scura a chiazze
  ctx.fillStyle = "#286a31";
  for (let i = 0; i < 260; i++) {
    const x = randInt(0, W - 4);
    const y = randInt(HORIZON + 8, H - 4);
    ctx.fillRect(x, y, randInt(2, 5), 2);
  }
  // sentiero verso il castello
  ctx.fillStyle = "#6b5a3e";
  for (let y = HORIZON; y < H; y += 4) {
    const t = (y - HORIZON) / (H - HORIZON);
    const w = Math.round(6 + 26 * t);
    ctx.fillRect(180 - w + Math.round(Math.sin(t * 6) * 6), y, w * 2, 4);
  }
  // fiori
  for (let i = 0; i < 26; i++) {
    const spr = pick(SPR.flowers);
    ctx.globalAlpha = 0.8;
    ctx.drawImage(spr, randInt(0, W - 10), randInt(HORIZON + 14, H - 14));
  }
  ctx.globalAlpha = 1;
  // alberi ai lati (silhouette)
  ctx.drawImage(SPR.treeShadow, -14, 392);
  ctx.drawImage(SPR.treeShadow, 22, 410);
  ctx.drawImage(SPR.treeShadow, 326, 396);
  ctx.drawImage(SPR.treeShadow, 300, 428);
  ctx.drawImage(SPR.treeShadow, -20, 560);
  ctx.drawImage(SPR.treeShadow, 330, 580);

  return canvas;
}
