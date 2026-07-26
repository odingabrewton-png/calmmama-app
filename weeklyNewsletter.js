/**
 * Weekly Village newsletter — Resend template + audience contact fetch + batch send.
 * Used by Vercel Cron (`/api/weekly-newsletter`) and the Express production server.
 */

const {
  APP_ACCESS_URL,
  DEFAULT_FROM,
  resolveResendApiKey,
  resolveResendAudienceId,
} = require('./welcomeEmail');
const {
  pickEmailWeeklyPrompt,
  inferNewsletterStage,
  buildJournalDeepLink,
  normalizeJournalStage,
} = require('./sanctuaryJournalPrompts');
const {
  buildStageContentBlocks,
  getNextTierProgress,
} = require('./newsletterStageContent');

const WEEKLY_SUBJECT = 'Your Weekly Village Reflection & Affirmation 🌸';
const APP_URL = APP_ACCESS_URL || 'https://calmmamavillage.com/app';

function isoWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stageLabel(stage) {
  const key = normalizeJournalStage(stage);
  if (key === 'hybrid') return 'Pregnant & Parenting';
  if (key === 'postpartum') return 'Postpartum';
  return 'Pregnancy';
}

function mapNewsletterRecipient(row) {
  const props = row?.properties || {};
  return {
    email: String(row.email || '')
      .trim()
      .toLowerCase(),
    firstName: row.first_name || row.firstName || '',
    journey: props.mama_journey || props.journey || row.mama_journey || '',
    weeksPregnant: props.weeks_pregnant || props.weeksPregnant || row.weeks_pregnant || '',
    babyAge: props.baby_age || props.babyAge || row.baby_age || '',
    points: Number(props.village_points ?? props.points ?? row.village_points ?? 0) || 0,
  };
}

function pickWeeklyReflection(date = new Date(), stage = 'pregnant') {
  return pickEmailWeeklyPrompt(stage, date);
}

function buildAppDeepLink(extraParams = {}) {
  try {
    const url = new URL(APP_URL);
    Object.entries(extraParams).forEach(([key, value]) => {
      if (value != null && value !== '') url.searchParams.set(key, String(value));
    });
    return url.toString();
  } catch (_) {
    return APP_URL;
  }
}

function buildStageSectionsHtml(blocks = []) {
  if (!blocks.length) return '';
  return blocks
    .map((block) => {
      const cta =
        block.ctaUrl && block.ctaLabel
          ? `<p style="margin: 14px 0 0 0; text-align: center;">
              <a href="${String(block.ctaUrl).replace(/"/g, '&quot;')}" target="_blank" style="color: #8A63BE; font-weight: 700; font-size: 14px; text-decoration: underline;">
                ${escapeHtml(block.ctaLabel)}
              </a>
            </p>`
          : '';
      return `
          <tr>
            <td align="left" style="padding-top: 14px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#FFF9FC" style="background-color: #FFF9FC; border-radius: 16px; border: 1px solid #F0E6F8;">
                <tr>
                  <td style="padding: 16px 16px 14px 16px;">
                    <p style="color: #A493B8; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 6px 0; text-align: center;">
                      ${escapeHtml(block.eyebrow)}
                    </p>
                    <p style="color: #4A3B5C; font-size: 16px; font-weight: 700; margin: 0 0 8px 0; text-align: center;">
                      ${escapeHtml(block.title)}
                    </p>
                    <p style="color: #7D6B91; font-size: 14px; line-height: 1.6; margin: 0; text-align: center;">
                      ${escapeHtml(block.body)}
                    </p>
                    ${cta}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
    })
    .join('');
}

function buildRewardsFooterHtml({ points = 0, appUrl = APP_URL } = {}) {
  const progress = getNextTierProgress(points);
  const pct = Math.round((progress.progress || 0) * 100);
  const filled = Math.max(0, Math.min(100, pct));
  const empty = 100 - filled;
  const pointsLabel = Number(points || 0).toLocaleString();
  const nextLine = progress.nextTier
    ? `${progress.pointsToNext} pts to ${progress.nextTitle} · ${progress.nextPerk}`
    : `You have unlocked every Crown Points reward tier — ${progress.nextPerk}`;
  const rewardsUrl = String(buildAppDeepLink({ rewards: '1' }) || appUrl).replace(/"/g, '&quot;');

  return `
          <tr>
            <td align="left" style="padding-top: 22px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#4A3B5C" style="background-color: #4A3B5C; border-radius: 18px;">
                <tr>
                  <td style="padding: 20px 18px;">
                    <p style="color: #E8DFF5; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 8px 0; text-align: center;">
                      Village Rewards
                    </p>
                    <p style="color: #FFFFFF; font-size: 22px; font-weight: 700; margin: 0 0 6px 0; text-align: center;">
                      ${pointsLabel} pts
                    </p>
                    <p style="color: #D7C8EA; font-size: 13px; line-height: 1.5; margin: 0 0 14px 0; text-align: center;">
                      ${escapeHtml(nextLine)}
                    </p>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-radius: 999px; overflow: hidden;">
                      <tr>
                        <td width="${filled}%" bgcolor="#C4A8D8" style="background-color: #C4A8D8; height: 10px; font-size: 0; line-height: 0;">&nbsp;</td>
                        <td width="${empty}%" bgcolor="#6B5A82" style="background-color: #6B5A82; height: 10px; font-size: 0; line-height: 0;">&nbsp;</td>
                      </tr>
                    </table>
                    <p style="color: #B9A7D0; font-size: 11px; margin: 8px 0 16px 0; text-align: center;">
                      ${filled}% of the way to your next Crown Points reward
                    </p>
                    <p style="margin: 0; text-align: center;">
                      <a href="${rewardsUrl}" target="_blank" style="background-color: #F8F4FC; color: #4A3B5C; text-decoration: none; padding: 12px 22px; border-radius: 99px; font-weight: 700; font-size: 14px; display: inline-block;">
                        Open Village Rewards in App 🌸
                      </a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`;
}

function buildWeeklyNewsletterHtml({
  firstName,
  affirmation,
  prompt,
  stage = 'pregnant',
  appUrl = APP_URL,
  journalUrl,
  stageBlocks = [],
  points = 0,
} = {}) {
  const name = escapeHtml(String(firstName || '').trim() || 'Mama');
  const safeAffirmation = escapeHtml(affirmation);
  const safePrompt = escapeHtml(prompt);
  const safeStage = escapeHtml(stageLabel(stage));
  const ctaUrl = String(journalUrl || appUrl || APP_URL).replace(/"/g, '&quot;');
  const stageHtml = buildStageSectionsHtml(stageBlocks);
  const rewardsHtml = buildRewardsFooterHtml({ points, appUrl });

  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${WEEKLY_SUBJECT}</title>
  <style type="text/css">
    body, table, td {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
    }
    .email-bg {
      background-color: #E8DFF5 !important;
      background-image: linear-gradient(135deg, #FCE1E4 0%, #E8DFF5 50%, #FCF4DD 100%) !important;
    }
  </style>
</head>
<body bgcolor="#E8DFF5" style="margin: 0; padding: 0; background-color: #E8DFF5;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#E8DFF5" class="email-bg" style="background-color: #E8DFF5; padding: 40px 12px;">
    <tr>
      <td align="center" bgcolor="#E8DFF5" class="email-bg">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#ffffff" style="max-width: 500px; background-color: #ffffff; border-radius: 28px; padding: 40px 28px; text-align: center; box-shadow: 0 10px 30px rgba(110, 80, 140, 0.08);">
          <tr>
            <td align="center" style="padding-bottom: 14px;">
              <span style="font-size: 42px; line-height: 1;">🌸✨</span>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 10px;">
              <p style="color: #A493B8; font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0;">Weekly Village Reflection</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 16px;">
              <h1 style="color: #4A3B5C; font-size: 24px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
                Hello, ${name}
              </h1>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 22px;">
              <p style="color: #7D6B91; font-size: 15px; line-height: 1.6; margin: 0;">
                Your weekly affirmation:<br />
                <strong style="color: #4A3B5C;">“${safeAffirmation}”</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td align="left" bgcolor="#F8F4FC" style="background-color: #F8F4FC; border-radius: 18px; padding: 20px 18px;">
              <p style="color: #A493B8; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 6px 0; text-align: center;">Email Reflection Prompt of the Week</p>
              <p style="color: #8A63BE; font-size: 12px; font-weight: 700; margin: 0 0 10px 0; text-align: center;">${safeStage} · Exclusive to your inbox</p>
              <p style="color: #7D6B91; font-size: 15px; line-height: 1.65; margin: 0; text-align: center;">
                ${safePrompt}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 22px; padding-bottom: 8px;">
              <a href="${ctaUrl}" target="_blank" style="background-color: #8A63BE; color: #ffffff; text-decoration: none; padding: 16px 28px; border-radius: 99px; font-weight: 600; font-size: 15px; display: inline-block;">
                Journal This Prompt in App (+10 Pts) 🌸
              </a>
            </td>
          </tr>
          ${stageHtml}
          ${rewardsHtml}
          <tr>
            <td align="center" style="border-top: 1px solid #F2EBF9; padding-top: 20px; margin-top: 8px;">
              <p style="color: #A493B8; font-size: 12px; margin: 0; line-height: 1.5;">
                With warmth & support,<br />
                <strong style="color: #7D6B91;">The Calm Mama Village Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

function buildWeeklyNewsletterText({
  firstName,
  affirmation,
  prompt,
  stage = 'pregnant',
  appUrl = APP_URL,
  journalUrl,
  stageBlocks = [],
  points = 0,
} = {}) {
  const name = String(firstName || '').trim() || 'Mama';
  const link = journalUrl || appUrl;
  const progress = getNextTierProgress(points);
  const stageLines = (stageBlocks || []).flatMap((block) => [
    '',
    `${block.eyebrow}: ${block.title}`,
    block.body,
    block.ctaUrl ? `${block.ctaLabel || 'Link'}: ${block.ctaUrl}` : null,
  ].filter(Boolean));

  const rewardsLines = [
    '',
    'Village Rewards',
    `Your balance: ${Number(points || 0).toLocaleString()} pts`,
    progress.nextTier
      ? `${progress.pointsToNext} pts to ${progress.nextTitle} (${progress.nextPerk})`
      : `All merch tiers unlocked — ${progress.nextPerk}`,
    `Open Village Rewards: ${buildAppDeepLink({ rewards: '1' })}`,
  ];

  return [
    `Hello, ${name}`,
    '',
    `Your weekly affirmation: "${affirmation}"`,
    '',
    `Email Reflection Prompt of the Week (${stageLabel(stage)} · exclusive):`,
    prompt,
    '',
    `Journal This Prompt in App (+10 Pts): ${link}`,
    ...stageLines,
    ...rewardsLines,
    '',
    'With warmth & support,',
    'The Calm Mama Village Team',
  ].join('\n');
}

async function parseJsonResponse(response) {
  const raw = await response.text().catch(() => '');
  try {
    return { raw, parsed: raw ? JSON.parse(raw) : null };
  } catch (_) {
    return { raw, parsed: null };
  }
}

/**
 * Fetch subscribed mama emails from Resend contacts (optionally filtered by audience/segment).
 * Falls back gracefully when no DB is configured.
 */
async function fetchNewsletterRecipients({ apiKey, audienceId } = {}) {
  const key = resolveResendApiKey(apiKey);
  if (!key) {
    return { ok: false, error: 'Resend API key not configured', recipients: [] };
  }

  const listId = resolveResendAudienceId(audienceId);
  const recipients = [];
  let cursor = null;
  let pages = 0;
  const maxPages = 20;

  while (pages < maxPages) {
    pages += 1;
    const params = new URLSearchParams({ limit: '100' });
    if (cursor) params.set('after', cursor);

    // Prefer audience contacts when configured; otherwise list global contacts.
    const url = listId
      ? `https://api.resend.com/audiences/${encodeURIComponent(listId)}/contacts?${params.toString()}`
      : `https://api.resend.com/contacts?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${key}` },
    });
    const { raw, parsed } = await parseJsonResponse(response);

    if (!response.ok) {
      // If audience endpoint fails, try global contacts once.
      if (listId && pages === 1) {
        const fallback = await fetch('https://api.resend.com/contacts?limit=100', {
          method: 'GET',
          headers: { Authorization: `Bearer ${key}` },
        });
        const fb = await parseJsonResponse(fallback);
        if (!fallback.ok) {
          return {
            ok: false,
            error: fb.parsed?.message || fb.raw || `HTTP ${fallback.status}`,
            recipients: [],
          };
        }
        const rows = Array.isArray(fb.parsed?.data) ? fb.parsed.data : [];
        for (const row of rows) {
          if (row?.email && !row.unsubscribed) {
            recipients.push(mapNewsletterRecipient(row));
          }
        }
        break;
      }

      return {
        ok: false,
        error: parsed?.message || raw || `HTTP ${response.status}`,
        recipients: [],
      };
    }

    const rows = Array.isArray(parsed?.data) ? parsed.data : [];
    for (const row of rows) {
      if (row?.email && !row.unsubscribed) {
        recipients.push(mapNewsletterRecipient(row));
      }
    }

    if (!parsed?.has_more || !rows.length) break;
    cursor = rows[rows.length - 1]?.id || null;
    if (!cursor) break;
  }

  // De-dupe by email.
  const seen = new Set();
  const unique = [];
  for (const row of recipients) {
    if (!row.email || seen.has(row.email)) continue;
    seen.add(row.email);
    unique.push(row);
  }

  return { ok: true, recipients: unique };
}

async function sendWeeklyEmailToRecipient({
  recipient,
  reflection,
  apiKey,
  from = DEFAULT_FROM,
} = {}) {
  const key = resolveResendApiKey(apiKey);
  const email = String(recipient?.email || '').trim().toLowerCase();
  if (!key || !email) {
    return { ok: false, email, error: 'missing key or email' };
  }

  const stage = normalizeJournalStage(
    reflection?.stage || inferNewsletterStage(recipient),
  );
  const weekly =
    reflection?.source === 'email_exclusive'
      ? reflection
      : pickEmailWeeklyPrompt(stage, new Date());
  const journalUrl = buildJournalDeepLink({
    appUrl: APP_URL,
    prompt: weekly.prompt,
    stage: weekly.stage,
    promptId: weekly.id,
  });
  const weekSeed = isoWeekNumber(new Date());
  const stageBlocks = buildStageContentBlocks({
    stage: weekly.stage,
    weeksPregnant: recipient.weeksPregnant || '24',
    babyAge: recipient.babyAge || 'Newborn',
    weekSeed,
  });
  const points = Math.max(0, Number(recipient.points) || 0);

  const html = buildWeeklyNewsletterHtml({
    firstName: recipient.firstName,
    affirmation: weekly.affirmation,
    prompt: weekly.prompt,
    stage: weekly.stage,
    journalUrl,
    stageBlocks,
    points,
  });
  const text = buildWeeklyNewsletterText({
    firstName: recipient.firstName,
    affirmation: weekly.affirmation,
    prompt: weekly.prompt,
    stage: weekly.stage,
    journalUrl,
    stageBlocks,
    points,
  });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: String(from || DEFAULT_FROM),
      to: email,
      subject: WEEKLY_SUBJECT,
      html,
      text,
      tags: [
        { name: 'newsletter', value: 'weekly' },
        { name: 'mama_stage', value: weekly.stage },
        { name: 'prompt_id', value: String(weekly.id || '').slice(0, 48) },
      ],
    }),
  });

  const { raw, parsed } = await parseJsonResponse(response);
  if (!response.ok) {
    return {
      ok: false,
      email,
      error: parsed?.message || raw || `HTTP ${response.status}`,
    };
  }

  return { ok: true, email, id: parsed?.id || null };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Full weekly pipeline: load contacts → generate template → send via Resend.
 */
async function runWeeklyNewsletter({
  apiKey,
  audienceId,
  from,
  dryRun = false,
  limit,
} = {}) {
  const listed = await fetchNewsletterRecipients({ apiKey, audienceId });
  if (!listed.ok) {
    return {
      ok: false,
      error: listed.error,
      sent: 0,
      failed: 0,
      total: 0,
    };
  }

  let recipients = listed.recipients;
  if (Number.isFinite(limit) && limit > 0) {
    recipients = recipients.slice(0, limit);
  }

  if (dryRun) {
    const sample = recipients.slice(0, 3).map((r) => {
      const stage = inferNewsletterStage(r);
      const weekly = pickEmailWeeklyPrompt(stage, new Date());
      return { email: r.email, stage: weekly.stage, promptId: weekly.id };
    });
    return {
      ok: true,
      dryRun: true,
      sent: 0,
      failed: 0,
      total: recipients.length,
      sample,
    };
  }

  let sent = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < recipients.length; i += 1) {
    const recipient = recipients[i];
    const stage = inferNewsletterStage(recipient);
    const reflection = pickEmailWeeklyPrompt(stage, new Date());
    try {
      const result = await sendWeeklyEmailToRecipient({
        recipient,
        reflection,
        apiKey,
        from,
      });
      if (result.ok) {
        sent += 1;
      } else {
        failed += 1;
        if (errors.length < 10) errors.push({ email: result.email, error: result.error });
      }
    } catch (err) {
      failed += 1;
      if (errors.length < 10) {
        errors.push({ email: recipient.email, error: err?.message || 'send error' });
      }
    }

    // Gentle pacing for Resend rate limits.
    if (i < recipients.length - 1) {
      await sleep(120);
    }
  }

  return {
    ok: failed === 0,
    sent,
    failed,
    total: recipients.length,
    errors: errors.length ? errors : undefined,
  };
}

/**
 * Send a single admin smoke-test newsletter.
 * Never touches the public audience list / analytics.
 */
async function sendAdminTestNewsletter({
  to,
  firstName = 'Admin',
  apiKey,
  from,
} = {}) {
  const email = String(to || '')
    .trim()
    .toLowerCase();
  if (!email) {
    return { ok: false, error: 'missing recipient email', adminTest: true };
  }

  const reflection = pickEmailWeeklyPrompt(
    inferNewsletterStage({ email, journey: 'pregnant' }),
    new Date(),
  );
  const key = resolveResendApiKey(apiKey);
  if (!key) {
    return { ok: false, error: 'Resend API key not configured', adminTest: true };
  }

  const journalUrl = buildJournalDeepLink({
    appUrl: APP_URL,
    prompt: reflection.prompt,
    stage: reflection.stage,
    promptId: reflection.id,
  });
  const stageBlocks = buildStageContentBlocks({
    stage: reflection.stage,
    weeksPregnant: '24',
    babyAge: '12-24 months',
    weekSeed: isoWeekNumber(new Date()),
  });

  const html = buildWeeklyNewsletterHtml({
    firstName: firstName || 'Admin',
    affirmation: reflection.affirmation,
    prompt: reflection.prompt,
    stage: reflection.stage,
    journalUrl,
    stageBlocks,
    points: 240,
  });
  const text = buildWeeklyNewsletterText({
    firstName: firstName || 'Admin',
    affirmation: reflection.affirmation,
    prompt: reflection.prompt,
    stage: reflection.stage,
    journalUrl,
    stageBlocks,
    points: 240,
  });

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: String(from || DEFAULT_FROM),
      to: email,
      subject: `[ADMIN TEST] ${WEEKLY_SUBJECT}`,
      html,
      text,
      tags: [
        { name: 'admin_test', value: 'true' },
        { name: 'isolate_analytics', value: 'true' },
      ],
      headers: {
        'X-Entity-Ref-ID': `admin-test-${Date.now()}`,
      },
    }),
  });

  const { raw, parsed } = await parseJsonResponse(response);
  if (!response.ok) {
    return {
      ok: false,
      adminTest: true,
      email,
      error: parsed?.message || raw || `HTTP ${response.status}`,
      reflection,
    };
  }

  return {
    ok: true,
    adminTest: true,
    email,
    id: parsed?.id || null,
    reflection,
    isolated: true,
  };
}

/**
 * Authorize Vercel Cron (or manual) callers via CRON_SECRET bearer token.
 */
function assertCronAuthorized(req) {
  const secret = String(process.env.CRON_SECRET || '').trim();
  if (!secret) {
    return { ok: false, status: 503, error: 'CRON_SECRET is not configured' };
  }

  const header = String(
    req?.headers?.authorization || req?.headers?.Authorization || '',
  ).trim();
  const expected = `Bearer ${secret}`;
  if (header !== expected) {
    return { ok: false, status: 401, error: 'Unauthorized' };
  }

  return { ok: true };
}

module.exports = {
  WEEKLY_SUBJECT,
  pickWeeklyReflection,
  buildWeeklyNewsletterHtml,
  buildWeeklyNewsletterText,
  fetchNewsletterRecipients,
  runWeeklyNewsletter,
  sendAdminTestNewsletter,
  assertCronAuthorized,
  isoWeekNumber,
};
