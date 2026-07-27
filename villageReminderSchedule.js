/**
 * Shared village reminder slots (CommonJS) — native client mirrors these in notificationConfig.js.
 * Used by web-push subscribe/dispatch on Node (Vercel + Render).
 */

const ROUTES = Object.freeze({
  HOME: 'home',
  KITCHEN: 'kitchen',
  BLOOM: 'tracker',
  NURSERY: 'nursery',
  MIDNIGHT_LOUNGE: 'midnight_lounge',
});

const IDS = Object.freeze({
  MORNING_KITCHEN: 'calmmama.notification.morning-kitchen',
  MIDDAY_CHECKIN: 'calmmama.notification.midday-checkin',
  AFTERNOON_SOFT: 'calmmama.notification.afternoon-soft',
  EVENING_LOUNGE: 'calmmama.notification.evening-lounge',
  WEEKLY_BLOOM: 'calmmama.notification.weekly-bloom',
  NURSERY_SUPPORT: 'calmmama.notification.nursery-support',
  NURSERY_SURVIVAL_DAILY: 'calmmama.notification.nursery-survival-daily',
  FEEDING_0930: 'calmmama.notification.feeding-0930',
  FEEDING_1200: 'calmmama.notification.feeding-1200',
  FEEDING_1430: 'calmmama.notification.feeding-1430',
  FEEDING_1700: 'calmmama.notification.feeding-1700',
  FEEDING_1930: 'calmmama.notification.feeding-1930',
  FEEDING_2200: 'calmmama.notification.feeding-2200',
});

const COPY = Object.freeze({
  morningKitchen: {
    title: 'The Mama Kitchen',
    body: 'Good morning, Mama. ☀️ Start your day with a nourishing, high-protein breakfast. Tap to open your Kitchen guide.',
    route: ROUTES.KITCHEN,
  },
  middayCheckin: {
    title: 'Midday village check-in',
    body: 'Pause for water, a soft breath, and one kind note to yourself. Your village is with you. 💧',
    route: ROUTES.HOME,
  },
  afternoonSoft: {
    title: 'Afternoon soft landing',
    body: 'A gentle afternoon nudge — stretch, snack, or open Soul Sanctuary for a quiet reset. 🌿',
    route: ROUTES.MIDNIGHT_LOUNGE,
  },
  eveningLounge: {
    title: 'Midnight Lounge',
    body: "The sun is down, Mama. 🌙 Step into the Midnight Lounge for tonight's grounding ritual and check in with your village.",
    route: ROUTES.MIDNIGHT_LOUNGE,
  },
  weeklyBloom: {
    title: 'Weekly Bloom',
    body: "Week check-in, Mama. See baby's growth, read this week's facts, and update your weight in Bloom.",
    route: ROUTES.BLOOM,
  },
  nurserySupport: {
    title: 'Cloud Nursery',
    body: 'Swipe your Postpartum Survival checklist in the Nursery tab — hydration, healing, rest & more. Each check earns +5 Crown Points (up to 6/day).',
    route: ROUTES.NURSERY,
  },
  nurserySurvivalDaily: {
    title: 'Postpartum Survival Checklist',
    body: '☁️ Swipe the Nursery cards — log hydration, nourishment, breathwork & rest. Each gentle check earns +5 Crown Points.',
    route: ROUTES.NURSERY,
  },
});

const FEEDING_SLOTS = [
  { id: IDS.FEEDING_0930, hour: 9, minute: 30 },
  { id: IDS.FEEDING_1200, hour: 12, minute: 0 },
  { id: IDS.FEEDING_1430, hour: 14, minute: 30 },
  { id: IDS.FEEDING_1700, hour: 17, minute: 0 },
  { id: IDS.FEEDING_1930, hour: 19, minute: 30 },
  { id: IDS.FEEDING_2200, hour: 22, minute: 0 },
];

function feedingCopy(hour) {
  const period = hour < 14 ? 'morning' : 'afternoon';
  return {
    title: 'Feeding reminder',
    body: `Time for a sweet snuggle and feed. 🍼 Tap to quickly log baby's ${period} feeding session.`,
    route: ROUTES.NURSERY,
  };
}

function buildJourneySlots(userJourney = 'pregnant') {
  const journey = String(userJourney || 'pregnant').toLowerCase();
  const slots = [
    { id: IDS.MORNING_KITCHEN, hour: 7, minute: 30, copy: COPY.morningKitchen },
    { id: IDS.MIDDAY_CHECKIN, hour: 12, minute: 30, copy: COPY.middayCheckin },
    { id: IDS.AFTERNOON_SOFT, hour: 16, minute: 0, copy: COPY.afternoonSoft },
    { id: IDS.EVENING_LOUNGE, hour: 20, minute: 30, copy: COPY.eveningLounge },
  ];

  if (journey === 'postpartum' || journey === 'hybrid') {
    slots.push({
      id: IDS.NURSERY_SURVIVAL_DAILY,
      hour: 11,
      minute: 0,
      copy: COPY.nurserySurvivalDaily,
    });
    FEEDING_SLOTS.forEach((slot) => {
      slots.push({
        id: slot.id,
        hour: slot.hour,
        minute: slot.minute,
        copy: feedingCopy(slot.hour),
      });
    });
  }

  return slots;
}

function getLocalParts(date = new Date(), timeZone) {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || undefined,
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      hourCycle: 'h23',
    });
    const parts = fmt.formatToParts(date);
    const map = {};
    parts.forEach((part) => {
      if (part.type !== 'literal') map[part.type] = part.value;
    });
    const weekdayMap = { Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6, Sat: 7 };
    return {
      weekday: weekdayMap[map.weekday] || 1,
      hour: Number(map.hour) % 24,
      minute: Number(map.minute) || 0,
    };
  } catch (_) {
    return {
      weekday: date.getDay() + 1,
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  }
}

function getDueSlotsForNow({
  userJourney = 'pregnant',
  timeZone,
  now = new Date(),
  windowMinutes = 7,
} = {}) {
  const local = getLocalParts(now, timeZone);
  const nowMins = local.hour * 60 + local.minute;
  return buildJourneySlots(userJourney).filter((slot) => {
    const slotMins = slot.hour * 60 + slot.minute;
    const delta = Math.abs(nowMins - slotMins);
    return delta <= windowMinutes || delta >= 24 * 60 - windowMinutes;
  });
}

function getWeeklyDue({ userJourney = 'pregnant', timeZone, now = new Date() } = {}) {
  const journey = String(userJourney || 'pregnant').toLowerCase();
  const local = getLocalParts(now, timeZone);
  const due = [];
  // Monday 10:00 bloom
  if (
    (journey === 'pregnant' || journey === 'hybrid') &&
    local.weekday === 2 &&
    local.hour === 10 &&
    local.minute <= 14
  ) {
    due.push({ id: IDS.WEEKLY_BLOOM, copy: COPY.weeklyBloom });
  }
  // Wednesday 10:00 nursery
  if (
    (journey === 'postpartum' || journey === 'hybrid') &&
    local.weekday === 4 &&
    local.hour === 10 &&
    local.minute <= 14
  ) {
    due.push({ id: IDS.NURSERY_SUPPORT, copy: COPY.nurserySupport });
  }
  return due;
}

module.exports = {
  IDS,
  COPY,
  ROUTES,
  buildJourneySlots,
  getDueSlotsForNow,
  getWeeklyDue,
  getLocalParts,
};
