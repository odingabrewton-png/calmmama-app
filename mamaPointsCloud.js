/**
 * Email-keyed manual Crown Points grants (glitch recovery).
 * Stored in Vercel KV / Upstash when configured, with file fallback for local dev.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ADMIN_EMAIL = 'odingabrewton@gmail.com';

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function isAdminEmail(email) {
  return normalizeEmail(email) === ADMIN_EMAIL;
}

function pointsKey(email) {
  const hash = crypto.createHash('sha256').update(normalizeEmail(email)).digest('hex');
  return `mama-manual-points:v1:${hash}`;
}

function resolveFileStorePath() {
  if (process.env.MAMA_POINTS_STORE_PATH) return process.env.MAMA_POINTS_STORE_PATH;
  if (process.env.VERCEL) return path.join('/tmp', 'calmmama-mama-points.json');
  return path.join(__dirname, 'data', 'mama-points.json');
}

function readFileStore() {
  const filePath = resolveFileStorePath();
  try {
    if (!fs.existsSync(filePath)) return { records: {} };
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return {
      records: raw && typeof raw.records === 'object' && raw.records ? raw.records : {},
    };
  } catch (_) {
    return { records: {} };
  }
}

function writeFileStore(store) {
  const filePath = resolveFileStorePath();
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(store), 'utf8');
    return true;
  } catch (err) {
    console.warn('[CalmMama] mama points file store write failed', err?.message || err);
    return false;
  }
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

function createEmptyRecord(email) {
  return {
    email: normalizeEmail(email),
    pendingTotal: 0,
    grants: [],
    updatedAt: new Date().toISOString(),
  };
}

function normalizeRecord(record, email) {
  if (!record || typeof record !== 'object') return createEmptyRecord(email);
  const grants = Array.isArray(record.grants) ? record.grants : [];
  const pendingFromGrants = grants
    .filter((grant) => grant && !grant.claimedAt)
    .reduce((sum, grant) => sum + Math.max(0, Number(grant.amount) || 0), 0);
  return {
    email: normalizeEmail(record.email || email),
    pendingTotal: Math.max(Number(record.pendingTotal) || 0, pendingFromGrants),
    grants,
    updatedAt: record.updatedAt || new Date().toISOString(),
  };
}

async function loadPointsRecord(email) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: 'Invalid email' };
  }
  const key = pointsKey(normalized);

  const kv = await kvRun(['GET', key]);
  if (kv.ok && kv.result) {
    try {
      const parsed = typeof kv.result === 'string' ? JSON.parse(kv.result) : kv.result;
      return { ok: true, via: 'kv', record: normalizeRecord(parsed, normalized) };
    } catch (_) {
      /* fall through */
    }
  }

  const store = readFileStore();
  const record = store.records[key];
  if (record) {
    return {
      ok: true,
      via: process.env.VERCEL ? 'tmp-file' : 'file',
      record: normalizeRecord(record, normalized),
    };
  }

  return {
    ok: true,
    via: kv.skipped ? 'none' : 'kv',
    record: createEmptyRecord(normalized),
    hint: kv.skipped
      ? 'No cloud points store configured yet (add Vercel KV / Upstash for cross-device grants).'
      : undefined,
  };
}

async function savePointsRecord(email, record) {
  const normalized = normalizeEmail(email);
  const key = pointsKey(normalized);
  const payload = JSON.stringify({
    ...normalizeRecord(record, normalized),
    updatedAt: new Date().toISOString(),
  });

  const kv = await kvRun(['SET', key, payload]);
  if (kv.ok) {
    return { ok: true, via: 'kv' };
  }

  const store = readFileStore();
  store.records[key] = JSON.parse(payload);
  if (!writeFileStore(store)) {
    return {
      ok: false,
      error: kv.error || 'Points store unavailable',
      hint: 'Add KV_REST_API_URL + KV_REST_API_TOKEN on Vercel for durable manual grants.',
    };
  }
  return { ok: true, via: process.env.VERCEL ? 'tmp-file' : 'file' };
}

async function grantManualPoints({
  recipientEmail,
  amount,
  note = '',
  grantedBy = ADMIN_EMAIL,
} = {}) {
  const recipient = normalizeEmail(recipientEmail);
  const admin = normalizeEmail(grantedBy);
  if (!isAdminEmail(admin)) {
    return { ok: false, error: 'Forbidden — admin allowlist only' };
  }
  if (!isValidEmail(recipient)) {
    return { ok: false, error: 'Valid recipient email required' };
  }

  const grantAmount = Math.max(0, Math.min(10000, Math.floor(Number(amount) || 0)));
  if (!grantAmount) {
    return { ok: false, error: 'Grant amount must be greater than 0' };
  }

  const loaded = await loadPointsRecord(recipient);
  if (!loaded.ok) return loaded;

  const record = loaded.record;
  const grant = {
    id: `grant-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    amount: grantAmount,
    note: String(note || '').trim().slice(0, 240),
    grantedAt: new Date().toISOString(),
    grantedBy: admin,
    claimedAt: null,
  };
  record.grants = [...(record.grants || []), grant].slice(-50);
  record.pendingTotal = (Number(record.pendingTotal) || 0) + grantAmount;

  const saved = await savePointsRecord(recipient, record);
  if (!saved.ok) return saved;

  return {
    ok: true,
    recipientEmail: recipient,
    amount: grantAmount,
    pendingTotal: record.pendingTotal,
    grantId: grant.id,
    via: saved.via,
    message: `Queued ${grantAmount.toLocaleString()} pts for ${recipient}`,
  };
}

async function claimManualPoints({ email } = {}) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: 'Valid email required' };
  }

  const loaded = await loadPointsRecord(normalized);
  if (!loaded.ok) return loaded;

  const record = loaded.record;
  const pendingGrants = (record.grants || []).filter((grant) => grant && !grant.claimedAt);
  const claimAmount = pendingGrants.reduce(
    (sum, grant) => sum + Math.max(0, Number(grant.amount) || 0),
    0,
  );

  if (!claimAmount) {
    return {
      ok: true,
      amount: 0,
      claimed: false,
      message: 'No pending manual points',
      hint: loaded.hint,
    };
  }

  const claimedAt = new Date().toISOString();
  record.grants = (record.grants || []).map((grant) =>
    grant && !grant.claimedAt ? { ...grant, claimedAt } : grant,
  );
  record.pendingTotal = 0;

  const saved = await savePointsRecord(normalized, record);
  if (!saved.ok) return saved;

  return {
    ok: true,
    amount: claimAmount,
    claimed: true,
    grantCount: pendingGrants.length,
    via: saved.via,
    message: `Claimed ${claimAmount.toLocaleString()} manual Crown Points`,
  };
}

module.exports = {
  ADMIN_EMAIL,
  normalizeEmail,
  isValidEmail,
  isAdminEmail,
  grantManualPoints,
  claimManualPoints,
  loadPointsRecord,
};
