// ============================================================================
//  pixel.js — utility per la pixel art "disegnata a codice"
//  Uno sprite è un array di stringhe: ogni carattere è un pixel, la palette
//  mappa carattere -> colore. Il punto "." (o lo spazio) è trasparente.
// ============================================================================

export function makeSprite(rows, palette, scale = 1) {
  const h = rows.length;
  const w = Math.max(...rows.map((r) => r.length));
  const c = document.createElement("canvas");
  c.width = w * scale;
  c.height = h * scale;
  const ctx = c.getContext("2d");
  for (let y = 0; y < h; y++) {
    const row = rows[y];
    for (let x = 0; x < row.length; x++) {
      const col = palette[row[x]];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  return c;
}

// Specchia orizzontalmente uno sprite (per farlo guardare a sinistra).
export function flipSprite(sprite) {
  const c = document.createElement("canvas");
  c.width = sprite.width;
  c.height = sprite.height;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.translate(c.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(sprite, 0, 0);
  return c;
}

// Silhouette monocolore dello sprite (per il "flash" quando lo tocchi).
export function silhouette(sprite, color) {
  const c = document.createElement("canvas");
  c.width = sprite.width;
  c.height = sprite.height;
  const ctx = c.getContext("2d");
  ctx.drawImage(sprite, 0, 0);
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, c.width, c.height);
  return c;
}

export function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  return { canvas: c, ctx };
}

// Piccoli helper numerici.
export const rand = (a, b) => a + Math.random() * (b - a);
export const randInt = (a, b) => Math.floor(rand(a, b + 1));
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const easeOut = (t) => 1 - (1 - t) * (1 - t);
