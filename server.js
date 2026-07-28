/**
 * Production static file server for Expo web export (dist/).
 * Serves only pre-built static assets — never Metro dev / Hermes bundles.
 * Also hosts /api/welcome-email (Resend) for Free Explorer + signup welcome mail.
 */
const express = require('express');
const fs = require('fs');
const path = require('path');
const { sendWelcomeMamaEmail, addResendAudienceContact, resolveResendApiKey, sendAdminMamaSignupNotice } = require('./welcomeEmail');
const { runWeeklyNewsletter, sendAdminTestNewsletter, assertCronAuthorized } = require('./weeklyNewsletter');
const {
  createSubscriptionCheckoutSession,
  resolveAppOrigin,
} = require('./stripeCheckoutSession');
const {
  upsertSubscription,
  dispatchDueVillagePush,
} = require('./webPushService');

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

/** Mama profile cloud backup/restore — larger body for optional photo snapshots. */
const mamaProfileHandler = require('./api/mama-profile');
app.options('/api/mama-profile', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.status(204).end();
});
app.get('/api/mama-profile', express.json({ limit: '1mb' }), mamaProfileHandler);
app.post('/api/mama-profile', express.json({ limit: '1mb' }), mamaProfileHandler);

app.use(express.json({ limit: '32kb' }));

/** Welcome email for Free Explorer + completed signup (styled HTML via Resend). */
app.post('/api/welcome-email', async (req, res) => {
  try {
    const email = String(req.body?.email || req.body?.to || '').trim();
    const firstName = String(req.body?.firstName || req.body?.name || '').trim() || undefined;
    const reason = String(req.body?.reason || 'signup').trim();
    const tier = String(req.body?.tier || '').trim() || undefined;
    const source = String(req.body?.source || 'server').trim() || 'server';
    const notifyOnly =
      req.body?.notifyOnly === true ||
      req.body?.notifyOnly === 'true' ||
      reason === 'profile_email';

    const apiKey = resolveResendApiKey(process.env.EXPO_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM || undefined;

    if (notifyOnly) {
      const [adminNotice, audience] = await Promise.all([
        sendAdminMamaSignupNotice({
          mamaEmail: email,
          firstName,
          reason,
          tier,
          source,
          apiKey,
          from,
        }),
        addResendAudienceContact({
          email,
          firstName,
          apiKey,
        }),
      ]);
      res.status(200).json({
        ok: Boolean(adminNotice.ok || audience.ok),
        notifyOnly: true,
        welcome: { ok: true, skipped: true },
        audience,
        adminNotice: {
          ok: Boolean(adminNotice.ok),
          skipped: Boolean(adminNotice.skipped),
          id: adminNotice.id || null,
        },
      });
      return;
    }

    const [result, audience, adminNotice] = await Promise.all([
      sendWelcomeMamaEmail({
        to: email,
        firstName,
        apiKey,
        from,
      }),
      addResendAudienceContact({
        email,
        firstName,
        apiKey,
      }),
      sendAdminMamaSignupNotice({
        mamaEmail: email,
        firstName,
        reason,
        tier,
        source,
        apiKey,
        from,
      }),
    ]);

    if (result.skipped) {
      res.status(503).json({
        ok: false,
        skipped: true,
        error: result.error,
        hint: 'Set EXPO_PUBLIC_RESEND_API_KEY on the server.',
        adminNotice: { ok: Boolean(adminNotice.ok), skipped: Boolean(adminNotice.skipped) },
      });
      return;
    }

    if (!result.ok) {
      res.status(502).json({
        ok: false,
        error: result.error || 'Email send failed',
        adminNotice: { ok: Boolean(adminNotice.ok), skipped: Boolean(adminNotice.skipped) },
      });
      return;
    }

    console.log('[CalmMama] welcome email sent', { reason, id: result.id, to: email.slice(0, 3) + '…' });
    res.status(200).json({
      ok: true,
      id: result.id,
      audience,
      adminNotice: {
        ok: Boolean(adminNotice.ok),
        skipped: Boolean(adminNotice.skipped),
        id: adminNotice.id || null,
      },
    });
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

/**
 * Stripe Checkout Session for monthly / annual subscriptions.
 * Both plans set allow_promotion_codes: true.
 */
async function handleStripeCheckoutSession(req, res) {
  try {
    const plan = req.body?.plan || req.body?.tier || req.query?.plan;
    const email = req.body?.email || req.body?.customer_email || req.query?.email;
    const origin = req.body?.origin || resolveAppOrigin(req);
    const result = await createSubscriptionCheckoutSession({ plan, email, origin });
    const status = result.ok ? 200 : result.status || 500;
    res.status(status).json(result);
  } catch (err) {
    console.warn('[CalmMama] checkout-session route error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected checkout error' });
  }
}

app.post('/api/stripe/checkout-session', handleStripeCheckoutSession);
app.post('/api/checkout', handleStripeCheckoutSession);

/** Persist browser Web Push subscription for daytime village reminders. */
app.post('/api/web-push/subscribe', (req, res) => {
  try {
    const body = req.body || {};
    const result = upsertSubscription({
      subscription: body.subscription || body,
      journey: body.journey,
      timeZone: body.timeZone || body.timezone,
      platform: body.platform || 'web',
    });
    res.status(result.status || (result.ok ? 200 : 400)).json(result);
  } catch (err) {
    console.warn('[CalmMama] web-push subscribe error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected subscribe error' });
  }
});

/** Cron: dispatch due village reminders to stored web-push subscribers. */
app.get('/api/web-push/dispatch', async (req, res) => {
  const auth = assertCronAuthorized(req);
  if (!auth.ok) {
    res.status(auth.status).json({ ok: false, error: auth.error });
    return;
  }
  try {
    const result = await dispatchDueVillagePush({ windowMinutes: 8 });
    const status = result.ok ? 200 : result.reason === 'missing-vapid' ? 503 : 500;
    res.status(status).json(result);
  } catch (err) {
    console.warn('[CalmMama] web-push dispatch error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected dispatch error' });
  }
});
app.post('/api/web-push/dispatch', async (req, res) => {
  const auth = assertCronAuthorized(req);
  if (!auth.ok) {
    res.status(auth.status).json({ ok: false, error: auth.error });
    return;
  }
  try {
    const result = await dispatchDueVillagePush({ windowMinutes: 8 });
    const status = result.ok ? 200 : result.reason === 'missing-vapid' ? 503 : 500;
    res.status(status).json(result);
  } catch (err) {
    console.warn('[CalmMama] web-push dispatch error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected dispatch error' });
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
    const apiKey = resolveResendApiKey(
      process.env.EXPO_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY,
    );
    if (!apiKey) {
      res.status(503).json({
        ok: false,
        adminTest: true,
        error: 'Resend API key not configured',
        hint: 'Set EXPO_PUBLIC_RESEND_API_KEY or RESEND_API_KEY on the server.',
      });
      return;
    }
    const result = await sendAdminTestNewsletter({
      to: email,
      firstName: req.body?.firstName || 'Admin',
      apiKey,
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

/** Admin sandbox: welcome email smoke test (no audience upsert). */
app.post('/api/admin/test-welcome-email', async (req, res) => {
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
    const apiKey = resolveResendApiKey(
      process.env.EXPO_PUBLIC_RESEND_API_KEY || process.env.RESEND_API_KEY,
    );
    const result = await sendWelcomeMamaEmail({
      to: email,
      firstName: req.body?.firstName || 'Admin',
      apiKey,
      from: process.env.RESEND_FROM || undefined,
    });
    if (result.skipped || !result.ok) {
      res.status(result.skipped ? 503 : 502).json({
        ok: false,
        adminTest: true,
        isolated: true,
        analyticsExcluded: true,
        error: result.error || 'Failed to send welcome email',
        hint: result.skipped
          ? 'Set EXPO_PUBLIC_RESEND_API_KEY or RESEND_API_KEY on the server.'
          : undefined,
      });
      return;
    }
    res.status(200).json({
      ok: true,
      adminTest: true,
      isolated: true,
      analyticsExcluded: true,
      id: result.id || null,
      email,
    });
  } catch (err) {
    console.warn('[CalmMama] admin test welcome email error', err?.message || err);
    res.status(500).json({
      ok: false,
      error: 'Unexpected admin welcome email error',
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
