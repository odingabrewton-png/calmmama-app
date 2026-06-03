/**
 * Production web export for Render / static hosting.
 * Forces NODE_ENV=production and rejects dev/Hermes bundle artifacts.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const WEB_JS_DIR = path.join(DIST, '_expo', 'static', 'js', 'web');

const env = {
  ...process.env,
  NODE_ENV: 'production',
  BABEL_ENV: 'production',
};

console.log('[CalmMama] Building production web export (expo export --platform web --clear)...');

execSync('npx expo export --platform web --clear', {
  cwd: ROOT,
  stdio: 'inherit',
  env,
});

const indexHtmlPath = path.join(DIST, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error('[CalmMama] Build failed: dist/index.html was not created.');
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

if (/dev=true|transform\.engine=hermes|hot=false/i.test(indexHtml)) {
  console.error(
    '[CalmMama] dist/index.html references a Metro DEV/Hermes URL. Use expo export, not expo start.'
  );
  process.exit(1);
}

if (!/\/_expo\/static\/js\/web\/index-[a-f0-9]+\.js/.test(indexHtml)) {
  console.error('[CalmMama] dist/index.html does not reference a hashed production web bundle.');
  process.exit(1);
}

if (!fs.existsSync(WEB_JS_DIR)) {
  console.error('[CalmMama] Missing dist/_expo/static/js/web/ — export did not produce a web bundle.');
  process.exit(1);
}

const jsFiles = fs.readdirSync(WEB_JS_DIR).filter((name) => name.endsWith('.js'));
if (!jsFiles.length) {
  console.error('[CalmMama] No .js bundle found under dist/_expo/static/js/web/.');
  process.exit(1);
}

for (const file of jsFiles) {
  const head = fs.readFileSync(path.join(WEB_JS_DIR, file), 'utf8').slice(0, 800);
  if (/__DEV__\s*=\s*true/.test(head)) {
    console.error(`[CalmMama] ${file} is a development bundle (__DEV__=true).`);
    process.exit(1);
  }
}

console.log(`[CalmMama] Production web export OK (${jsFiles.length} bundle(s)).`);
