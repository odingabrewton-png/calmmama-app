import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
  FEEDING_SCHEDULE_SLOTS,
  LEGACY_NOTIFICATION_IDS,
  NOTIFICATION_COPY,
  NOTIFICATION_IDS,
  NOTIFICATION_ROUTES,
  NOTIFICATION_WEEKDAYS,
  getFeedingNotificationCopy,
} from './notificationConfig';

const ANDROID_CHANNEL_ID = 'calmmama-village-reminders';

let handlerConfigured = false;
let legacySchedulesPurged = false;

export function configureVillageNotificationHandler() {
  if (handlerConfigured) return;
  handlerConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function resetLegacyNotificationSchedules() {
  if (Platform.OS === 'web') return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (_) {
    /* ignore — best-effort OS cache wipe */
  }

  await Promise.all(
    LEGACY_NOTIFICATION_IDS.map((id) =>
      Notifications.cancelScheduledNotificationAsync(id).catch(() => {})
    )
  );
}

export async function bootstrapVillageNotifications() {
  if (Platform.OS === 'web') return;

  configureVillageNotificationHandler();

  if (legacySchedulesPurged) return;
  legacySchedulesPurged = true;
  await resetLegacyNotificationSchedules();
}

export async function ensureNotificationPermissions() {
  if (Platform.OS === 'web') {
    return { granted: false, status: 'web-unsupported' };
  }

  configureVillageNotificationHandler();

  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) {
    return existing;
  }

  return Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
}

const MOMENT_TITLES = Object.freeze({
  rewards: 'Village Rewards',
  checklist: 'Daily Checklist',
  kitchen: "Mama's Kitchen",
  sanctuary: 'Soul Sanctuary',
  bloom: 'Weekly Bloom',
  nursery: 'Cloud Nursery',
  community: 'Village Love',
  membership: 'Village Access',
});

const MOMENT_ROUTES = Object.freeze({
  kitchen: NOTIFICATION_ROUTES.KITCHEN,
  bloom: NOTIFICATION_ROUTES.BLOOM,
  nursery: NOTIFICATION_ROUTES.NURSERY,
  sanctuary: NOTIFICATION_ROUTES.MIDNIGHT_LOUNGE,
  checklist: NOTIFICATION_ROUTES.HOME,
  rewards: NOTIFICATION_ROUTES.HOME,
  community: NOTIFICATION_ROUTES.MIDNIGHT_LOUNGE,
  membership: NOTIFICATION_ROUTES.HOME,
});

/**
 * Fire an immediate iOS/Android OS banner for in-app moments
 * (points earned, kitchen log, checklist, bloom reminder, etc.).
 * No-op on web / when permission is denied.
 */
export async function presentVillageMomentNotification({
  title,
  body,
  category = 'rewards',
  route,
  emoji,
} = {}) {
  if (Platform.OS === 'web') {
    return { ok: false, reason: 'web' };
  }

  const message = String(body || '').trim();
  if (!message) {
    return { ok: false, reason: 'empty' };
  }

  configureVillageNotificationHandler();

  const permission = await ensureNotificationPermissions();
  if (!permission.granted) {
    return { ok: false, reason: 'permission-denied' };
  }

  await ensureAndroidChannel();

  const resolvedCategory = String(category || 'rewards');
  const resolvedTitle =
    String(title || '').trim() ||
    MOMENT_TITLES[resolvedCategory] ||
    MOMENT_TITLES.rewards;
  const resolvedRoute = route || MOMENT_ROUTES[resolvedCategory] || NOTIFICATION_ROUTES.HOME;
  const prefix = emoji ? `${emoji} ` : '';

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: resolvedTitle,
        body: `${prefix}${message}`,
        data: {
          route: resolvedRoute,
          category: resolvedCategory,
          kind: 'village_moment',
        },
        sound: true,
        ...(Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : {}),
      },
      // null = deliver immediately as a real OS notification
      trigger: null,
    });
    return { ok: true, id };
  } catch (err) {
    if (__DEV__ && typeof console !== 'undefined') {
      console.warn('[CalmMama Village] Moment notification failed:', err);
    }
    return { ok: false, reason: 'schedule-failed' };
  }
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Village Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 180, 80, 180],
    lightColor: '#E8E5F7',
  });
}

function buildContent({ title, body, route, categoryIdentifier }) {
  return {
    title,
    body,
    data: { route },
    sound: true,
    ...(Platform.OS === 'android'
      ? { channelId: ANDROID_CHANNEL_ID }
      : {}),
    ...(categoryIdentifier ? { categoryIdentifier } : {}),
  };
}

async function scheduleDaily({ identifier, hour, minute, copy }) {
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: buildContent(copy),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

async function scheduleWeekly({ identifier, weekday, hour, minute, copy }) {
  await Notifications.scheduleNotificationAsync({
    identifier,
    content: buildContent(copy),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday,
      hour,
      minute,
    },
  });
}

export async function cancelAllVillageNotifications() {
  await resetLegacyNotificationSchedules();
}

export async function syncVillageNotificationSchedule(userJourney = 'pregnant') {
  if (Platform.OS === 'web') return { scheduled: 0, skipped: 'web' };

  const permission = await ensureNotificationPermissions();
  if (!permission.granted) {
    return { scheduled: 0, skipped: 'permission-denied' };
  }

  await ensureAndroidChannel();
  await resetLegacyNotificationSchedules();

  const shared = [
    scheduleDaily({
      identifier: NOTIFICATION_IDS.MORNING_KITCHEN,
      hour: 7,
      minute: 30,
      copy: NOTIFICATION_COPY.morningKitchen,
    }),
    scheduleDaily({
      identifier: NOTIFICATION_IDS.EVENING_LOUNGE,
      hour: 20,
      minute: 30,
      copy: NOTIFICATION_COPY.eveningLounge,
    }),
  ];

  if (userJourney === 'pregnant' || userJourney === 'hybrid') {
    await Promise.all([
      ...shared,
      scheduleWeekly({
        identifier: NOTIFICATION_IDS.WEEKLY_BLOOM,
        weekday: NOTIFICATION_WEEKDAYS.WEEKLY_BLOOM,
        hour: 10,
        minute: 0,
        copy: NOTIFICATION_COPY.weeklyBloom,
      }),
    ]);
    if (userJourney === 'pregnant') {
      return { scheduled: 3, journey: 'pregnant' };
    }
  }

  if (userJourney === 'postpartum' || userJourney === 'hybrid') {
    const feedingJobs = FEEDING_SCHEDULE_SLOTS.map((slot) =>
      scheduleDaily({
        identifier: slot.id,
        hour: slot.hour,
        minute: slot.minute,
        copy: getFeedingNotificationCopy(slot.hour),
      })
    );

    await Promise.all([
      ...(userJourney === 'hybrid' ? [] : shared),
      scheduleWeekly({
        identifier: NOTIFICATION_IDS.NURSERY_SUPPORT,
        weekday: NOTIFICATION_WEEKDAYS.NURSERY_SUPPORT,
        hour: 10,
        minute: 0,
        copy: NOTIFICATION_COPY.nurserySupport,
      }),
      ...feedingJobs,
    ]);

    return {
      scheduled:
        userJourney === 'hybrid'
          ? 3 + 1 + FEEDING_SCHEDULE_SLOTS.length
          : 2 + 1 + FEEDING_SCHEDULE_SLOTS.length,
      journey: userJourney,
    };
  }

  await Promise.all(shared);
  return { scheduled: 2, journey: userJourney || 'default' };
}

export function getRouteFromNotification(notification) {
  const route = notification?.request?.content?.data?.route;
  if (typeof route === 'string' && route.length > 0) {
    return route;
  }
  return null;
}

export function isKnownNotificationRoute(route) {
  return Object.values(NOTIFICATION_ROUTES).includes(route);
}

export function subscribeToNotificationResponses(onRoute) {
  if (Platform.OS === 'web') {
    return () => {};
  }

  configureVillageNotificationHandler();

  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const route = getRouteFromNotification(response.notification);
    if (route) {
      onRoute(route);
    }
  });

  return () => subscription.remove();
}

export async function consumeInitialNotificationRoute() {
  if (Platform.OS === 'web') {
    return null;
  }

  const response = await Notifications.getLastNotificationResponseAsync();
  return getRouteFromNotification(response?.notification);
}
