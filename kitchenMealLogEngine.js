/**
 * Mama's Kitchen nourishment log — persistent meal history + favorite analysis.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const KITCHEN_MEAL_LOG_STORAGE_KEY = 'kitchenMealLog';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function createEmptyMealLog() {
  return { entries: [], version: 1 };
}

export function calendarDayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfWeekMonday(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function normalizeMealName(name) {
  return String(name || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function makeEntryId() {
  return `meal_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeMealLog(raw) {
  if (!raw || typeof raw !== 'object') return createEmptyMealLog();
  const entries = Array.isArray(raw.entries)
    ? raw.entries
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const mealName = String(item.mealName || item.title || '').trim();
          if (!mealName) return null;
          const timestamp = item.timestamp || new Date().toISOString();
          const date = new Date(timestamp);
          const validDate = Number.isNaN(date.getTime()) ? new Date() : date;
          return {
            id: String(item.id || makeEntryId()),
            mealName,
            mealId: item.mealId ? String(item.mealId) : null,
            category: String(item.category || 'custom').trim() || 'custom',
            timestamp: validDate.toISOString(),
            dayKey: item.dayKey || calendarDayKey(validDate),
            notes: String(item.notes || '').trim().slice(0, 240),
          };
        })
        .filter(Boolean)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [];
  return { entries, version: 1 };
}

export async function loadKitchenMealLog() {
  try {
    const raw = await AsyncStorage.getItem(KITCHEN_MEAL_LOG_STORAGE_KEY);
    if (!raw) return createEmptyMealLog();
    return normalizeMealLog(JSON.parse(raw));
  } catch (_) {
    return createEmptyMealLog();
  }
}

export async function saveKitchenMealLog(log) {
  const normalized = normalizeMealLog(log);
  try {
    await AsyncStorage.setItem(KITCHEN_MEAL_LOG_STORAGE_KEY, JSON.stringify(normalized));
  } catch (_) {
    /* non-blocking */
  }
  return normalized;
}

/**
 * Append a nourishment entry. Does not award points — call rewards separately.
 */
export function appendMealLogEntry(log, payload = {}) {
  const current = normalizeMealLog(log);
  const mealName = String(payload.mealName || '').trim();
  if (!mealName) {
    return { ok: false, reason: 'missing_name', log: current, entry: null };
  }
  const now = payload.timestamp ? new Date(payload.timestamp) : new Date();
  const when = Number.isNaN(now.getTime()) ? new Date() : now;
  const entry = {
    id: makeEntryId(),
    mealName,
    mealId: payload.mealId ? String(payload.mealId) : null,
    category: String(payload.category || 'custom').trim() || 'custom',
    timestamp: when.toISOString(),
    dayKey: calendarDayKey(when),
    notes: String(payload.notes || '').trim().slice(0, 240),
  };
  const next = normalizeMealLog({
    ...current,
    entries: [entry, ...current.entries],
  });
  return { ok: true, reason: 'logged', log: next, entry };
}

/** Frequency map: normalized name → { mealName, count, lastCooked } */
export function buildMealFrequencyMap(entries = []) {
  const map = new Map();
  entries.forEach((entry) => {
    const key = normalizeMealName(entry.mealName);
    if (!key) return;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        mealName: entry.mealName,
        count: 1,
        lastCooked: entry.timestamp,
        mealId: entry.mealId || null,
      });
    } else {
      existing.count += 1;
      if (new Date(entry.timestamp) > new Date(existing.lastCooked)) {
        existing.lastCooked = entry.timestamp;
        existing.mealName = entry.mealName;
        if (entry.mealId) existing.mealId = entry.mealId;
      }
    }
  });
  return map;
}

/**
 * #1 Village Favorite — most logged meal overall, with this-month count for copy.
 */
export function getVillageFavoriteMeal(entries = [], now = new Date()) {
  if (!entries.length) return null;
  const freq = buildMealFrequencyMap(entries);
  const ranked = Array.from(freq.values()).sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return new Date(b.lastCooked) - new Date(a.lastCooked);
  });
  const top = ranked[0];
  if (!top) return null;

  const month = now.getMonth();
  const year = now.getFullYear();
  const monthCount = entries.filter((entry) => {
    if (normalizeMealName(entry.mealName) !== top.key) return false;
    const d = new Date(entry.timestamp);
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;

  return {
    mealName: top.mealName,
    mealId: top.mealId,
    totalCount: top.count,
    monthCount,
    monthLabel: MONTH_NAMES[month],
    headline:
      monthCount > 0
        ? `👑 Your Most Loved Nourishment: ${top.mealName} (Cooked ${monthCount} time${monthCount === 1 ? '' : 's'} this month!)`
        : `👑 Your Most Loved Nourishment: ${top.mealName} (Cooked ${top.count} time${top.count === 1 ? '' : 's'}!)`,
  };
}

/**
 * Group entries for archive UI: This Week, Last Week, then month archives.
 */
export function groupMealLogByPeriod(entries = [], now = new Date()) {
  const thisWeekStart = startOfWeekMonday(now);
  const lastWeekStart = addDays(thisWeekStart, -7);
  const lastWeekEnd = thisWeekStart;

  const thisWeek = [];
  const lastWeek = [];
  const monthBuckets = new Map();

  entries.forEach((entry) => {
    const d = new Date(entry.timestamp);
    if (Number.isNaN(d.getTime())) return;
    if (d >= thisWeekStart) {
      thisWeek.push(entry);
      return;
    }
    if (d >= lastWeekStart && d < lastWeekEnd) {
      lastWeek.push(entry);
      return;
    }
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthBuckets.has(key)) {
      monthBuckets.set(key, {
        key,
        label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()} Archive`,
        sortKey: key,
        entries: [],
      });
    }
    monthBuckets.get(key).entries.push(entry);
  });

  const months = Array.from(monthBuckets.values()).sort((a, b) =>
    a.sortKey < b.sortKey ? 1 : -1,
  );

  const sections = [];
  if (thisWeek.length) {
    sections.push({ id: 'this_week', label: 'This Week', entries: thisWeek });
  }
  if (lastWeek.length) {
    sections.push({ id: 'last_week', label: 'Last Week', entries: lastWeek });
  }
  months.forEach((bucket) => {
    sections.push({
      id: `month_${bucket.key}`,
      label: bucket.label,
      entries: bucket.entries,
    });
  });

  return sections;
}

export function formatMealLogTime(timestamp) {
  try {
    const d = new Date(timestamp);
    return d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch (_) {
    return '';
  }
}

export function categoryLabel(category) {
  switch (String(category || '').toLowerCase()) {
    case 'morning':
      return 'Morning';
    case 'noon':
    case 'afternoon':
      return 'Afternoon';
    case 'night':
    case 'dinner':
      return 'Night';
    case 'little_bites':
      return 'Little Bites';
    default:
      return 'Nourishment';
  }
}
