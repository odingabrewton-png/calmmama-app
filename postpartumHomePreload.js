import { getHomeJourneyPhase } from './homeJourneyUtils';

const warmByPhase = {
  infant: null,
  toddler: null,
};

/** Preload postpartum Home tab chunks before the mama lands on Home. */
export function warmPostpartumHome(userJourney, babyAge) {
  if (userJourney !== 'postpartum') return Promise.resolve();

  const phase = getHomeJourneyPhase(userJourney, babyAge);
  if (phase !== 'infant' && phase !== 'toddler') return Promise.resolve();

  if (!warmByPhase[phase]) {
    warmByPhase[phase] =
      phase === 'infant'
        ? Promise.all([import('./PostpartumInfantHome')]).catch(() => {})
        : import('./VillageTimeCapsule').catch(() => {});
  }

  return warmByPhase[phase];
}
