/**
 * Production static file server for Expo web export (dist/).
 * Serves only pre-built static assets — never Metro dev / Hermes bundles.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_HTML = path.join(DIST_DIR, 'index.html');

function assertProductionDist() {
  if (!fs.existsSync(INDEX_HTML)) {
    console.error(
      '[CalmMama] dist/index.html is missing.\n' +
        'Build before starting: npm run build\n' +
        'Production must NOT use "expo start" or "npm start".'
    );
    process.exit(1);
  }

  const html = fs.readFileSync(INDEX_HTML, 'utf8');
  if (/dev=true|transform\.engine=hermes/i.test(html)) {
    console.error(
      '[CalmMama] dist/index.html references a dev Metro/Hermes bundle.\n' +
        'Run: npm run build'
    );
    process.exit(1);
  }
}

assertProductionDist();

app.disable('x-powered-by');

app.use(
  express.static(DIST_DIR, {
    index: false,
    fallthrough: true,
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  })
);

app.get('*', (req, res) => {
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') {
    res.status(404).type('text/plain').send('Static asset not found. Re-run npm run build.');
    return;
  }
  res.sendFile(INDEX_HTML);
});

app.listen(PORT, HOST, () => {
  console.log(`CalmMama Village web app listening on http://${HOST}:${PORT}`);
});
