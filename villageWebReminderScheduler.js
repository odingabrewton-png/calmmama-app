/**
 * Web client day planner — fires remaining local Notification banners while the PWA is open.
 * Complements remote web-push when the tab/app is backgrounded but not fully killed.
 */

import { Platform } from 'react-native';
import { presentVillageWebNotification } from './pwaWebPush';
import {
  FEEDING_SCHEDULE_SLOTS,
  NOTIFICATION_COPY,
  NOTIFICATION_IDS,
  getFeedingNotificationCopy,
} from './notificationConfig';

const FIRED_KEY = 'calmmama.webReminders.fired';

function canUseDom() {
  return typeof window !== 'undefined';
}

function dayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function readFired() {
  if (!canUseDom()) return {};
  try {
    const raw = window.localStorage?.getItem(FIRED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function writeFired(map) {
  if (!canUseDom()) return;
  try {
    window.localStorage?.setItem(FIRED_KEY, JSON.stringify(map));
  } catch (_) {
    /* ignore */
  }
}

function buildSlots(userJourney) {
  const journey = String(userJourney || 'pregnant').toLowerCase();
  const slots = [
    { id: NOTIFICATION_IDS.MORNING_KITCHEN, hour: 7, minute: 30, copy: NOTIFICATION_COPY.morningKitchen },
    { id: NOTIFICATION_IDS.MIDDAY_CHECKIN, hour: 12, minute: 30, copy: NOTIFICATION_COPY.middayCheckin },
    { id: NOTIFICATION_IDS.AFTERNOON_SOFT, hour: 16, minute: 0, copy: NOTIFICATION_COPY.afternoonSoft },
    { id: NOTIFICATION_IDS.EVENING_LOUNGE, hour: 20, minute: 30, copy: NOTIFICATION_COPY.eveningLounge },
  ];
  if (journey === 'postpartum' || journey === 'hybrid') {
    slots.push({
      id: NOTIFICATION_IDS.NURSERY_SURVIVAL_DAILY,
      hour: 11,
      minute: 0,
      copy: NOTIFICATION_COPY.nurserySurvivalDaily,
    });
    FEEDING_SCHEDULE_SLOTS.forEach((slot) => {
      slots.push({
        id: slot.id,
        hour: slot.hour,
        minute: slot.minute,
        copy: getFeedingNotificationCopy(slot.hour),
      });
    });
  }
  return slots;
}

let timerIds = [];
let pollId = null;
let activeJourney = null;

function clearTimers() {
  timerIds.forEach((id) => clearTimeout(id));
  timerIds = [];
  if (pollId) {
    clearInterval(pollId);
    pollId = null;
  }
}

async function fireSlot(slot) {
  const key = `${dayKey()}::${slot.id}`;
  const fired = readFired();
  if (fired[key]) return;
  fired[key] = Date.now();
  writeFired(fired);
  await presentVillageWebNotification({
    title: slot.copy.title,
    body: slot.copy.body,
    route: slot.copy.route,
    tag: slot.id,
  });
}

function msUntil(hour, minute) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);
  return target.getTime() - now.getTime();
}

/**
 * Schedule remaining local web notifications for today + poll every minute as backup.
 */
export function syncVillageWebReminderSchedule(userJourney = 'pregnant') {
  if (Platform.OS !== 'web' || !canUseDom()) {
    return { scheduled: 0, skipped: 'not-web' };
  }
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return { scheduled: 0, skipped: 'permission' };
  }

  activeJourney = userJourney;
  clearTimers();

  const slots = buildSlots(userJourney);
  let scheduled = 0;

  slots.forEach((slot) => {
    const wait = msUntil(slot.hour, slot.minute);
    // Only schedule future slots; skip anything more than 2 minutes past.
    if (wait < -2 * 60 * 1000) return;
    const delay = Math.max(0, wait);
    const id = setTimeout(() => {
      fireSlot(slot).catch(() => {});
    }, delay);
    timerIds.push(id);
    scheduled += 1;
  });

  // Minute poll catches missed timers when the tab was throttled.
  pollId = setInterval(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    buildSlots(activeJourney || userJourney).forEach((slot) => {
      const slotMins = slot.hour * 60 + slot.minute;
      if (Math.abs(mins - slotMins) <= 1) {
        fireSlot(slot).catch(() => {});
      }
    });
  }, 60 * 1000);

  // When the PWA returns to the foreground, catch any slot that was due while suspended.
  if (typeof document !== 'undefined' && !document.__calmmamaWebReminderVis) {
    document.__calmmamaWebReminderVis = true;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      if (!activeJourney) return;
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      buildSlots(activeJourney).forEach((slot) => {
        const slotMins = slot.hour * 60 + slot.minute;
        if (Math.abs(mins - slotMins) <= 2) {
          fireSlot(slot).catch(() => {});
        }
      });
    });
  }

  return { scheduled, journey: userJourney, via: 'web-local' };
}

export function stopVillageWebReminderSchedule() {
  clearTimers();
  activeJourney = null;
}
