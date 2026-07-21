/** Duplicate-query filter + past verdict catalog for Ask the Village */

const PAST_VERDICT_CATALOG = [
  {
    keywords: ['wipe warmer', 'wipes warmer', 'wipe warmers', 'wipes warmers'],
    itemDisplay: 'Wipe Warmers',
    neededPct: 18,
    skipPct: 82,
    note: 'They noted that wipes stay warm enough at room temp and cords pose a safety hassle.',
  },
  {
    keywords: ['bottle warmer', 'bottle warmers', 'milk warmer'],
    itemDisplay: 'Bottle Warmers',
    neededPct: 42,
    skipPct: 58,
    note: 'Many mamas warmed bottles in a mug of hot water — a dedicated warmer was nice but not essential.',
  },
  {
    keywords: ['night light', 'nightlight', 'night lights', 'nursery light'],
    itemDisplay: 'Night Lights',
    neededPct: 76,
    skipPct: 24,
    note: 'A soft warm glow for night changes was one of the most-loved little comforts.',
  },
  {
    keywords: ['bottle', 'bottles', 'baby bottle', 'baby bottles', 'extra bottles'],
    itemDisplay: 'Extra Bottles',
    neededPct: 64,
    skipPct: 36,
    note: 'Most mamas kept 4–6 slow-flow bottles and rotated dishwasher loads instead of stocking dozens.',
  },
  {
    keywords: ['stroller', 'pram', 'travel system'],
    itemDisplay: 'Premium Strollers',
    neededPct: 71,
    skipPct: 29,
    note: 'Village favorites were lightweight frames with one-hand fold — bulky travel systems gathered dust.',
  },
];

export function normalizeVillageItemKey(label) {
  return String(label || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesKeyword(haystack, keyword) {
  const needle = normalizeVillageItemKey(keyword);
  if (!needle) return false;
  return haystack.includes(needle);
}

function findBestCatalogEntry(normalized) {
  let best = null;
  let bestLen = -1;
  for (const entry of PAST_VERDICT_CATALOG) {
    for (const keyword of entry.keywords) {
      const needle = normalizeVillageItemKey(keyword);
      if (!needle) continue;
      if (matchesKeyword(normalized, keyword) && needle.length > bestLen) {
        best = entry;
        bestLen = needle.length;
      }
    }
  }
  return best;
}

/** True when two ask labels are the same item (exact, near phrase, or same catalog entry). */
export function areVillageItemsDuplicate(a, b) {
  const keyA = normalizeVillageItemKey(a);
  const keyB = normalizeVillageItemKey(b);
  if (!keyA || !keyB) return false;
  if (keyA === keyB) return true;

  const entryA = findBestCatalogEntry(keyA);
  const entryB = findBestCatalogEntry(keyB);
  if (entryA && entryB && entryA === entryB) return true;

  const shorter = keyA.length <= keyB.length ? keyA : keyB;
  const longer = keyA.length <= keyB.length ? keyB : keyA;
  if (longer.includes(shorter) && shorter.length >= Math.min(10, Math.ceil(longer.length * 0.7))) {
    return true;
  }
  return false;
}

export function findCatalogVerdict(itemLabel) {
  const normalized = normalizeVillageItemKey(itemLabel);
  if (!normalized) return null;
  const best = findBestCatalogEntry(normalized);
  return best ? formatVerdictFromEntry(best) : null;
}

export function findHistoricalVerdict(itemLabel, resolvedPolls = []) {
  const match = resolvedPolls.find((poll) => areVillageItemsDuplicate(itemLabel, poll.item));
  if (!match) return null;

  const skipWins = (match.skipPct ?? 0) >= (match.neededPct ?? 0);
  const tip = match.tips?.[0]?.text;
  const note =
    tip ||
    (skipWins
      ? 'Postpartum mamas shared that this was an easy skip in their nest.'
      : 'Postpartum mamas flagged this as a registry keeper.');

  return {
    itemDisplay: match.item,
    neededPct: match.neededPct ?? 0,
    skipPct: match.skipPct ?? 0,
    voteWinner: skipWins ? 'skip' : 'needed',
    note,
    message: buildVerdictMessage({
      itemDisplay: match.item,
      neededPct: match.neededPct ?? 0,
      skipPct: match.skipPct ?? 0,
      note,
    }),
  };
}

function formatVerdictFromEntry(entry) {
  return {
    itemDisplay: entry.itemDisplay,
    neededPct: entry.neededPct,
    skipPct: entry.skipPct,
    voteWinner: entry.skipPct >= entry.neededPct ? 'skip' : 'needed',
    note: entry.note,
    message: buildVerdictMessage(entry),
  };
}

export function buildVerdictMessage({ itemDisplay, neededPct, skipPct, note }) {
  const skipWins = skipPct >= neededPct;
  const pct = skipWins ? skipPct : neededPct;
  const voteLabel = skipWins ? 'SKIP IT' : 'NEEDED';
  return `🌟 Past Verdict: ${pct}% of Postpartum Mamas voted ${voteLabel} on ${itemDisplay}. ${note}`;
}

export function resolveDuplicateVerdict(itemLabel, resolvedPolls = []) {
  return findCatalogVerdict(itemLabel) || findHistoricalVerdict(itemLabel, resolvedPolls);
}

export function findOpenDuplicatePoll(itemLabel, openPolls = []) {
  return openPolls.find((poll) => areVillageItemsDuplicate(itemLabel, poll.item)) || null;
}
