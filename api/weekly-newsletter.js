/**
 * Vercel Cron endpoint — weekly Village newsletter.
 * Schedule: Tuesdays 9:00 AM EST (13:00 UTC) via vercel.json crons.
 *
 * Security: requires Authorization: Bearer ${CRON_SECRET}
 * Vercel Cron injects this header automatically when CRON_SECRET is set.
 */

const {
  runWeeklyNewsletter,
  assertCronAuthorized,
} = require('../weeklyNewsletter');
const { resolveResendApiKey, resolveResendAudienceId } = require('../welcomeEmail');

module.exports = async function handler(req, res) {
  // Vercel Cron uses GET; allow POST for manual smoke tests with the same secret.
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  const auth = assertCronAuthorized(req);
  if (!auth.ok) {
    res.status(auth.status).json({ ok: false, error: auth.error });
    return;
  }

  try {
    const dryRun =
      String(req.query?.dryRun || req.body?.dryRun || '').toLowerCase() === 'true';
    const limitRaw = Number(req.query?.limit || req.body?.limit);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : undefined;

    const result = await runWeeklyNewsletter({
      apiKey: resolveResendApiKey(),
      audienceId: resolveResendAudienceId(),
      from: process.env.RESEND_FROM || undefined,
      dryRun,
      limit,
    });

    const status = result.ok || result.dryRun ? 200 : 502;
    res.status(status).json({
      ok: Boolean(result.ok || result.dryRun),
      ...result,
    });
  } catch (err) {
    console.warn('[CalmMama] weekly newsletter route error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected newsletter error' });
  }
};

// Allow longer runs when the audience list is large (Pro / higher plans).
module.exports.config = {
  maxDuration: 60,
};
