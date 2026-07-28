/**
 * Mama profile cloud sync API.
 * POST { email, profile, source? } — upsert snapshot for restore-after-reinstall
 * GET  ?email= — fetch snapshot
 * POST { email, action: 'restore' } — same as GET (avoids email in query logs when preferred)
 */

const {
  isValidEmail,
  normalizeEmail,
  saveMamaProfileRecord,
  loadMamaProfileRecord,
} = require('../mamaProfileCloud');

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
        : String(body.action || (body.profile ? 'save' : 'restore')).toLowerCase();

    if (action === 'save' || action === 'upsert') {
      const result = await saveMamaProfileRecord({
        email,
        profile: body.profile,
        source: body.source || 'app',
      });
      const status = result.ok ? 200 : result.hint ? 503 : 502;
      res.status(status).json(result);
      return;
    }

    const loaded = await loadMamaProfileRecord(email);
    if (!loaded.ok) {
      res.status(502).json(loaded);
      return;
    }
    if (!loaded.record) {
      res.status(200).json({
        ok: true,
        found: false,
        profile: null,
        hint: loaded.hint,
      });
      return;
    }

    res.status(200).json({
      ok: true,
      found: true,
      email: loaded.record.email,
      updatedAt: loaded.record.updatedAt,
      profile: loaded.record.profile,
      via: loaded.via,
    });
  } catch (err) {
    console.warn('[CalmMama] mama-profile route error', err?.message || err);
    res.status(500).json({ ok: false, error: 'Unexpected profile sync error' });
  }
};

module.exports.config = {
  maxDuration: 20,
};
