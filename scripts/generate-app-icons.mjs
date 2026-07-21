/**
 * Generates Expo / App Store icon assets from assets/calmmama-app-icon-source.(png|jpg)
 * Run: node scripts/generate-app-icons.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Jimp } from 'jimp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.join(__dirname, '..', 'assets');
const publicDir = path.join(__dirname, '..', 'public');
const SOURCE_CANDIDATES = [
  path.join(assetsDir, 'calmmama-app-icon-source.png'),
  path.join(assetsDir, 'calmmama-app-icon-source.jpg'),
];
const ICON_SIZE = 1024;

function rgbHex({ r, g, b }) {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

function rgbaFromPixel(color) {
  // jimp pixel: 0xRRGGBBAA
  return {
    r: (color >>> 24) & 0xff,
    g: (color >>> 16) & 0xff,
    b: (color >>> 8) & 0xff,
    a: color & 0xff,
  };
}

function sampleBackground(image) {
  const points = [
    [4, 4],
    [image.width - 5, 4],
    [4, image.height - 5],
    [image.width - 5, image.height - 5],
  ];
  const samples = points.map(([x, y]) => rgbaFromPixel(image.getPixelColor(x, y)));
  const avg = samples.reduce(
    (acc, c) => ({
      r: acc.r + c.r / samples.length,
      g: acc.g + c.g / samples.length,
      b: acc.b + c.b / samples.length,
    }),
    { r: 0, g: 0, b: 0 }
  );
  return {
    r: Math.round(avg.r),
    g: Math.round(avg.g),
    b: Math.round(avg.b),
  };
}

async function padToSquare(image, size, bg) {
  const canvas = new Jimp({ width: size, height: size, color: bg });
  const x = Math.round((size - image.width) / 2);
  const y = Math.round((size - image.height) / 2);
  canvas.composite(image, x, y);
  return canvas;
}

/**
 * Crop to the bounding box of the main artwork. Rows/columns only count as
 * content when enough pixels differ from the background, so tiny stray marks
 * (e.g. watermark sparkles) don't skew the bounds.
 */
function cropToContent(image, bg, tolerance = 24, minDensity = 0.01) {
  const colCounts = new Array(image.width).fill(0);
  const rowCounts = new Array(image.height).fill(0);
  for (let y = 0; y < image.height; y += 1) {
    for (let x = 0; x < image.width; x += 1) {
      const { r, g, b } = rgbaFromPixel(image.getPixelColor(x, y));
      const diff = Math.abs(r - bg.r) + Math.abs(g - bg.g) + Math.abs(b - bg.b);
      if (diff > tolerance) {
        colCounts[x] += 1;
        rowCounts[y] += 1;
      }
    }
  }
  // Use the largest contiguous content block on each axis so isolated
  // stray marks far from the artwork are excluded entirely.
  const largestRun = (counts, threshold) => {
    let best = null;
    let start = null;
    let mass = 0;
    for (let i = 0; i <= counts.length; i += 1) {
      const on = i < counts.length && counts[i] > threshold;
      if (on) {
        if (start === null) {
          start = i;
          mass = 0;
        }
        mass += counts[i];
      } else if (start !== null) {
        if (!best || mass > best.mass) best = { start, end: i - 1, mass };
        start = null;
      }
    }
    return best;
  };
  const colRun = largestRun(colCounts, image.height * minDensity);
  const rowRun = largestRun(rowCounts, image.width * minDensity);
  if (!colRun || !rowRun) return image.clone();
  return image.clone().crop({
    x: colRun.start,
    y: rowRun.start,
    w: colRun.end - colRun.start + 1,
    h: rowRun.end - rowRun.start + 1,
  });
}

/** Scale artwork so it fills `fillRatio` of the square canvas, centered on bg. */
async function artworkOnSquare(artwork, size, bg, fillRatio) {
  const target = size * fillRatio;
  const scale = Math.min(target / artwork.width, target / artwork.height);
  const fitted = artwork.clone().resize({
    w: Math.max(1, Math.round(artwork.width * scale)),
    h: Math.max(1, Math.round(artwork.height * scale)),
  });
  return padToSquare(fitted, size, bg);
}

async function main() {
  const SOURCE = SOURCE_CANDIDATES.find((p) => fs.existsSync(p));
  if (!SOURCE) {
    console.error(`Missing source image. Tried:\n${SOURCE_CANDIDATES.join('\n')}`);
    process.exit(1);
  }

  const src = await Jimp.read(SOURCE);
  const bg = sampleBackground(src);
  const bgHex = rgbHex(bg);
  console.log(`Source: ${path.basename(SOURCE)}`);
  console.log(`Background color: ${bgHex}`);

  // Crop away the flat background so the lotus mark fills most of the icon.
  const artwork = cropToContent(src, bg);
  console.log(`Artwork bounds: ${artwork.width}x${artwork.height} (from ${src.width}x${src.height})`);

  const icon = await artworkOnSquare(artwork, ICON_SIZE, bg, 0.86);
  await icon.write(path.join(assetsDir, 'icon.png'));

  // Splash keeps more breathing room around the mark.
  const splash = await artworkOnSquare(artwork, ICON_SIZE, bg, 0.7);
  await splash.write(path.join(assetsDir, 'splash-icon.png'));

  const favicon = icon.clone().resize({ w: 48, h: 48 });
  await favicon.write(path.join(assetsDir, 'favicon.png'));

  // Android adaptive foreground: keep artwork inside the ~66% safe zone mask.
  const androidForeground = await artworkOnSquare(artwork, ICON_SIZE, bg, 0.6);
  await androidForeground.write(path.join(assetsDir, 'android-icon-foreground.png'));

  const androidBg = new Jimp({ width: ICON_SIZE, height: ICON_SIZE, color: bg });
  await androidBg.write(path.join(assetsDir, 'android-icon-background.png'));

  const mono = androidForeground.clone().greyscale();
  await mono.write(path.join(assetsDir, 'android-icon-monochrome.png'));

  // PWA / Add to Home Screen icons (copied into dist from public/ on export)
  fs.mkdirSync(publicDir, { recursive: true });
  await icon.clone().resize({ w: 180, h: 180 }).write(path.join(publicDir, 'apple-touch-icon.png'));
  await icon.clone().resize({ w: 192, h: 192 }).write(path.join(publicDir, 'logo192.png'));
  await icon.clone().resize({ w: 512, h: 512 }).write(path.join(publicDir, 'logo512.png'));

  const metaPath = path.join(assetsDir, 'app-icon-meta.json');
  fs.writeFileSync(
    metaPath,
    JSON.stringify({ backgroundColor: bgHex, source: path.basename(SOURCE) }, null, 2),
  );

  console.log('Wrote icon.png, splash-icon.png, favicon.png, android-icon-*.png');
  console.log('Wrote public/apple-touch-icon.png, logo192.png, logo512.png');
  console.log(`Meta: ${metaPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
