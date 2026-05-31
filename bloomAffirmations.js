/** Trimester-themed weekly affirmations for Weekly Bloom */

const T1_AFFIRMATIONS = [
  'Your body is doing sacred work — rest is not laziness, it is love.',
  'You do not have to feel ready every day to be becoming a beautiful mother.',
  'Tiny roots are growing inside you; trust the quiet miracle unfolding.',
  'It is okay to take up space with your feelings — you and baby are both new here.',
  'You are allowed to move slowly; spring does not rush the first bloom.',
  'Every wave of nausea, fatigue, or fear is met by your courage to keep going.',
  'Your village is here — asking for comfort is a sign of strength, not weakness.',
  'You are already mothering by listening to what your body whispers.',
  'Hope and worry may share the same breath — you are still whole.',
  'This season is tender; treat yourself with the gentleness you will give your child.',
];

const T2_AFFIRMATIONS = [
  'You are blooming in golden light — radiant, growing, and deeply enough.',
  'Each flutter you feel is a hello from the life you are nurturing.',
  'Your joy does not have to be loud to be real — quiet happiness counts.',
  'You are allowed to celebrate your body as it changes and makes room for love.',
  'Strength looks like showing up tired and choosing yourself anyway.',
  'You and baby are dancing together — trust the rhythm of this season.',
  'Your dreams for them are already a form of love in motion.',
  'You do not have to earn rest — you deserve it simply because you are here.',
  'This is your summer of becoming; soak in the warmth of your own grace.',
  'You are writing a story only you can tell — every chapter matters.',
];

const T3_AFFIRMATIONS = [
  'You are gathering strength like autumn gathers gold — patient, powerful, near.',
  'Your body knows how to finish this journey — breathe and trust the harvest.',
  'It is okay if the finish line feels far; you have already come so far.',
  'You are not behind — every baby and every mama arrive in their own time.',
  'Rest now saves strength for the sacred work ahead — honor your tiredness.',
  'You are the safe harbor your baby is sailing toward.',
  'Fear before birth is human; courage is showing up with an open heart anyway.',
  'Your love has been growing for months — it will be enough on day one.',
  'You are allowed to be excited and scared at once — both belong.',
  'When labor comes, remember: you were made for this meeting.',
];

const BY_TRIMESTER = [T1_AFFIRMATIONS, T2_AFFIRMATIONS, T3_AFFIRMATIONS];

/**
 * One affirmation per pregnancy week — varies by week, always matches trimester tone.
 * Stable for the same week (not re-rolled on every render).
 */
export function getWeeklyAffirmation(trimester, week, mamaName = 'Mama') {
  const list = BY_TRIMESTER[Math.min(3, Math.max(1, trimester)) - 1] || T2_AFFIRMATIONS;
  const index = ((week - 1) * 11 + trimester * 3) % list.length;
  const line = list[index];
  const name = (mamaName || 'Mama').trim().split(/\s+/)[0];
  return `${name}, ${line.charAt(0).toLowerCase()}${line.slice(1)}`;
}
