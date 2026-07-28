/**
 * Welcome email + first newsletter + audience upsert + founder signup notice.
 * POST /api/welcome-email
 * Body: { email, firstName?, reason?, tier?, source?, notifyOnly? }
 */

const {
  sendWelcomeMamaEmail,
  addResendAudienceContact,
  sendAdminMamaSignupNotice,
  resolveResendApiKey,
} = require('../welcomeEmail');
const { sendFirstNewsletterOnSignup } = require('../weeklyNewsletter');

function parseBody(req) {
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body || '{}');
    } catch (_) {
      return {};
    }
  }
  return req.body || {};
}

function shouldSendFirstNewsletter(reason, notifyOnly) {
  if (notifyOnly) return false;
  const key = String(reason || 'signup')
    .trim()
    .toLowerCase();
  // Landing Free Explorer / waitlist / paid interest / gift recipient welcome.
  return (
    key === 'signup' ||
    key === 'free_explorer' ||
    key === 'founding' ||
    key === 'gift' ||
    key === 'monthly' ||
    key === 'annual'
  );
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const body = parseBody(req);
    const email = String(body.email || body.to || '').trim();
    const firstName = String(body.firstName || body.name || '').trim() || undefined;
    const reason = String(body.reason || 'signup').trim();
    const tier = String(body.tier || '').trim() || undefined;
    const source = String(body.source || 'api').trim() || 'api';
    const notifyOnly =
      body.notifyOnly === true ||
      body.notifyOnly === 'true' ||
      reason === 'profile_email';

    if (!email) {
      res.status(400).json({ ok: false, error: 'Email required' });
      return;
    }

    const apiKey = resolveResendApiKey();
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
        firstNewsletter: { ok: true, skipped: true },
        audience,
        adminNotice: {
          ok: Boolean(adminNotice.ok),
          skipped: Boolean(adminNotice.skipped),
          id: adminNotice.id || null,
        },
      });
      return;
    }

    const sendFirst = shouldSendFirstNewsletter(reason, notifyOnly);
    const [result, audience, adminNotice, firstNewsletter] = await Promise.all([
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
      sendFirst
        ? sendFirstNewsletterOnSignup({
            to: email,
            firstName,
            apiKey,
            from,
          })
        : Promise.resolve({ ok: true, skipped: true }),
    ]);

    if (result.skipped && !adminNotice.ok && !audience.ok && !firstNewsletter.ok) {
      res.status(503).json({
        ok: false,
        skipped: true,
        error: result.error || adminNotice.error || 'Resend not configured',
        hint: 'Set RESEND_API_KEY or EXPO_PUBLIC_RESEND_API_KEY on Vercel.',
      });
      return;
    }

    if (firstNewsletter && !firstNewsletter.ok && !firstNewsletter.skipped) {
      console.warn(
        '[CalmMama] signup first newsletter failed (non-blocking)',
        firstNewsletter.error,
      );
    }

    res.status(200).json({
      ok: Boolean(result.ok || adminNotice.ok || audience.ok || firstNewsletter.ok),
      welcome: result,
      firstNewsletter: {
        ok: Boolean(firstNewsletter.ok),
        skipped: Boolean(firstNewsletter.skipped),
        id: firstNewsletter.id || null,
        error: firstNewsletter.error || undefined,
      },
      audience,
      adminNotice: {
        ok: Boolean(adminNotice.ok),
        skipped: Boolean(adminNotice.skipped),
        id: adminNotice.id || null,
      },
    });
  } catch (err) {
    console.warn('[CalmMama] welcome-email route error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected email error' });
  }
};

module.exports.config = {
  maxDuration: 30,
};
