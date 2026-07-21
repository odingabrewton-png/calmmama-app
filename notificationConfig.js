/** Deep-link routes stored in notification `data.route` for tap handling. */
export const NOTIFICATION_ROUTES = {
  HOME: 'home',
  KITCHEN: 'kitchen',
  BLOOM: 'tracker',
  NURSERY: 'nursery',
  MIDNIGHT_LOUNGE: 'midnight_lounge',
};

/** Stable identifiers for the 2026 village reminder schedule. */
export const NOTIFICATION_IDS = {
  MORNING_KITCHEN: 'calmmama.notification.morning-kitchen',
  EVENING_LOUNGE: 'calmmama.notification.evening-lounge',
  WEEKLY_BLOOM: 'calmmama.notification.weekly-bloom',
  NURSERY_SUPPORT: 'calmmama.notification.nursery-support',
  FEEDING_0930: 'calmmama.notification.feeding-0930',
  FEEDING_1200: 'calmmama.notification.feeding-1200',
  FEEDING_1430: 'calmmama.notification.feeding-1430',
  FEEDING_1700: 'calmmama.notification.feeding-1700',
  FEEDING_1930: 'calmmama.notification.feeding-1930',
  FEEDING_2200: 'calmmama.notification.feeding-2200',
};

/** Retired identifiers from earlier builds — explicitly cancelled during reset. */
export const LEGACY_NOTIFICATION_IDS = [
  'calmmama.notification.test',
  'calmmama.notification.midday-kitchen',
];

/** Postpartum feeding loop — ~2.5 hour cadence during waking hours. */
export const FEEDING_SCHEDULE_SLOTS = [
  { id: NOTIFICATION_IDS.FEEDING_0930, hour: 9, minute: 30 },
  { id: NOTIFICATION_IDS.FEEDING_1200, hour: 12, minute: 0 },
  { id: NOTIFICATION_IDS.FEEDING_1430, hour: 14, minute: 30 },
  { id: NOTIFICATION_IDS.FEEDING_1700, hour: 17, minute: 0 },
  { id: NOTIFICATION_IDS.FEEDING_1930, hour: 19, minute: 30 },
  { id: NOTIFICATION_IDS.FEEDING_2200, hour: 22, minute: 0 },
];

export const ACTIVE_VILLAGE_NOTIFICATION_IDS = [
  NOTIFICATION_IDS.MORNING_KITCHEN,
  NOTIFICATION_IDS.EVENING_LOUNGE,
  NOTIFICATION_IDS.WEEKLY_BLOOM,
  NOTIFICATION_IDS.NURSERY_SUPPORT,
  ...FEEDING_SCHEDULE_SLOTS.map((slot) => slot.id),
];

export const NOTIFICATION_COPY = {
  morningKitchen: {
    title: 'The Mama Kitchen',
    body: 'Good morning, Mama. ☀️ Start your day with a nourishing, high-protein breakfast. Tap to open your Kitchen guide.',
    route: NOTIFICATION_ROUTES.KITCHEN,
  },
  eveningLounge: {
    title: 'Midnight Lounge',
    body: "The sun is down, Mama. 🌙 Step into the Midnight Lounge for tonight's grounding ritual and check in with your village.",
    route: NOTIFICATION_ROUTES.MIDNIGHT_LOUNGE,
  },
  weeklyBloom: {
    title: 'Weekly Bloom',
    body: "You're doing amazing, Mama. Tap to see how your body and baby are blooming this week.",
    route: NOTIFICATION_ROUTES.BLOOM,
  },
  nurserySupport: {
    title: 'Cloud Nursery',
    body: "Ready to log? Tap to quickly track baby's cycles or peek at this week's calming nursery tips.",
    route: NOTIFICATION_ROUTES.NURSERY,
  },
};

export function getFeedingNotificationCopy(hour) {
  const period = hour < 14 ? 'morning' : 'afternoon';
  return {
    title: 'Feeding reminder',
    body: `Time for a sweet snuggle and feed. 🍼 Tap to quickly log baby's ${period} feeding session.`,
    route: NOTIFICATION_ROUTES.NURSERY,
  };
}

/** Expo weekday: 1 = Sunday … 7 = Saturday */
export const NOTIFICATION_WEEKDAYS = {
  WEEKLY_BLOOM: 2,
  NURSERY_SUPPORT: 4,
};
