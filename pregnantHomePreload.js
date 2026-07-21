import { warmBloomVideos } from './bloomVideoPlayerPool';
import { warmPregnancyOracle } from './pregnancyOraclePreload';
import { warmPregnantKitchenImages } from './pregnantKitchenImagePreload';

let warmPromise = null;
let warmWeek = null;

/** Preload pregnant Home tab assets before the mama lands on Home. */
export function warmPregnantHome(userJourney, weeksPregnant = 24) {
  if (userJourney !== 'pregnant') return Promise.resolve();

  try {
    warmBloomVideos(weeksPregnant);
  } catch (_) {
    /* bloom warm is best-effort */
  }

  try {
    warmPregnancyOracle();
  } catch (_) {
    /* oracle warm is best-effort */
  }

  if (warmPromise && warmWeek === weeksPregnant) {
    return warmPromise;
  }

  warmWeek = weeksPregnant;
  warmPromise = warmPregnantKitchenImages().catch(() => {});
  return warmPromise;
}
