/**
 * Email-keyed mama profile cloud store (CommonJS for Vercel/Render APIs).
 * Backends (first match wins):
 * 1) Vercel KV / Upstash Redis REST
 * 2) Local/Render JSON file under ./data (or WEB_PUSH-style path)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MAX_PHOTO_CHARS = 180000; // ~135KB — keeps serverless payloads sane
const MAX_TIMECAPSULE_ENTRIES = 24;

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function profileKey(email) {
  const hash = crypto.createHash('sha256').update(normalizeEmail(email)).digest('hex');
  return `mama-profile:v1:${hash}`;
}

function slimProfile(profile) {
  if (!profile || typeof profile !== 'object') return null;
  const next = { ...profile };

  if (typeof next.profilePhotoUri === 'string' && next.profilePhotoUri.length > MAX_PHOTO_CHARS) {
    // Keep a flag so restore knows a photo existed but was too large for cloud.
    next.profilePhotoUri = null;
    next.profilePhotoOmitted = true;
  }

  if (next.timeCapsuleEntries && typeof next.timeCapsuleEntries === 'object') {
    const entries = Array.isArray(next.timeCapsuleEntries)
      ? next.timeCapsuleEntries
      : Object.values(next.timeCapsuleEntries);
    const trimmed = entries.slice(-MAX_TIMECAPSULE_ENTRIES).map((entry) => {
      if (!entry || typeof entry !== 'object') return entry;
      const copy = { ...entry };
      if (typeof copy.photoUri === 'string' && copy.photoUri.length > 40000) {
        copy.photoUri = null;
        copy.photoOmitted = true;
      }
      if (typeof copy.imageUri === 'string' && copy.imageUri.length > 40000) {
        copy.imageUri = null;
        copy.photoOmitted = true;
      }
      return copy;
    });
    next.timeCapsuleEntries = trimmed;
  }

  return next;
}

function isSparseProfile(profile) {
  if (!profile || typeof profile !== 'object') return true;
  const name = String(profile.displayName || '').trim();
  const hasName = name && name.toLowerCase() !== 'mama';
  const hasJourney =
    profile.userJourney === 'pregnant' ||
    profile.userJourney === 'postpartum' ||
    profile.userJourney === 'hybrid';
  const hasChildren = Array.isArray(profile.children) && profile.children.length > 0;
  const hasPregnancy = Boolean(profile.weeksPregnant || profile.currentPregnancy?.weeksPregnant);
  const hasCity = Boolean(String(profile.approximateCity || '').trim());
  const hasPhoto = Boolean(profile.profilePhotoUri);
  return !(hasName || hasJourney || hasChildren || hasPregnancy || hasCity || hasPhoto);
}

function resolveFileStorePath() {
  if (process.env.MAMA_PROFILE_STORE_PATH) return process.env.MAMA_PROFILE_STORE_PATH;
  if (process.env.VERCEL) return path.join('/tmp', 'calmmama-mama-profiles.json');
  return path.join(__dirname, 'data', 'mama-profiles.json');
}

function readFileStore() {
  const filePath = resolveFileStorePath();
  try {
    if (!fs.existsSync(filePath)) return { profiles: {} };
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return {
      profiles:
        raw && typeof raw.profiles === 'object' && raw.profiles ? raw.profiles : {},
    };
  } catch (_) {
    return { profiles: {} };
  }
}

function writeFileStore(store) {
  const filePath = resolveFileStorePath();
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(store), 'utf8');
    return true;
  } catch (err) {
    console.warn('[CalmMama] mama profile file store write failed', err?.message || err);
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

function hasAnyStore() {
  return Boolean(resolveKvConfig()) || !process.env.VERCEL || Boolean(process.env.MAMA_PROFILE_STORE_PATH);
}

async function saveMamaProfileRecord({ email, profile, source } = {}) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: 'Invalid email' };
  }
  const slim = slimProfile(profile);
  if (!slim) return { ok: false, error: 'Invalid profile' };

  const record = {
    email: normalized,
    profile: slim,
    updatedAt: new Date().toISOString(),
    source: String(source || 'app').slice(0, 64),
  };
  const key = profileKey(normalized);
  const payload = JSON.stringify(record);

  const kv = await kvRun(['SET', key, payload]);
  if (kv.ok) {
    return { ok: true, via: 'kv', email: normalized, updatedAt: record.updatedAt };
  }

  // File fallback (Render / local). On plain Vercel /tmp is best-effort only.
  const store = readFileStore();
  store.profiles[key] = record;
  if (!writeFileStore(store)) {
    return {
      ok: false,
      error: kv.error || 'Profile store unavailable',
      hint: 'Add Upstash/Vercel KV (KV_REST_API_URL + KV_REST_API_TOKEN) for durable restore on Vercel.',
    };
  }
  return {
    ok: true,
    via: process.env.VERCEL ? 'tmp-file' : 'file',
    email: normalized,
    updatedAt: record.updatedAt,
  };
}

async function loadMamaProfileRecord(email) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: 'Invalid email' };
  }
  const key = profileKey(normalized);

  const kv = await kvRun(['GET', key]);
  if (kv.ok && kv.result) {
    try {
      const parsed = typeof kv.result === 'string' ? JSON.parse(kv.result) : kv.result;
      if (parsed?.profile) {
        return { ok: true, via: 'kv', record: parsed };
      }
    } catch (_) {
      /* fall through */
    }
  }

  const store = readFileStore();
  const record = store.profiles[key];
  if (record?.profile) {
    return { ok: true, via: process.env.VERCEL ? 'tmp-file' : 'file', record };
  }

  return {
    ok: true,
    found: false,
    record: null,
    hint: kv.skipped
      ? 'No cloud profile store configured yet (add Vercel KV / Upstash for durable restore).'
      : undefined,
  };
}

module.exports = {
  normalizeEmail,
  isValidEmail,
  slimProfile,
  isSparseProfile,
  hasAnyStore,
  saveMamaProfileRecord,
  loadMamaProfileRecord,
};
