import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Jimp } from 'jimp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sourcePath = path.join(__dirname, '..', 'assets', 'calmmama-official-logo.png');
const pngPath = path.join(__dirname, '..', 'assets', 'calmmama-official-logo.png');
const outPath = path.join(__dirname, '..', 'calmmamaLogoBase64.js');

const MAX_SIZE = 512;
const BLACK_THRESHOLD = 55;
const WHITE_THRESHOLD = 250;

function keyOutMatte(image) {
  image.scan(0, 0, image.width, image.height, function scanPixel(_x, _y, idx) {
    const r = this.bitmap.data[idx];
    const g = this.bitmap.data[idx + 1];
    const b = this.bitmap.data[idx + 2];
    const isBlack = r < BLACK_THRESHOLD && g < BLACK_THRESHOLD && b < BLACK_THRESHOLD;
    const isWhite = r > WHITE_THRESHOLD && g > WHITE_THRESHOLD && b > WHITE_THRESHOLD;
    if (isBlack || isWhite) {
      this.bitmap.data[idx + 3] = 0;
    }
  });
  return image;
}

const image = await Jimp.read(sourcePath);

if (image.width > MAX_SIZE || image.height > MAX_SIZE) {
  image.scaleToFit({ w: MAX_SIZE, h: MAX_SIZE });
}

keyOutMatte(image);

const pngBuffer = await image.getBuffer('image/png');
fs.writeFileSync(pngPath, pngBuffer);

const uri = `data:image/png;base64,${pngBuffer.toString('base64')}`;

fs.writeFileSync(
  outPath,
  `// Official Calm Mama Village logo — PNG with alpha, offline-ready\nexport const CALMMAMA_OFFICIAL_LOGO = ${JSON.stringify(uri)};\nexport const CALMMAMA_LOGO_NEEDS_BLEND = false;\n`,
  'utf8'
);

console.log(`Wrote transparent PNG (${pngBuffer.length} bytes) and ${outPath} (${uri.length} chars)`);
