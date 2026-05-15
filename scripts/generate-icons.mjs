/**
 * generate-icons.mjs
 *
 * Generates PWA icon PNGs from scratch using Node.js built-ins only.
 * Creates a stacked "STEP / w / SUE" logo on a navy background, with
 * brand colors (pink STEP, gold w, white SUE).
 *
 * Run with: node scripts/generate-icons.mjs
 */

import { createWriteStream } from 'fs';
import { deflate } from 'zlib';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const deflateAsync = promisify(deflate);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');

// Brand colors
const NAVY   = [27, 47, 94];     // #1B2F5E
const PINK   = [232, 35, 74];    // #E8234A
const GOLD   = [245, 197, 24];   // #F5C518
const WHITE  = [255, 255, 255];
const TEAL   = [43, 184, 170];   // #2BB8AA
const NAVY_LIGHT = [42, 69, 128]; // #2A4580

// 5×7 bitmap font — 1 = pixel filled
const FONT = {
  S: [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,0],
    [0,1,1,1,0],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  T: [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
  ],
  E: [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  P: [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
  ],
  U: [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  // lowercase w — 5 wide, 5 tall
  w: [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,1,0,1],
    [1,1,0,1,1],
    [0,1,0,1,0],
  ],
};

const LETTER_W = 5;
const LETTER_H_UPPER = 7;
const LETTER_H_LOWER = 5;

function setPixel(pixels, size, x, y, [r, g, b]) {
  if (x < 0 || x >= size || y < 0 || y >= size) return;
  const offset = y * (1 + size * 3) + 1 + x * 3;
  pixels[offset] = r;
  pixels[offset + 1] = g;
  pixels[offset + 2] = b;
}

function drawWord(pixels, size, word, x, y, scale, color, kerning = 1) {
  let cursorX = x;
  for (const char of word) {
    const glyph = FONT[char];
    if (!glyph) continue;
    const gh = glyph.length;
    const gw = glyph[0].length;
    for (let gy = 0; gy < gh; gy++) {
      for (let gx = 0; gx < gw; gx++) {
        if (glyph[gy][gx]) {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              setPixel(pixels, size, cursorX + gx * scale + dx, y + gy * scale + dy, color);
            }
          }
        }
      }
    }
    cursorX += (gw + kerning) * scale;
  }
}

function wordWidth(word, scale, kerning = 1) {
  if (word.length === 0) return 0;
  return word.length * LETTER_W * scale + (word.length - 1) * kerning * scale;
}

function crc32(buf) {
  const table = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return ((crc ^ 0xffffffff) >>> 0);
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([typeBytes, data]);
  const crcVal = Buffer.alloc(4);
  crcVal.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, typeBytes, data, crcVal]);
}

async function createPNG(size) {
  const raw = Buffer.alloc(size * (1 + size * 3));

  // Navy gradient background (top darker, bottom lighter)
  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 3)] = 0; // PNG filter byte
    const t = y / size;
    const r = Math.round(NAVY[0] + (NAVY_LIGHT[0] - NAVY[0]) * t * 0.4);
    const g = Math.round(NAVY[1] + (NAVY_LIGHT[1] - NAVY[1]) * t * 0.4);
    const b = Math.round(NAVY[2] + (NAVY_LIGHT[2] - NAVY[2]) * t * 0.4);
    for (let x = 0; x < size; x++) {
      const offset = y * (1 + size * 3) + 1 + x * 3;
      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }

  // Pink radial glow upper-left
  const glowR = size * 0.5;
  const glowCx = size * 0.22;
  const glowCy = size * 0.18;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.sqrt((x - glowCx) ** 2 + (y - glowCy) ** 2);
      if (d < glowR) {
        const s = (1 - d / glowR) * 0.20;
        const offset = y * (1 + size * 3) + 1 + x * 3;
        raw[offset]     = Math.round(raw[offset]     + (PINK[0] - raw[offset])     * s);
        raw[offset + 1] = Math.round(raw[offset + 1] + (PINK[1] - raw[offset + 1]) * s);
        raw[offset + 2] = Math.round(raw[offset + 2] + (PINK[2] - raw[offset + 2]) * s);
      }
    }
  }

  // Teal radial glow lower-right
  const g2R = size * 0.5;
  const g2Cx = size * 0.80;
  const g2Cy = size * 0.85;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const d = Math.sqrt((x - g2Cx) ** 2 + (y - g2Cy) ** 2);
      if (d < g2R) {
        const s = (1 - d / g2R) * 0.12;
        const offset = y * (1 + size * 3) + 1 + x * 3;
        raw[offset]     = Math.round(raw[offset]     + (TEAL[0] - raw[offset])     * s);
        raw[offset + 1] = Math.round(raw[offset + 1] + (TEAL[1] - raw[offset + 1]) * s);
        raw[offset + 2] = Math.round(raw[offset + 2] + (TEAL[2] - raw[offset + 2]) * s);
      }
    }
  }

  // Layout STEP / w / SUE
  const padX = Math.round(size * 0.10);
  const maxLineW = size - padX * 2;

  // STEP = 4 chars (4*5 + 3 kerns = 23 units), SUE = 3 chars (3*5 + 2 = 17 units)
  const stepScale = Math.floor(maxLineW / 23);
  const sueScale = Math.floor(maxLineW / 17);
  const lineScale = Math.min(stepScale, sueScale);
  const wScale = Math.max(1, Math.round(lineScale * 0.7));

  const stepW = wordWidth('STEP', lineScale);
  const sueW = wordWidth('SUE', lineScale);
  const wW = LETTER_W * wScale;

  const stepH = LETTER_H_UPPER * lineScale;
  const sueH = LETTER_H_UPPER * lineScale;
  const wH = LETTER_H_LOWER * wScale;

  const lineGap = Math.round(lineScale * 1.6);
  const totalH = stepH + lineGap + wH + lineGap + sueH;
  const startY = Math.round((size - totalH) / 2);

  const stepX = Math.round((size - stepW) / 2);
  const wX = Math.round((size - wW) / 2);
  const sueX = Math.round((size - sueW) / 2);

  const stepY = startY;
  const wY = stepY + stepH + lineGap;
  const sueY = wY + wH + lineGap;

  drawWord(raw, size, 'STEP', stepX, stepY, lineScale, PINK);
  drawWord(raw, size, 'w', wX, wY, wScale, GOLD);
  drawWord(raw, size, 'SUE', sueX, sueY, lineScale, WHITE);

  const compressed = await deflateAsync(raw, { level: 9 });

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const iend = Buffer.alloc(0);

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrData),
    chunk('IDAT', compressed),
    chunk('IEND', iend),
  ]);
}

async function write(filePath, size) {
  const data = await createPNG(size);
  await new Promise((resolve, reject) => {
    const ws = createWriteStream(filePath);
    ws.on('finish', resolve);
    ws.on('error', reject);
    ws.write(data);
    ws.end();
  });
  console.log(`✓ Created ${filePath} (${size}×${size})`);
}

await write(path.join(outDir, 'icon-192x192.png'), 192);
await write(path.join(outDir, 'icon-512x512.png'), 512);
await write(path.join(outDir, 'apple-touch-icon.png'), 180);

console.log('\nAll icons generated! Step / w / Sue logo, pink/gold/white on navy.');
