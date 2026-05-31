/**
 * Trimester belly-caress videos for Weekly Bloom.
 *
 * Week ranges:
 *   1–12  → first trimester  (assets/bloom-trimester-1.mp4)
 *   13–27 → second trimester (assets/bloom-trimester-2.mp4)
 *   28–40 → third trimester   (assets/bloom-trimester-3.mp4)
 *
 * After adding or replacing a file, restart: npx expo start --web --clear
 */

const TRIMESTER_1_VIDEO = require('./assets/bloom-trimester-1.mp4');
const TRIMESTER_2_VIDEO = require('./assets/bloom-trimester-2.mp4');
const TRIMESTER_3_VIDEO = require('./assets/bloom-trimester-3.mp4');

export function getTrimesterForWeek(weekInput) {
  const week = Math.min(40, Math.max(1, parseInt(String(weekInput), 10) || 1));
  if (week <= 12) return 1;
  if (week <= 27) return 2;
  return 3;
}

export function getBloomVideoForWeek(weekInput) {
  const t = getTrimesterForWeek(weekInput);
  if (t === 1) return TRIMESTER_1_VIDEO;
  if (t === 2) return TRIMESTER_2_VIDEO;
  return TRIMESTER_3_VIDEO;
}

export const TRIMESTER_VIDEO_LABELS = {
  1: 'First trimester · golden dress (weeks 1–12)',
  2: 'Second trimester · sage dress (weeks 13–27)',
  3: 'Third trimester · full-term bloom (weeks 28–40)',
};
