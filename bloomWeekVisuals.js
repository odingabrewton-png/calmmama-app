/**
 * 40-week visual stage map for Weekly Bloom (Phase 1).
 * Trimester videos: bloom-trimester-1/2/3.mp4 — swap assets without changing UI code.
 */

export const BLOOM_TRIMESTER_META = {
  1: {
    id: 1,
    weeks: [1, 12],
    dressTone: 'golden',
    dressLabel: 'Early bloom · golden light',
    silhouetteNote: 'Smaller early-stage bump — gentle cradling',
    videoAsset: 'bloom-trimester-1.mp4',
  },
  2: {
    id: 2,
    weeks: [13, 27],
    dressTone: 'sage',
    dressLabel: 'Mid bloom · sage green',
    silhouetteNote: 'Beautifully rounded mid-stage bump',
    videoAsset: 'bloom-trimester-2.mp4',
  },
  3: {
    id: 3,
    weeks: [28, 40],
    dressTone: 'fullTerm',
    dressLabel: 'Full bloom · autumn harvest',
    silhouetteNote: 'Full-term prominent watercolor silhouette',
    videoAsset: 'bloom-trimester-3.mp4',
  },
};

function trimesterForWeek(week) {
  if (week <= 12) return 1;
  if (week <= 27) return 2;
  return 3;
}

export const BLOOM_WEEK_VISUALS = Array.from({ length: 40 }, (_, index) => {
  const week = index + 1;
  const trimester = trimesterForWeek(week);
  const meta = BLOOM_TRIMESTER_META[trimester];
  const progressInTri =
    trimester === 1
      ? (week - 1) / 11
      : trimester === 2
        ? (week - 13) / 14
        : (week - 28) / 12;

  return {
    week,
    trimester,
    videoAsset: meta.videoAsset,
    dressTone: meta.dressTone,
    dressLabel: meta.dressLabel,
    silhouetteNote: meta.silhouetteNote,
    bumpStage: trimester === 1 ? 'early' : trimester === 2 ? 'mid' : 'fullTerm',
    progressInTri: Math.min(1, Math.max(0, progressInTri)),
  };
});

export function getBloomVisualForWeek(weekInput) {
  const week = Math.min(40, Math.max(1, parseInt(String(weekInput), 10) || 1));
  return BLOOM_WEEK_VISUALS[week - 1];
}
