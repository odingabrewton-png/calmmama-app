/**
 * EXPO GO STUB — personalized push disabled until Apple Developer / dev build setup.
 *
 * RESTORE: npm install expo-notifications, re-add the plugin in app.json, and
 * replace this file with the full scheduler (expo-notifications imports,
 * setNotificationHandler, scheduleNotificationAsync, listeners).
 */

import { NOTIFICATION_ROUTES } from './notificationConfig';

export function configureVillageNotificationHandler() {
  // RESTORE: import * as Notifications from 'expo-notifications';
  // RESTORE: Notifications.setNotificationHandler({ ... });
}

export async function resetLegacyNotificationSchedules() {
  // RESTORE: Notifications.cancelAllScheduledNotificationsAsync();
}

export async function bootstrapVillageNotifications() {
  // RESTORE: configure handler + purge legacy OS schedules on cold start.
}

export async function ensureNotificationPermissions() {
  // RESTORE: Notifications.getPermissionsAsync / requestPermissionsAsync
  return { granted: false, status: 'expo-go-stub' };
}

export async function cancelAllVillageNotifications() {
  // RESTORE: resetLegacyNotificationSchedules();
}

export async function syncVillageNotificationSchedule(_userJourney = 'pregnant') {
  // RESTORE: schedule morning kitchen, evening lounge, bloom / nursery + feeding loop.
  return { scheduled: 0, skipped: 'expo-go-stub' };
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

export function subscribeToNotificationResponses(_onRoute) {
  // RESTORE: Notifications.addNotificationResponseReceivedListener(...)
  return () => {};
}

export async function consumeInitialNotificationRoute() {
  // RESTORE: Notifications.getLastNotificationResponseAsync()
  return null;
}
