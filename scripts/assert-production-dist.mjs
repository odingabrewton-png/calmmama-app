/**
 * Guardrail before `npm run start:prod` — ensures dist/ is a production web export.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, '..', 'dist');
const indexHtmlPath = path.join(DIST, 'index.html');

if (!fs.existsSync(indexHtmlPath)) {
  console.error(
    '[CalmMama] dist/index.html is missing. Run: npm run build\n' +
      'Do NOT use "expo start" or "npm start" for production hosting.'
  );
  process.exit(1);
}

const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

if (/dev=true|transform\.engine=hermes/i.test(indexHtml)) {
  console.error(
    '[CalmMama] dist/index.html points at a dev Metro/Hermes bundle.\n' +
      'Run: npm run build  (expo export --platform web)'
  );
  process.exit(1);
}

console.log('[CalmMama] dist/ looks like a production web export.');
