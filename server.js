/**
 * Production static file server for Expo web export (dist/).
 * Binds to Render-assigned PORT and 0.0.0.0 for external traffic.
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DIST_DIR = path.join(__dirname, 'dist');

app.use(express.static(DIST_DIR, { index: 'index.html', extensions: ['html'] }));

app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`CalmMama Village web app listening on http://${HOST}:${PORT}`);
});
