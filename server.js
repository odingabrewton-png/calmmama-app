/**
 * Production static file server for Expo web export (dist/).
 * Serves only pre-built static assets — never Metro dev / Hermes bundles.
 * Also hosts /api/welcome-email (Resend) for Free Explorer + signup welcome mail.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const { sendWelcomeMamaEmail, addResendAudienceContact, resolveResendApiKey } = require('./welcomeEmail');
const { runWeeklyNewsletter, sendAdminTestNewsletter, assertCronAuthorized } = require('./weeklyNewsletter');

const ADMIN_EMAIL = 'odingabrewton@gmail.com';

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
        'Production must NOT use "expo start" or "npm start".',
    );
    process.exit(1);
  }

  const html = fs.readFileSync(INDEX_HTML, 'utf8');
  if (/dev=true|transform\.engine=hermes/i.test(html)) {
    console.error(
      '[CalmMama] dist/index.html references a dev Metro/Hermes bundle.\n' +
        'Run: npm run build',
    );
    process.exit(1);
  }
}

assertProductionDist();

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

/** Welcome email for Free Explorer + completed signup (styled HTML via Resend). */
app.post('/api/welcome-email', async (req, res) => {
  try {
    const email = String(req.body?.email || req.body?.to || '').trim();
    const firstName = String(req.body?.firstName || req.body?.name || '').trim() || undefined;
    const reason = String(req.body?.reason || 'signup').trim();

    const apiKey = resolveResendApiKey(process.env.EXPO_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY);
    const [result] = await Promise.all([
      sendWelcomeMamaEmail({
        to: email,
        firstName,
        apiKey,
        from: process.env.RESEND_FROM || undefined,
      }),
      addResendAudienceContact({
        email,
        firstName,
        apiKey,
      }),
    ]);

    if (result.skipped) {
      res.status(503).json({
        ok: false,
        skipped: true,
        error: result.error,
        hint: 'Set EXPO_PUBLIC_RESEND_API_KEY on the server.',
      });
      return;
    }

    if (!result.ok) {
      res.status(502).json({ ok: false, error: result.error || 'Email send failed' });
      return;
    }

    console.log('[CalmMama] welcome email sent', { reason, id: result.id, to: email.slice(0, 3) + '…' });
    res.status(200).json({ ok: true, id: result.id });
  } catch (err) {
    console.warn('[CalmMama] welcome email route error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected email error' });
  }
});

/**
 * Weekly newsletter — same handler used by Vercel Cron.
 * Auth: Authorization: Bearer ${CRON_SECRET}
 */
app.get('/api/weekly-newsletter', async (req, res) => {
  const auth = assertCronAuthorized(req);
  if (!auth.ok) {
    res.status(auth.status).json({ ok: false, error: auth.error });
    return;
  }

  try {
    const dryRun = String(req.query?.dryRun || '').toLowerCase() === 'true';
    const limitRaw = Number(req.query?.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : undefined;

    const result = await runWeeklyNewsletter({
      apiKey: resolveResendApiKey(process.env.EXPO_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY),
      from: process.env.RESEND_FROM || undefined,
      dryRun,
      limit,
    });

    const status = result.ok || result.dryRun ? 200 : 502;
    res.status(status).json({ ok: Boolean(result.ok || result.dryRun), ...result });
  } catch (err) {
    console.warn('[CalmMama] weekly newsletter route error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected newsletter error' });
  }
});

/** Admin sandbox: single test newsletter to allowlisted email only. */
app.post('/api/admin/test-newsletter', async (req, res) => {
  const email = String(req.body?.email || '')
    .trim()
    .toLowerCase();
  if (email !== ADMIN_EMAIL) {
    res.status(403).json({
      ok: false,
      error: 'Forbidden — admin allowlist only',
      adminTest: true,
    });
    return;
  }

  try {
    const result = await sendAdminTestNewsletter({
      to: email,
      firstName: req.body?.firstName || 'Admin',
      apiKey: resolveResendApiKey(process.env.EXPO_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY),
      from: process.env.RESEND_FROM || undefined,
    });
    const status = result.ok ? 200 : 502;
    res.status(status).json({
      ...result,
      isolated: true,
      analyticsExcluded: true,
    });
  } catch (err) {
    console.warn('[CalmMama] admin test newsletter error', err?.message || err);
    res.status(500).json({
      ok: false,
      error: 'Unexpected admin newsletter error',
      adminTest: true,
    });
  }
});

const HTML_CACHE_CONTROL = 'public, max-age=0, must-revalidate';
const HASHED_ASSET_CACHE_CONTROL = 'public, max-age=31536000, immutable';

app.use(
  express.static(DIST_DIR, {
    index: false,
    fallthrough: true,
    // Never rely on express maxAge alone — set explicit Cache-Control per file type.
    setHeaders(res, filePath) {
      const normalized = filePath.split(path.sep).join('/');
      const isHtml = normalized.endsWith('.html');
      const isHashedExpoAsset = normalized.includes('/_expo/static/');

      if (isHtml) {
        res.setHeader('Cache-Control', HTML_CACHE_CONTROL);
        return;
      }

      // Fingerprinted Expo bundles can be cached forever; index.html points at new hashes.
      if (isHashedExpoAsset) {
        res.setHeader('Cache-Control', HASHED_ASSET_CACHE_CONTROL);
        return;
      }

      res.setHeader('Cache-Control', HTML_CACHE_CONTROL);
    },
  }),
);

app.get('*', (req, res) => {
  const ext = path.extname(req.path);
  if (ext && ext !== '.html') {
    res.status(404).type('text/plain').send('Static asset not found. Re-run npm run build.');
    return;
  }
  // SPA shell (/, /app, Stripe return URLs) must always revalidate after deploy.
  res.setHeader('Cache-Control', HTML_CACHE_CONTROL);
  res.sendFile(INDEX_HTML);
});

app.listen(PORT, HOST, () => {
  console.log(`CalmMama Village web app listening on http://${HOST}:${PORT}`);
});
