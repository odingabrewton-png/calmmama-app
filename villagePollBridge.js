import {
  resolveDuplicateVerdict,
  findOpenDuplicatePoll,
  areVillageItemsDuplicate,
} from './villagePollDuplicateEngine';
import { canAnswerVillageRegistryPolls } from './homeJourneyUtils';

const SEED_TIPS_NEEDED = [
  'Night feeds feel colder than you expect — our wipe warmer was a tiny comfort ritual.',
  'We kept it on the dresser. Low heat, soft glow, zero regrets.',
];

const SEED_TIPS_SKIP = [
  'Room-temp wipes never bothered our little one — save the counter space.',
  'A warm washcloth for thirty seconds works just as well.',
  'Put that money toward burp cloths. You will need dozens.',
];

let pollIdCounter = 1;
const polls = [];
const listeners = new Set();
let preferredRegistryPlatform = null;
let tempPreviewSeeded = false;

/** TEMP — sample asks + resolved advice for UI preview. */
export const TEMP_REGISTRY_POLL_PREVIEW = true;

const TEMP_PREVIEW_OPEN_ITEMS = ['Sound machine', 'Diaper cream kit'];

const TEMP_PREVIEW_RESOLVED = [
  {
    item: 'Wipe warmer',
    neededPct: 18,
    skipPct: 82,
    tip: 'Room-temp wipes never bothered our little one — save the counter space and the cord worry.',
  },
  {
    item: 'Night light',
    neededPct: 76,
    skipPct: 24,
    tip: 'A soft warm glow for night changes was one of the most-loved little comforts in our nursery.',
  },
  {
    item: 'Bottle warmer',
    neededPct: 42,
    skipPct: 58,
    tip: 'We warmed bottles in a mug of hot water. Nice to have, not a must — I’d skip it for the registry.',
  },
];

function notify() {
  const snapshot = getVillagePollSnapshot();
  listeners.forEach((listener) => listener(snapshot));
}

export function ensureTempPreviewRegistryPolls() {
  if (!TEMP_REGISTRY_POLL_PREVIEW || tempPreviewSeeded) return;
  tempPreviewSeeded = true;

  TEMP_PREVIEW_RESOLVED.forEach((entry) => {
    const already = polls.some(
      (poll) => poll.status === 'resolved' && poll.item === entry.item,
    );
    if (already) return;
    polls.push({
      id: `temp-advice-${pollIdCounter++}`,
      item: entry.item,
      status: 'resolved',
      neededVotes: entry.neededPct >= entry.skipPct ? 1 : 0,
      skipVotes: entry.skipPct > entry.neededPct ? 1 : 0,
      tips: entry.tip
        ? [{ id: `temp-tip-${pollIdCounter}`, text: entry.tip, fromMama: true }]
        : [],
      neededPct: entry.neededPct,
      skipPct: entry.skipPct,
      createdAt: Date.now() - 60000,
      resolvedAt: Date.now() - 30000,
      seenByPregnant: true,
      isTempPreview: true,
    });
  });

  const existingOpen = polls.some((poll) => poll.status === 'open');
  if (!existingOpen) {
    TEMP_PREVIEW_OPEN_ITEMS.forEach((item) => {
      polls.push({
        id: `temp-preview-${pollIdCounter++}`,
        item,
        status: 'open',
        neededVotes: 0,
        skipVotes: 0,
        tips: [],
        neededPct: 0,
        skipPct: 0,
        createdAt: Date.now(),
        seenByPregnant: false,
        isTempPreview: true,
      });
    });
  }

  notify();
}

export function getPreferredRegistryPlatform() {
  return preferredRegistryPlatform;
}

export function setPreferredRegistryPlatform(platformId) {
  const next = String(platformId || '').trim();
  if (!next) return;
  preferredRegistryPlatform = next;
}

export function getVillagePollSnapshot() {
  return {
    open: polls.filter((poll) => poll.status === 'open'),
    resolved: polls.filter((poll) => poll.status === 'resolved'),
    all: [...polls],
  };
}

export function subscribeVillagePolls(listener) {
  listeners.add(listener);
  listener(getVillagePollSnapshot());
  return () => listeners.delete(listener);
}

function materializePastVerdictPoll(item, verdict) {
  const existing = polls.find(
    (poll) => poll.status === 'resolved' && areVillageItemsDuplicate(item, poll.item),
  );
  if (existing) {
    return existing;
  }

  const poll = {
    id: String(pollIdCounter++),
    item,
    status: 'resolved',
    neededVotes: verdict.voteWinner === 'needed' ? 1 : 0,
    skipVotes: verdict.voteWinner === 'skip' ? 1 : 0,
    tips: verdict.note ? [{ id: `past-${Date.now()}`, text: verdict.note }] : [],
    neededPct: verdict.neededPct ?? 0,
    skipPct: verdict.skipPct ?? 0,
    createdAt: Date.now(),
    resolvedAt: Date.now(),
    seenByPregnant: true,
    fromPastVerdict: true,
  };

  polls.unshift(poll);
  notify();
  return poll;
}

export function submitVillagePollQuestion(itemLabel) {
  const item = String(itemLabel || '').trim();
  if (!item) return { ok: false };

  const openPolls = polls.filter((poll) => poll.status === 'open');
  const openDup = findOpenDuplicatePoll(item, openPolls);
  if (openDup) {
    return {
      ok: true,
      type: 'already_open',
      pollId: openDup.id,
      poll: openDup,
      verdict: {
        message: `⏳ Mama, you already asked about this — the village is still weighing in on “${openDup.item}.”`,
        itemDisplay: openDup.item,
      },
    };
  }

  const resolvedPolls = polls.filter((poll) => poll.status === 'resolved');
  const duplicateVerdict = resolveDuplicateVerdict(item, resolvedPolls);
  if (duplicateVerdict) {
    const poll = materializePastVerdictPoll(item, duplicateVerdict);
    return {
      ok: true,
      type: 'auto_resolved',
      pollId: poll.id,
      poll,
      verdict: duplicateVerdict,
    };
  }

  const poll = {
    id: String(pollIdCounter++),
    item,
    status: 'open',
    neededVotes: 0,
    skipVotes: 0,
    tips: [],
    neededPct: 0,
    skipPct: 0,
    createdAt: Date.now(),
    seenByPregnant: false,
  };

  polls.unshift(poll);
  notify();
  return {
    ok: true,
    type: 'created',
    pollId: poll.id,
    poll,
  };
}

export function submitPostpartumPollResponse(pollId, vote, tipText, babyAge) {
  if (!canAnswerVillageRegistryPolls(babyAge)) {
    return false;
  }

  const poll = polls.find((entry) => entry.id === pollId && entry.status === 'open');
  if (!poll) return false;

  const voteKey = vote === 'needed' ? 'needed' : 'skip';
  if (voteKey === 'needed') poll.neededVotes += 1;
  else poll.skipVotes += 1;

  const trimmedTip = String(tipText || '').trim();
  if (trimmedTip) {
    poll.tips.unshift({ id: `${poll.id}-tip-${Date.now()}`, text: trimmedTip });
  }

  const seedTips = voteKey === 'needed' ? SEED_TIPS_NEEDED : SEED_TIPS_SKIP;
  seedTips.forEach((text, index) => {
    poll.tips.push({ id: `${poll.id}-seed-${index}`, text });
  });

  const villageWeight = 4;
  const neededScore = poll.neededVotes * 2 + (voteKey === 'needed' ? villageWeight : 0);
  const skipScore = poll.skipVotes * 2 + (voteKey === 'skip' ? villageWeight : 0);
  const total = Math.max(1, neededScore + skipScore);

  poll.neededPct = Math.round((neededScore / total) * 100);
  poll.skipPct = 100 - poll.neededPct;
  poll.status = 'resolved';
  poll.resolvedAt = Date.now();
  poll.seenByPregnant = false;

  notify();
  return true;
}

export function markVillagePollSeenByPregnant(pollId) {
  const poll = polls.find((entry) => entry.id === pollId);
  if (!poll) return;
  poll.seenByPregnant = true;
  notify();
}

export function getNextUnseenResolvedPoll() {
  return polls.find((poll) => poll.status === 'resolved' && !poll.seenByPregnant) || null;
}

/** Open polls for postpartum Midnight Lounge feed — newest first */
export function getMidnightLoungeLivePolls() {
  return getVillagePollSnapshot().open;
}
