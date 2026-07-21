import { warmPregnancyOracle } from './pregnancyOraclePreload';

let loungeWarmPromise = null;

/** Warm Midnight Lounge chunk + ritual sub-screens before the lotus opens. */
export function warmMidnightLounge(userJourney = 'pregnant') {
  if (userJourney === 'pregnant') {
    warmPregnancyOracle();
  }

  if (userJourney === 'postpartum') {
    warmPostpartumBabyOracle();
    warmPostpartumSanctuaryJournal();
  }

  if (!loungeWarmPromise) {
    loungeWarmPromise = Promise.all([
      import('./SoulSanctuaryScreen'),
      import('./screens/TwoAMBabyOracleScreen'),
      import('./VillageBoutiqueScreen'),
    ]).catch(() => {});
  }

  return loungeWarmPromise;
}

export function warmPostpartumSanctuaryJournal() {
  return import('./SoulSanctuaryScreen').catch(() => {});
}

export function warmPostpartumBabyOracle() {
  return import('./screens/TwoAMBabyOracleScreen').catch(() => {});
}
