/** Pastel ombre cycle — sage green, lavender, peach */
export const CALM_MAMA_PASTEL = Object.freeze({
  sage: '#9CB89C',
  lavender: '#B8A8D8',
  peach: '#E8B8A8',
});

export const CALM_MAMA_PASTEL_CYCLE_MS = 10000;

/** Closed loop for interpolateColor (sage → lavender → peach → sage) */
export const CALM_MAMA_PASTEL_CYCLE = Object.freeze([
  CALM_MAMA_PASTEL.sage,
  CALM_MAMA_PASTEL.lavender,
  CALM_MAMA_PASTEL.peach,
  CALM_MAMA_PASTEL.sage,
]);

export const CALM_MAMA_PASTEL_PHASE_STOPS = Object.freeze([0, 0.33, 0.66, 1]);
