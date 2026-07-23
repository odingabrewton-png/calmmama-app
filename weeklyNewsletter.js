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

const WEEKLY_SUBJECT = 'Your Weekly Village Reflection & Affirmation 🌸';
const APP_URL = APP_ACCESS_URL || 'https://calmmamavillage.com/app';

/** Soft weekly prompts for Soul Sanctuary journaling — rotates by ISO week. */
const WEEKLY_REFLECTIONS = [
  {
    affirmation: 'You are allowed to take up soft space today.',
    prompt:
      'What is one feeling you’ve been carrying quietly this week? Write it down in Soul Sanctuary without fixing it — just naming it is enough.',
  },
  {
    affirmation: 'Rest is not a reward you have to earn.',
    prompt:
      'Where in your body are you holding tension right now? Journal what that place might be asking for — even if the answer is simply “a pause.”',
  },
  {
    affirmation: 'You can love your baby and still miss yourself.',
    prompt:
      'What part of you feels a little unseen lately? Write one sentence to her in Soul Sanctuary, as if she were a dear friend.',
  },
  {
    affirmation: 'Small moments of care still count as mothering yourself.',
    prompt:
      'List three tiny things that made this week softer — a warm drink, a kind text, a quiet minute. Which one do you want more of next week?',
  },
  {
    affirmation: 'You are not behind. You are becoming.',
    prompt:
      'What pressure have you been measuring yourself against? Write what “enough” would feel like in your body today.',
  },
  {
    affirmation: 'Support is sacred — you do not have to hold it all alone.',
    prompt:
      'Who or what has held you this week (even a little)? Journal one way you might ask for or receive support next week.',
  },
  {
    affirmation: 'Your softness is strength, not weakness.',
    prompt:
      'What emotion showed up most often this week? Sit with it in Soul Sanctuary and finish this line: “What I needed was…”',
  },
  {
    affirmation: 'You are already someone’s safe place — including your own.',
    prompt:
      'Write a short note to yourself for a hard moment later this week. Keep it gentle, specific, and real.',
  },
];

function isoWeekNumber(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function pickWeeklyReflection(date = new Date()) {
  const index = (isoWeekNumber(date) - 1) % WEEKLY_REFLECTIONS.length;
  return WEEKLY_REFLECTIONS[index];
}

function buildWeeklyNewsletterHtml({ firstName, affirmation, prompt, appUrl = APP_URL } = {}) {
  const name = String(firstName || '').trim() || 'Mama';
  const safeUrl = String(appUrl || APP_URL).replace(/"/g, '&quot;');

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
                <strong style="color: #4A3B5C;">“${affirmation}”</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td align="left" bgcolor="#F8F4FC" style="background-color: #F8F4FC; border-radius: 18px; padding: 20px 18px; margin: 0;">
              <p style="color: #A493B8; font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 8px 0; text-align: center;">Soul Sanctuary prompt</p>
              <p style="color: #7D6B91; font-size: 15px; line-height: 1.65; margin: 0; text-align: center;">
                ${prompt}
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 28px; padding-bottom: 28px;">
              <a href="${safeUrl}" target="_blank" style="background-color: #8A63BE; color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 99px; font-weight: 600; font-size: 15px; display: inline-block;">
                Open Soul Sanctuary ✨
              </a>
            </td>
          </tr>
          <tr>
            <td align="center" style="border-top: 1px solid #F2EBF9; padding-top: 20px;">
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

function buildWeeklyNewsletterText({ firstName, affirmation, prompt, appUrl = APP_URL } = {}) {
  const name = String(firstName || '').trim() || 'Mama';
  return [
    `Hello, ${name}`,
    '',
    `Your weekly affirmation: "${affirmation}"`,
    '',
    'Soul Sanctuary prompt:',
    prompt,
    '',
    `Open your sanctuary: ${appUrl}`,
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
            recipients.push({
              email: String(row.email).trim().toLowerCase(),
              firstName: row.first_name || row.firstName || '',
            });
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
        recipients.push({
          email: String(row.email).trim().toLowerCase(),
          firstName: row.first_name || row.firstName || '',
        });
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

  const html = buildWeeklyNewsletterHtml({
    firstName: recipient.firstName,
    affirmation: reflection.affirmation,
    prompt: reflection.prompt,
  });
  const text = buildWeeklyNewsletterText({
    firstName: recipient.firstName,
    affirmation: reflection.affirmation,
    prompt: reflection.prompt,
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
  const reflection = pickWeeklyReflection(new Date());
  const listed = await fetchNewsletterRecipients({ apiKey, audienceId });
  if (!listed.ok) {
    return {
      ok: false,
      error: listed.error,
      sent: 0,
      failed: 0,
      total: 0,
      reflection,
    };
  }

  let recipients = listed.recipients;
  if (Number.isFinite(limit) && limit > 0) {
    recipients = recipients.slice(0, limit);
  }

  if (dryRun) {
    return {
      ok: true,
      dryRun: true,
      sent: 0,
      failed: 0,
      total: recipients.length,
      reflection,
      sample: recipients.slice(0, 3).map((r) => r.email),
    };
  }

  let sent = 0;
  let failed = 0;
  const errors = [];

  for (let i = 0; i < recipients.length; i += 1) {
    const recipient = recipients[i];
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
    reflection,
    errors: errors.length ? errors : undefined,
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
  WEEKLY_REFLECTIONS,
  pickWeeklyReflection,
  buildWeeklyNewsletterHtml,
  buildWeeklyNewsletterText,
  fetchNewsletterRecipients,
  runWeeklyNewsletter,
  assertCronAuthorized,
};
