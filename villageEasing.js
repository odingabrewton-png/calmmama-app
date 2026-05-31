import { Easing } from 'react-native';

/** Sinusoidal ease — RN docs mention Easing.sin but it is not always exported. */
export function villageSin(t) {
  return 1 - Math.cos((t * Math.PI) / 2);
}

export const VILLAGE_IN_OUT_SIN = Easing.inOut(villageSin);
