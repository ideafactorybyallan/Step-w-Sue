/**
 * generate-icons.mjs
 *
 * Generates PWA icon PNGs from scratch using Node.js built-ins only.
 * Run with: node scripts/generate-icons.mjs
 *
 * Creates:
 *   public/icons/icon-192x192.png
 *   public/icons/icon-512x512.png
 *   public/icons/apple-touch-icon.png  (180x180)
 */

import { createWriteStream } from 'fs';
import { deflate } from 'zlib';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const deflateAsync = promisify(deflate);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'public', 'icons');

// Navy background: #1B2F5E  →  r=27, g=47, b=94
// Pink accent:     #E8234A  →  r=232, g=35, b=74

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
  const { r: bgR, g: bgG, b: bgB } = { r: 27, g: 47, b: 94 };      // navy
  const { r: acR, g: acG, b: acB } = { r: 232, g: 35, b: 74 };     // pink
  const { r: wR, g: wG, b: wB } = { r: 255, g: 255, b: 255 };      // white

  // Draw a navy square with a pink rounded rectangle and "SW" text hint
  const raw = Buffer.alloc(size * (1 + size * 3));

  for (let y = 0; y < size; y++) {
    raw[y * (1 + size * 3)] = 0; // filter none
    for (let x = 0; x < size; x++) {
      const offset = y * (1 + size * 3) + 1 + x * 3;

      // Normalized coords -1..1
      const nx = (x / size - 0.5) * 2;
      const ny = (y / size - 0.5) * 2;

      // Pink rounded rect (shoe sole metaphor): 60% wide, 40% tall
      const inRect = Math.abs(nx) < 0.6 && Math.abs(ny) < 0.4;
      const corner = Math.sqrt(Math.max(0, Math.abs(nx) - 0.5) ** 2 + Math.max(0, Math.abs(ny) - 0.3) ** 2);
      const inRounded = Math.abs(nx) < 0.62 && Math.abs(ny) < 0.42 && corner < 0.15;

      // Simple "SW" lettering area (rough pixel blocks)
      const lx = Math.floor((nx + 1) / 2 * 8); // 0–7
      const ly = Math.floor((ny + 1) / 2 * 8); // 0–7

      // S shape: cols 0-2, rows 1-6
      const S = [
        [0,1,1,0], [1,0,0,1], [1,0,0,0], [0,1,1,0], [0,0,0,1], [1,0,0,1], [0,1,1,0],
      ];
      // W shape: cols 4-7, rows 1-6
      const W = [
        [1,0,0,1], [1,0,0,1], [1,0,0,1], [1,0,1,1], [1,1,0,1], [0,1,1,0], [0,0,0,0],
      ];

      const inS = ly >= 1 && ly <= 7 && lx >= 0 && lx <= 3 && S[ly - 1]?.[lx];
      const inW = ly >= 1 && ly <= 7 && lx >= 4 && lx <= 7 && W[ly - 1]?.[lx - 4];

      let r, g, b;
      if (inRounded && (inS || inW)) {
        r = wR; g = wG; b = wB;    // white text on pink
      } else if (inRounded) {
        r = acR; g = acG; b = acB; // pink block
      } else {
        r = bgR; g = bgG; b = bgB; // navy bg
      }

      raw[offset] = r;
      raw[offset + 1] = g;
      raw[offset + 2] = b;
    }
  }

  const compressed = await deflateAsync(raw, { level: 9 });

  // Build PNG
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

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
  const ws = createWriteStream(filePath);
  ws.write(data);
  ws.end();
  console.log(`✓ Created ${filePath} (${size}×${size})`);
}

await write(path.join(outDir, 'icon-192x192.png'), 192);
await write(path.join(outDir, 'icon-512x512.png'), 512);
await write(path.join(outDir, 'apple-touch-icon.png'), 180);

console.log('\nAll icons generated! 🎉');
console.log('Tip: For a polished icon, replace these with custom artwork using realfavicongenerator.net');
