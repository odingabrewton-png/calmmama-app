import {
  resolveDuplicateVerdict,
  findOpenDuplicatePoll,
  areVillageItemsDuplicate,
} from './villagePollDuplicateEngine';
import { canAnswerVillageRegistryPolls } from './homeJourneyUtils';

let pollIdCounter = 1;
const polls = [];
const listeners = new Set();
let preferredRegistryPlatform = null;

function notify() {
  const snapshot = getVillagePollSnapshot();
  listeners.forEach((listener) => listener(snapshot));
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

  const total = Math.max(1, poll.neededVotes + poll.skipVotes);
  poll.neededPct = Math.round((poll.neededVotes / total) * 100);
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
