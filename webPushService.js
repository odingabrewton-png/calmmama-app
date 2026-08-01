/**
 * Web Push subscribe store + VAPID send helpers (CommonJS for Vercel/Render).
 * Prefer Upstash/Vercel KV so subscriptions survive serverless cold starts
 * (plain /tmp on Vercel was wiping daytime reminder subscribers).
 */

const fs = require('fs');
const path = require('path');
const {
  getDueSlotsForNow,
  getWeeklyDue,
} = require('./villageReminderSchedule');

const KV_STORE_KEY = 'web-push:v1:store';
const DEFAULT_STORE = path.join(__dirname, 'data', 'web-push-subscriptions.json');

function resolveFileStorePath() {
  return (
    process.env.WEB_PUSH_STORE_PATH ||
    (process.env.VERCEL ? path.join('/tmp', 'calmmama-web-push-subscriptions.json') : DEFAULT_STORE)
  );
}

function ensureDir(filePath) {
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  } catch (_) {
    /* ignore */
  }
}

function emptyStore() {
  return { subscriptions: {}, sentLog: {} };
}

function normalizeStore(raw) {
  if (!raw || typeof raw !== 'object') return emptyStore();
  return {
    subscriptions:
      raw.subscriptions && typeof raw.subscriptions === 'object' ? raw.subscriptions : {},
    sentLog: raw.sentLog && typeof raw.sentLog === 'object' ? raw.sentLog : {},
  };
}

function resolveKvConfig() {
  const url = String(
    process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  ).trim();
  const token = String(
    process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
  ).trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ''), token };
}

async function kvRun(command) {
  const cfg = resolveKvConfig();
  if (!cfg) return { ok: false, skipped: true, error: 'kv-not-configured' };
  try {
    const res = await fetch(`${cfg.url}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        ok: false,
        error: data.error || data.message || `KV HTTP ${res.status}`,
      };
    }
    return { ok: true, result: data.result };
  } catch (err) {
    return { ok: false, error: err?.message || 'kv-network-error' };
  }
}

function readFileStore() {
  const filePath = resolveFileStorePath();
  try {
    if (!fs.existsSync(filePath)) return emptyStore();
    return normalizeStore(JSON.parse(fs.readFileSync(filePath, 'utf8')));
  } catch (_) {
    return emptyStore();
  }
}

function writeFileStore(store) {
  const filePath = resolveFileStorePath();
  ensureDir(filePath);
  fs.writeFileSync(filePath, JSON.stringify(normalizeStore(store), null, 0), 'utf8');
}

async function readStore() {
  const kv = await kvRun(['GET', KV_STORE_KEY]);
  if (kv.ok && kv.result) {
    try {
      const parsed = typeof kv.result === 'string' ? JSON.parse(kv.result) : kv.result;
      return { ...normalizeStore(parsed), via: 'kv' };
    } catch (_) {
      /* fall through */
    }
  }
  return { ...readFileStore(), via: resolveKvConfig() ? 'file-fallback' : 'file' };
}

async function writeStore(store) {
  const payload = JSON.stringify(normalizeStore(store));
  const kv = await kvRun(['SET', KV_STORE_KEY, payload]);
  if (kv.ok) return { ok: true, via: 'kv' };

  try {
    writeFileStore(store);
    return {
      ok: true,
      via: process.env.VERCEL ? 'tmp-file' : 'file',
      hint: kv.skipped
        ? 'Add Upstash/Vercel KV so web-push subscribers survive cold starts.'
        : kv.error,
    };
  } catch (err) {
    return { ok: false, error: err?.message || kv.error || 'store-write-failed' };
  }
}

function normalizeJourney(journey) {
  const value = String(journey || 'pregnant').toLowerCase();
  if (value === 'postpartum' || value === 'hybrid') return value;
  return 'pregnant';
}

async function upsertSubscription({ subscription, journey, timeZone, platform } = {}) {
  const endpoint = String(subscription?.endpoint || '').trim();
  if (!endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return { ok: false, status: 400, error: 'Invalid push subscription' };
  }

  const store = await readStore();
  store.subscriptions[endpoint] = {
    endpoint,
    keys: {
      p256dh: String(subscription.keys.p256dh),
      auth: String(subscription.keys.auth),
    },
    expirationTime: subscription.expirationTime || null,
    journey: normalizeJourney(journey),
    timeZone: String(timeZone || '').trim() || null,
    platform: String(platform || 'web'),
    updatedAt: Date.now(),
  };
  const saved = await writeStore(store);
  if (!saved.ok) {
    return { ok: false, status: 503, error: saved.error || 'Could not persist subscription' };
  }
  return {
    ok: true,
    status: 200,
    count: Object.keys(store.subscriptions).length,
    via: saved.via,
  };
}

async function listSubscriptions() {
  const store = await readStore();
  return Object.values(store.subscriptions || {});
}

async function removeSubscription(endpoint) {
  const store = await readStore();
  if (store.subscriptions[endpoint]) {
    delete store.subscriptions[endpoint];
    await writeStore(store);
  }
}

function resolveVapid() {
  const publicKey = String(
    process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY || '',
  ).trim();
  const privateKey = String(process.env.VAPID_PRIVATE_KEY || '').trim();
  const subject = String(
    process.env.VAPID_SUBJECT || 'mailto:odingabrewton@gmail.com',
  ).trim();
  return { publicKey, privateKey, subject };
}

async function getWebPush() {
  try {
    // Optional dependency — install with `npm i web-push` for remote delivery.
    // eslint-disable-next-line import/no-extraneous-dependencies, global-require
    return require('web-push');
  } catch (_) {
    return null;
  }
}

async function sendPushToSubscription(subscription, payload) {
  const webpush = await getWebPush();
  const vapid = resolveVapid();
  if (!webpush) {
    return { ok: false, reason: 'web-push-not-installed' };
  }
  if (!vapid.publicKey || !vapid.privateKey) {
    return { ok: false, reason: 'missing-vapid' };
  }

  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
      },
      JSON.stringify(payload),
      { TTL: 60 * 60 },
    );
    return { ok: true };
  } catch (err) {
    const statusCode = err?.statusCode || err?.status;
    if (statusCode === 404 || statusCode === 410) {
      await removeSubscription(subscription.endpoint);
      return { ok: false, reason: 'gone', removed: true };
    }
    return { ok: false, reason: err?.message || 'send-failed', statusCode };
  }
}

function dayKey(timeZone) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timeZone || undefined,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch (_) {
    return new Date().toISOString().slice(0, 10);
  }
}

/**
 * Dispatch due village reminders to all stored push subscriptions.
 */
async function dispatchDueVillagePush({ now = new Date(), windowMinutes = 8 } = {}) {
  const vapid = resolveVapid();
  if (!vapid.publicKey || !vapid.privateKey) {
    return { ok: false, reason: 'missing-vapid', sent: 0 };
  }

  const webpush = await getWebPush();
  if (!webpush) {
    return { ok: false, reason: 'web-push-not-installed', sent: 0 };
  }

  const store = await readStore();
  const sentLog = store.sentLog && typeof store.sentLog === 'object' ? store.sentLog : {};
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const sub of Object.values(store.subscriptions || {})) {
    const journey = normalizeJourney(sub.journey);
    const dueDaily = getDueSlotsForNow({
      userJourney: journey,
      timeZone: sub.timeZone,
      now,
      windowMinutes,
    });
    const dueWeekly = getWeeklyDue({
      userJourney: journey,
      timeZone: sub.timeZone,
      now,
    });
    const due = [...dueDaily, ...dueWeekly];
    if (!due.length) {
      skipped += 1;
      continue;
    }

    const keyDay = dayKey(sub.timeZone);
    for (const slot of due) {
      const dedupeKey = `${sub.endpoint}::${keyDay}::${slot.id}`;
      if (sentLog[dedupeKey]) continue;

      const copy = slot.copy || {};
      const route = copy.route || 'home';
      const url =
        route === 'nursery'
          ? '/?village=nursery'
          : route === 'kitchen'
            ? '/?village=kitchen'
            : route === 'tracker'
              ? '/?village=tracker'
              : route === 'midnight_lounge'
                ? '/?village=lounge'
                : '/app';

      const result = await sendPushToSubscription(sub, {
        title: copy.title || 'Calm Mama Village',
        body: copy.body || 'A soft note from your village is waiting.',
        url,
        tag: slot.id,
      });

      if (result.ok) {
        sentLog[dedupeKey] = Date.now();
        sent += 1;
      } else if (!result.removed) {
        failed += 1;
      }
    }
  }

  // Keep dedupe log from exploding — drop entries older than 3 days.
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
  Object.keys(sentLog).forEach((key) => {
    if (Number(sentLog[key]) < cutoff) delete sentLog[key];
  });
  store.sentLog = sentLog;
  const saved = await writeStore(store);

  return {
    ok: true,
    sent,
    skipped,
    failed,
    subscribers: Object.keys(store.subscriptions || {}).length,
    storeVia: store.via || saved.via,
  };
}

module.exports = {
  upsertSubscription,
  listSubscriptions,
  dispatchDueVillagePush,
  resolveVapid,
};
