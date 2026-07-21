/**
 * Root container theme — equivalent of NavigationContainer `theme.colors.background`.
 * Keeps scene switches from compositing over the system default gray/white.
 * Must match VillageOmbreBackdrop's sage base so the ombre never sits on a mismatched shell.
 */
import { CALM_MAMA_PASTEL } from './calmMamaPastelPalette';

export const VILLAGE_ROOT_BACKGROUND = CALM_MAMA_PASTEL.sage;

/** Shape mirrors React Navigation's Theme for future NavigationContainer adoption. */
export const VILLAGE_ROOT_THEME = Object.freeze({
  dark: false,
  colors: Object.freeze({
    primary: CALM_MAMA_PASTEL.lavender,
    background: VILLAGE_ROOT_BACKGROUND,
    card: VILLAGE_ROOT_BACKGROUND,
    text: '#152219',
    border: 'rgba(0,0,0,0.06)',
    notification: CALM_MAMA_PASTEL.peach,
  }),
});
