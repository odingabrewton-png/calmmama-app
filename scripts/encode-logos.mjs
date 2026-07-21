import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Jimp } from 'jimp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets');
const outPath = path.join(__dirname, '..', 'calmmamaLogoBase64.js');

const MAX_SIZE = 512;
const BLACK_THRESHOLD = 55;

const LOGOS = [
  {
    name: 'calmmama-village-badge',
    exportName: 'CALMMAMA_VILLAGE_BADGE',
    comment: 'Circular village badge — Bloom, Nursery, Profile, onboarding',
  },
];

function keyOutMatte(image) {
  const WHITE_THRESHOLD = 250;
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

function colorDistance(r, g, b, br, bg, bb) {
  return Math.sqrt((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2);
}

function isTerracottaCore(r, g, b) {
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const lum = (r + g + b) / 3;
  if (lum < 100 && spread < 70) return true;
  if (r > g + 12 && r > b + 8 && spread > 18 && lum >= 72 && lum <= 190) return true;
  return false;
}

function isLogoInk(r, g, b) {
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const lum = (r + g + b) / 3;
  if (lum < 112 && spread < 70) return true;
  if (r > g + 10 && r > b + 6 && spread > 16 && lum >= 68 && lum <= 225) return true;
  if (r >= 215 && g >= 198 && b >= 165 && lum >= 205 && spread >= 10) return true;
  return false;
}

function isBackdropPixel(r, g, b, br, bg, bb) {
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const lum = (r + g + b) / 3;
  if (colorDistance(r, g, b, br, bg, bb) <= 78 && spread < 55) return true;
  if (lum > 228 && spread < 42) return true;
  if (spread < 22 && lum > 100 && lum < 228) return true;
  return false;
}

function purgeNonInkPixels(image, br, bg, bb) {
  const { width, height, data } = image.bitmap;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] === 0) continue;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (isLogoInk(r, g, b)) continue;
      if (isBackdropPixel(r, g, b, br, bg, bb)) {
        data[idx + 3] = 0;
      }
    }
  }
}

function stripLightFringe(image) {
  const { width, height, data } = image.bitmap;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] < 16) continue;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      if (isLogoInk(r, g, b)) continue;
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      const lum = (r + g + b) / 3;
      if (lum > 168 && spread < 34) data[idx + 3] = 0;
      else if (lum > 128 && spread < 26) data[idx + 3] = 0;
      else if (r > 235 && g > 232 && b > 225) data[idx + 3] = 0;
    }
  }
}

/** Dark letter stroke only — removes peach/cream fill for galaxy float */
function isOutlineStroke(r, g, b) {
  const spread = Math.max(r, g, b) - Math.min(r, g, b);
  const lum = (r + g + b) / 3;
  return lum < 118 && spread < 62;
}

function keepOutlineOnly(image) {
  const { width, height, data } = image.bitmap;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] < 16) continue;
      if (!isOutlineStroke(data[idx], data[idx + 1], data[idx + 2])) {
        data[idx + 3] = 0;
      }
    }
  }
}

/** Warm luminous outline visible on deep nebula */
function paintCosmicOutlineGlow(image) {
  const { width, height, data } = image.bitmap;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3];
      if (a < 16) continue;
      const lum = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      const strength = 0.72 + (1 - lum / 118) * 0.28;
      data[idx] = 245;
      data[idx + 1] = 210;
      data[idx + 2] = 188;
      data[idx + 3] = Math.min(255, Math.round(a * strength));
    }
  }
}

function premultiplyAlpha(image) {
  const { width, height, data } = image.bitmap;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const a = data[idx + 3] / 255;
      data[idx] = Math.round(data[idx] * a);
      data[idx + 1] = Math.round(data[idx + 1] * a);
      data[idx + 2] = Math.round(data[idx + 2] * a);
    }
  }
}

function trimTransparentPadding(image, pad = 6, padTop = pad, padRight = pad, padBottom = pad, padLeft = pad) {
  const { width, height, data } = image.bitmap;
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 12) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX <= minX || maxY <= minY) return image;

  const x = Math.max(0, minX - padLeft);
  const y = Math.max(0, minY - padTop);
  const w = Math.min(width - x, maxX - minX + 1 + padLeft + padRight);
  const h = Math.min(height - y, maxY - minY + 1 + padTop + padBottom);
  return image.crop({ x, y, w, h });
}

function keyOutSanctuaryWordmark(image, tolerance = 58) {
  const { width, height, data } = image.bitmap;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const spread = Math.max(r, g, b) - Math.min(r, g, b);
      const lum = (r + g + b) / 3;

      if (r < 42 && g < 42 && b < 42) {
        data[idx + 3] = 0;
        continue;
      }
      if (!isLogoInk(r, g, b) && lum > 218 && spread < 30) {
        data[idx + 3] = 0;
      }
    }
  }

  const samples = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [Math.floor(width / 2), height - 1],
    [0, Math.floor(height / 2)],
    [width - 1, Math.floor(height / 2)],
  ];

  let br = 0;
  let bg = 0;
  let bb = 0;
  for (const [x, y] of samples) {
    const idx = (y * width + x) * 4;
    br += data[idx];
    bg += data[idx + 1];
    bb += data[idx + 2];
  }
  br = Math.round(br / samples.length);
  bg = Math.round(bg / samples.length);
  bb = Math.round(bb / samples.length);

  const visited = new Uint8Array(width * height);
  const queue = [];

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    const idx = p * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    const lum = (r + g + b) / 3;
    const nearEdgeBg = colorDistance(r, g, b, br, bg, bb) <= tolerance;
    const isPaper = lum > 228 && spread < 36;
    const isBlack = r < BLACK_THRESHOLD && g < BLACK_THRESHOLD && b < BLACK_THRESHOLD;
    if (!nearEdgeBg && !isPaper && !isBlack) return;
    visited[p] = 1;
    queue.push([x, y]);
  };

  for (let x = 0; x < width; x += 1) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length) {
    const [x, y] = queue.pop();
    const idx = (y * width + x) * 4;
    data[idx + 3] = 0;
    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }

  purgeNonInkPixels(image, br, bg, bb);
  purgeNonInkPixels(image, br, bg, bb);
  stripLightFringe(image);
  stripLightFringe(image);

  return trimTransparentPadding(image, 6, 22, 18, 6, 6);
}

async function buildSanctuaryLogos() {
  const rosegoldSource = path.join(assetsDir, 'calmmama-official-logo-rosegold-source.png');
  const fallbackSource = path.join(assetsDir, 'calmmama-official-logo.png');
  const sourcePath = fs.existsSync(rosegoldSource) ? rosegoldSource : fallbackSource;
  const raw = await Jimp.read(sourcePath);
  if (raw.width > MAX_SIZE || raw.height > MAX_SIZE) {
    raw.scaleToFit({ w: MAX_SIZE, h: MAX_SIZE });
  }

  const light = raw.clone();
  keyOutSanctuaryWordmark(light);
  premultiplyAlpha(light);
  const lightPath = path.join(assetsDir, 'calmmama-official-logo.png');
  const lightBuf = await light.getBuffer('image/png');
  fs.writeFileSync(lightPath, lightBuf);

  const cosmic = raw.clone();
  keyOutSanctuaryWordmark(cosmic);
  keepOutlineOnly(cosmic);
  paintCosmicOutlineGlow(cosmic);
  premultiplyAlpha(cosmic);
  const cosmicPath = path.join(assetsDir, 'calmmama-official-logo-cosmic.png');
  const cosmicBuf = await cosmic.getBuffer('image/png');
  fs.writeFileSync(cosmicPath, cosmicBuf);

  console.log(`CALMMAMA_OFFICIAL_LOGO: ${lightBuf.length} bytes`);
  console.log(`CALMMAMA_OFFICIAL_LOGO_COSMIC: ${cosmicBuf.length} bytes`);

  return {
    light: `data:image/png;base64,${lightBuf.toString('base64')}`,
    cosmic: `data:image/png;base64,${cosmicBuf.toString('base64')}`,
  };
}

async function encodeLogo({ name, exportName, comment }) {
  const sourcePath = path.join(assetsDir, `${name}.png`);
  const image = await Jimp.read(sourcePath);
  if (image.width > MAX_SIZE || image.height > MAX_SIZE) {
    image.scaleToFit({ w: MAX_SIZE, h: MAX_SIZE });
  }
  keyOutMatte(image);
  const pngBuffer = await image.getBuffer('image/png');
  fs.writeFileSync(sourcePath, pngBuffer);
  const uri = `data:image/png;base64,${pngBuffer.toString('base64')}`;
  console.log(`${exportName}: ${pngBuffer.length} bytes`);
  return { exportName, comment, uri };
}

const sanctuary = await buildSanctuaryLogos();
const encoded = [
  {
    exportName: 'CALMMAMA_OFFICIAL_LOGO',
    comment: 'Script wordmark — Sanctuary home (sage ombre)',
    uri: sanctuary.light,
  },
  {
    exportName: 'CALMMAMA_OFFICIAL_LOGO_COSMIC',
    comment: 'Script wordmark — Soul Sanctuary galaxy (outline only, no fill)',
    uri: sanctuary.cosmic,
  },
];

for (const logo of LOGOS) {
  encoded.push(await encodeLogo(logo));
}

const body = encoded
  .map((e) => `// ${e.comment}\nexport const ${e.exportName} = ${JSON.stringify(e.uri)};`)
  .join('\n\n');

fs.writeFileSync(
  outPath,
  `// Calm Mama Village logos — PNG with alpha, offline-ready\n// Rebuild: npm run encode-logos\n${body}\n`,
  'utf8'
);

console.log(`Wrote ${outPath}`);
