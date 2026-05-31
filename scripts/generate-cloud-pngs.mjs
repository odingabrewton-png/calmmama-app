/** Generates soft translucent mood-cloud PNGs for Soul Sanctuary */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Jimp } from 'jimp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets');

const CLOUDS = [
  { name: 'soul-cloud-sage', rgb: [186, 198, 188] },
  { name: 'soul-cloud-peach', rgb: [233, 168, 137] },
  { name: 'soul-cloud-lavender', rgb: [196, 184, 214] },
];

const W = 320;
const H = 180;

function paintCloud(image, rgb) {
  const [r, g, b] = rgb;
  const blobs = [
    { cx: 100, cy: 95, rx: 78, ry: 48, a: 0.42 },
    { cx: 165, cy: 82, rx: 92, ry: 52, a: 0.48 },
    { cx: 230, cy: 98, rx: 70, ry: 44, a: 0.4 },
    { cx: 140, cy: 118, rx: 110, ry: 38, a: 0.36 },
    { cx: 200, cy: 72, rx: 55, ry: 32, a: 0.3 },
  ];

  for (const blob of blobs) {
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        const dx = (x - blob.cx) / blob.rx;
        const dy = (y - blob.cy) / blob.ry;
        const dist = dx * dx + dy * dy;
        if (dist <= 1) {
          const edge = 1 - dist;
          const alpha = Math.min(255, Math.floor(edge * blob.a * 255));
          const idx = (y * W + x) * 4;
          const existing = image.bitmap.data[idx + 3];
          if (alpha > existing) {
            image.bitmap.data[idx] = r;
            image.bitmap.data[idx + 1] = g;
            image.bitmap.data[idx + 2] = b;
            image.bitmap.data[idx + 3] = alpha;
          }
        }
      }
    }
  }
}

for (const cloud of CLOUDS) {
  const image = new Jimp({ width: W, height: H, color: 0x00000000 });
  paintCloud(image, cloud.rgb);
  image.blur(6);
  const out = path.join(assetsDir, `${cloud.name}.png`);
  const buf = await image.getBuffer('image/png');
  fs.writeFileSync(out, buf);
  console.log(`Wrote ${out} (${buf.length} bytes)`);
}
