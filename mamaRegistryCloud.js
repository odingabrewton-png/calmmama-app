/**
 * Email-keyed baby registry progress (CommonJS for Vercel/Render APIs).
 * Each mama email starts at 0% and only her own adds increase progress.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

function registryKey(email) {
  const hash = crypto.createHash('sha256').update(normalizeEmail(email)).digest('hex');
  return `mama-registry:v1:${hash}`;
}

function clampProgress(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  if (n > 1) return 1;
  return Math.round(n * 1000) / 1000;
}

function emptyRegistry(email) {
  return {
    email: normalizeEmail(email),
    progress: 0,
    items: [],
    completedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeRegistry(email, raw) {
  const base = emptyRegistry(email);
  if (!raw || typeof raw !== 'object') return base;
  const items = Array.isArray(raw.items)
    ? raw.items
        .filter((item) => item && typeof item === 'object')
        .slice(-80)
        .map((item) => ({
          id: String(item.id || '').slice(0, 80),
          source: String(item.source || item.url || '').slice(0, 240),
          label: String(item.label || '').slice(0, 120),
          addedAt: String(item.addedAt || raw.updatedAt || base.updatedAt).slice(0, 40),
        }))
    : [];
  return {
    email: normalizeEmail(email),
    progress: clampProgress(raw.progress),
    items,
    completedAt: raw.completedAt ? String(raw.completedAt).slice(0, 40) : null,
    updatedAt: String(raw.updatedAt || base.updatedAt).slice(0, 40),
    source: raw.source ? String(raw.source).slice(0, 64) : undefined,
  };
}

function resolveFileStorePath() {
  if (process.env.MAMA_REGISTRY_STORE_PATH) return process.env.MAMA_REGISTRY_STORE_PATH;
  if (process.env.VERCEL) return path.join('/tmp', 'calmmama-mama-registries.json');
  return path.join(__dirname, 'data', 'mama-registries.json');
}

function readFileStore() {
  const filePath = resolveFileStorePath();
  try {
    if (!fs.existsSync(filePath)) return { registries: {} };
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return {
      registries:
        raw && typeof raw.registries === 'object' && raw.registries ? raw.registries : {},
    };
  } catch (_) {
    return { registries: {} };
  }
}

function writeFileStore(store) {
  const filePath = resolveFileStorePath();
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(store), 'utf8');
    return true;
  } catch (err) {
    console.warn('[CalmMama] mama registry file store write failed', err?.message || err);
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

async function saveMamaRegistryRecord({ email, progress, items, completedAt, source } = {}) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: 'Invalid email' };
  }

  const record = normalizeRegistry(normalized, {
    progress,
    items,
    completedAt:
      completedAt ||
      (clampProgress(progress) >= 1 ? new Date().toISOString() : null),
    updatedAt: new Date().toISOString(),
    source: String(source || 'app').slice(0, 64),
  });
  const key = registryKey(normalized);
  const payload = JSON.stringify(record);

  const kv = await kvRun(['SET', key, payload]);
  if (kv.ok) {
    return { ok: true, via: 'kv', registry: record };
  }

  const store = readFileStore();
  store.registries[key] = record;
  if (!writeFileStore(store)) {
    return {
      ok: false,
      error: kv.error || 'Registry store unavailable',
      hint: 'Add Upstash/Vercel KV (KV_REST_API_URL + KV_REST_API_TOKEN) for durable per-email registries.',
    };
  }
  return {
    ok: true,
    via: process.env.VERCEL ? 'tmp-file' : 'file',
    registry: record,
  };
}

async function loadMamaRegistryRecord(email) {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) {
    return { ok: false, error: 'Invalid email' };
  }
  const key = registryKey(normalized);

  const kv = await kvRun(['GET', key]);
  if (kv.ok && kv.result) {
    try {
      const parsed = typeof kv.result === 'string' ? JSON.parse(kv.result) : kv.result;
      return {
        ok: true,
        via: 'kv',
        found: true,
        registry: normalizeRegistry(normalized, parsed),
      };
    } catch (_) {
      /* fall through */
    }
  }

  const store = readFileStore();
  const record = store.registries[key];
  if (record) {
    return {
      ok: true,
      via: process.env.VERCEL ? 'tmp-file' : 'file',
      found: true,
      registry: normalizeRegistry(normalized, record),
    };
  }

  return {
    ok: true,
    found: false,
    registry: emptyRegistry(normalized),
    hint: kv.skipped
      ? 'No cloud registry store configured yet (add Vercel KV / Upstash for durable per-email progress).'
      : undefined,
  };
}

module.exports = {
  normalizeEmail,
  isValidEmail,
  clampProgress,
  emptyRegistry,
  normalizeRegistry,
  saveMamaRegistryRecord,
  loadMamaRegistryRecord,
};
