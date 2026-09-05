// ============================================================================
//  sprites.js — tutta la pixel art, disegnata come griglie di caratteri.
//  "." = trasparente. Ogni sprite viene pre-renderizzato su un canvas
//  fuori schermo una sola volta, poi disegnato con drawImage.
// ============================================================================
import { makeSprite, flipSprite, silhouette } from "./pixel.js";

export const RABBIT_SCALE = 3;        // 16x16 art -> 48x48 pixel logici
export const RABBIT_SIZE = 16 * RABBIT_SCALE;

const OUT = "#1c1a2e";

// ---------------------------------------------------------------- conigli
// Coniglio aggressivo: occhi rossi, sopracciglia aggrottate, denti.
const ANGRY_A = [
  "...kk......kk...",
  "..kppk....kppk..",
  "..kppk....kppk..",
  "..kppk....kppk..",
  "..kffk....kffk..",
  ".kffffkkkkffffk.",
  "kffffffffffffffk",
  "kfkkffffffffkkfk",
  "kfffkkffffkkfffk",
  "kfffrkffffkrfffk",
  "kfffrrffffrrfffk",
  "kfffffkkkkfffffk",
  "kfffffkwwkfffffk",
  ".kffffffffffffk.",
  ".kffkkffffkkffk.",
  "..kkk......kkk..",
];
// Secondo frame: orecchie aperte (per il saltello).
const EARS_OPEN = [".kk..........kk.", ".kppk......kppk."];
const ANGRY_B = [...EARS_OPEN, ...ANGRY_A.slice(2)];

// Coniglio carino: occhi chiusi felici, guance rosa, fiocco sull'orecchio.
const SWEET_A = [
  "...kk......kk...",
  "..kppk....kppk..",
  "..kppk....kppk..",
  "..kppk...bkppkb.",
  "..kffk....kbbk..",
  ".kffffkkkkffffk.",
  "kffffffffffffffk",
  "kffffffffffffffk",
  "kfffkffffffkfffk",
  "kffkfkffffkfkffk",
  "kfccfffnnfffccfk",
  "kffffkffffkffffk",
  "kfffffkkkkfffffk",
  ".kffffffffffffk.",
  ".kffkkffffkkffk.",
  "..kkk......kkk..",
];
const SWEET_B = [...EARS_OPEN, ...SWEET_A.slice(2)];

// Coniglio dorato: occhi grandi e lucidi, sorrisetto.
const GOLD_A = [
  "...kk......kk...",
  "..kppk....kppk..",
  "..kppk....kppk..",
  "..kppk....kppk..",
  "..kffk....kffk..",
  ".kffffkkkkffffk.",
  "kffffffffffffffk",
  "kffffffffffffffk",
  "kfffwkffffkwfffk",
  "kfffkkffffkkfffk",
  "kfccfffnnfffccfk",
  "kffffffkkffffffk",
  "kffffffffffffffk",
  ".kffffffffffffk.",
  ".kffkkffffkkffk.",
  "..kkk......kkk..",
];
const GOLD_B = [...EARS_OPEN, ...GOLD_A.slice(2)];

const PAL_ANGRY = { k: OUT, f: "#8f8fa3", p: "#c95a6e", r: "#ff2a2a", w: "#ffffff" };
const PAL_SWEET = { k: "#3b2a3e", f: "#fff7fa", p: "#ffb3c6", c: "#ffa3b5", n: "#ff6f91", b: "#ff4d6d", w: "#ffffff" };
const PAL_GOLD = { k: "#5a3a00", f: "#ffd23f", p: "#ffa64d", c: "#ffb07a", n: "#e0741f", w: "#ffffff" };

// ---------------------------------------------------------------- oggetti
const CARROT = [
  "..g..g..",
  "...gg...",
  ".kkkkkk.",
  "kooooook",
  "kolooook",
  ".koooook",
  ".koloook",
  "..kooook",
  "..kooook",
  "...kook.",
  "...kook.",
  "....kk..",
];
const PAL_CARROT = { g: "#3cb043", o: "#ff8c1a", l: "#ffb15c", k: "#4a2a10" };

const HEART = [
  ".hh.hh.",
  "hwhhhhh",
  "hhhhhhh",
  ".hhhhh.",
  "..hhh..",
  "...h...",
];
const PAL_HEART = { h: "#ff4d6d", w: "#ffb3c6" };

const SPARKLE = ["..y..", ".yyy.", "yywyy", ".yyy.", "..y.."];
const PAL_SPARKLE = { y: "#ffe066", w: "#ffffff" };

const FLOWER = [".ppp.", "ppypp", ".ppp.", "..g..", "..g.."];
const FLOWER_COLORS = ["#ff8fab", "#ffffff", "#8ecae6", "#ffd6ff", "#ffb703"];

const TUFT = ["g.g.g", "g.g.g", ".ggg."];
const PAL_TUFT = { g: "#3e8e41" };

const ANGRY_MARK = ["r.r", "r.r", "r.r", "r.r", "...", "r.r"];
const PAL_MARK = { r: "#ff2a2a" };

// ---------------------------------------------------------------- scenario
const BUSH = [
  ".....kkkkk......",
  "...kklllllkk....",
  "..klllllllllk...",
  ".kllllbllllllk..",
  "kllllbbllllbllk.",
  "klllbblllllblllk",
  "kbllbbbllllbbllk",
  "kbbbbbbblbbbbbbk",
  ".kbbbbbbbbbbbbk.",
  "..kkkkkkkkkkkk..",
];
const PAL_BUSH = { k: "#1b4d1e", l: "#4caf50", b: "#2e7d32" };

const TREE = [
  ".....kkkkkk.....",
  "...kklllllllkk..",
  "..kllllllllllk..",
  ".klllllllllllllk",
  "klllllbllllllllk",
  "kllllbbbllllbllk",
  "klllbbblllllbblk",
  "kbllbblllllbbblk",
  "kbbbbbllllbbbbbk",
  "kbbbbbbbbbbbbbbk",
  ".kbbbbbbbbbbbbk.",
  "..kkkbbbbbbkkk..",
  ".....kbbbbk.....",
  "......kttk......",
  "......kttk......",
  "......kttk......",
  "......kttk......",
  "......kttk......",
  ".....kttttk.....",
  ".....kkkkkk.....",
];
const PAL_TREE = { k: "#1b4d1e", l: "#5cb85c", b: "#2e7d32", t: "#8d5a2b" };

const FENCE = [
  ".kk..........kk.",
  "kffk........kffk",
  "kffk........kffk",
  "kffkkkkkkkkkkffk",
  "kffffffffffffffk",
  "kffkddddddddkffk",
  "kffk........kffk",
  "kffkkkkkkkkkkffk",
  "kffffffffffffffk",
  "kffkddddddddkffk",
  "kffk........kffk",
  "kkkk........kkkk",
];
const PAL_FENCE = { k: "#4a2a10", f: "#c68642", d: "#8d5a2b" };

const MOON = [
  "....kkkk....",
  "..kkmmmmkk..",
  ".kmmmmmmmmk.",
  ".kmmdmmmmmk.",
  "kmmmmmmmmmmk",
  "kmmmmmmddmmk",
  "kmmmmmmddmmk",
  "kmmdmmmmmmmk",
  ".kmmmmmmmmk.",
  ".kmmmmdmmmk.",
  "..kkmmmmkk..",
  "....kkkk....",
];
const PAL_MOON = { k: "#c9b96a", m: "#fff2b0", d: "#e8d98a" };

const CLOUD = [
  "....wwww........",
  "..wwwwwwww......",
  ".wwwwwwwwwwwww..",
  "wwwwwwwwwwwwwww.",
  "wwwwwwwwwwwwwwww",
  ".wwwwwwwwwwwwww.",
];

// ---------------------------------------------------------------- controllo
function check(name, rows) {
  const w = rows[0].length;
  rows.forEach((r, i) => {
    if (r.length !== w) console.warn(`[sprites] "${name}" riga ${i}: larghezza ${r.length}, attesa ${w}`);
  });
  return rows;
}
[
  ["ANGRY_A", ANGRY_A], ["ANGRY_B", ANGRY_B], ["SWEET_A", SWEET_A], ["SWEET_B", SWEET_B],
  ["GOLD_A", GOLD_A], ["GOLD_B", GOLD_B], ["CARROT", CARROT], ["HEART", HEART],
  ["SPARKLE", SPARKLE], ["FLOWER", FLOWER], ["TUFT", TUFT], ["ANGRY_MARK", ANGRY_MARK],
  ["BUSH", BUSH], ["TREE", TREE], ["FENCE", FENCE], ["MOON", MOON], ["CLOUD", CLOUD],
].forEach(([n, r]) => check(n, r));

// ---------------------------------------------------------------- build
function rabbit(framesA, framesB, pal) {
  const right = [makeSprite(framesA, pal, RABBIT_SCALE), makeSprite(framesB, pal, RABBIT_SCALE)];
  return {
    right,
    left: right.map(flipSprite),
    flash: silhouette(right[0], "#ffffff"),
    flashLeft: silhouette(flipSprite(right[0]), "#ffffff"),
  };
}

export const RABBITS = {
  angry: rabbit(ANGRY_A, ANGRY_B, PAL_ANGRY),
  sweet: rabbit(SWEET_A, SWEET_B, PAL_SWEET),
  gold: rabbit(GOLD_A, GOLD_B, PAL_GOLD),
};

export const SPR = {
  carrot: makeSprite(CARROT, PAL_CARROT, 2),          // 16x24
  heart: makeSprite(HEART, PAL_HEART, 2),             // 14x12
  heartSmall: makeSprite(HEART, PAL_HEART, 1),        // 7x6
  sparkle: makeSprite(SPARKLE, PAL_SPARKLE, 2),       // 10x10
  sparkleSmall: makeSprite(SPARKLE, PAL_SPARKLE, 1),
  flowers: FLOWER_COLORS.map((c) => makeSprite(FLOWER, { p: c, y: "#ffd166", g: "#2e7d32" }, 2)),
  tuft: makeSprite(TUFT, PAL_TUFT, 2),
  angryMark: makeSprite(ANGRY_MARK, PAL_MARK, 2),     // 6x12
  bush: makeSprite(BUSH, PAL_BUSH, 3),                // 48x30
  tree: makeSprite(TREE, PAL_TREE, 3),                // 48x60
  fence: makeSprite(FENCE, PAL_FENCE, 3),             // 48x36
  moon: makeSprite(MOON, PAL_MOON, 3),                // 36x36
  cloud: makeSprite(CLOUD, { w: "#ffffff" }, 3),      // 48x18
  cloudSmall: makeSprite(CLOUD, { w: "#f1f1ff" }, 2), // 32x12
  // silhouette scure per la schermata titolo
  rabbitShadow: silhouette(makeSprite(ANGRY_A, PAL_ANGRY, 2), "#0d0b22"),
  treeShadow: silhouette(makeSprite(TREE, PAL_TREE, 3), "#0d0b22"),
};
