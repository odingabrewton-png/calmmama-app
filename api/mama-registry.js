/**
 * Baby registry cloud API — progress keyed by mama email.
 * POST { email, progress, items?, action: 'save' }
 * GET/POST { email, action: 'restore' } — fetch (missing → fresh 0%)
 */

const {
  isValidEmail,
  normalizeEmail,
  saveMamaRegistryRecord,
  loadMamaRegistryRecord,
} = require('../mamaRegistryCloud');

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

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const body = parseBody(req);
    const email = normalizeEmail(body.email || req.query?.email);
    if (!isValidEmail(email)) {
      res.status(400).json({ ok: false, error: 'Valid email required' });
      return;
    }

    const action =
      req.method === 'GET'
        ? 'restore'
        : String(body.action || (body.progress != null ? 'save' : 'restore')).toLowerCase();

    if (action === 'save' || action === 'upsert') {
      const result = await saveMamaRegistryRecord({
        email,
        progress: body.progress,
        items: body.items,
        completedAt: body.completedAt,
        source: body.source || 'app',
      });
      const status = result.ok ? 200 : result.hint ? 503 : 502;
      res.status(status).json(result);
      return;
    }

    const loaded = await loadMamaRegistryRecord(email);
    if (!loaded.ok) {
      res.status(502).json(loaded);
      return;
    }

    res.status(200).json({
      ok: true,
      found: Boolean(loaded.found),
      email,
      registry: loaded.registry,
      via: loaded.via,
      hint: loaded.hint,
    });
  } catch (err) {
    console.warn('[CalmMama] mama-registry route error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected registry sync error' });
  }
};

module.exports.config = {
  maxDuration: 20,
};
