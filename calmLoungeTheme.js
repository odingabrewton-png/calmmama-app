import { Platform } from 'react-native';

export const CALM_LINEN = '#FDFBF7';
export const CALM_INK = '#4A3E3D';
export const CALM_MAUVE = '#C7A2B3';
export const CALM_BLUSH_TRACK = '#FCEEEB';
export const CALM_GLASS = 'rgba(255, 255, 255, 0.85)';

export const CALM_CARD_RADIUS = 32;

export const CALM_SERIF = Platform.select({
  web: { fontFamily: 'Georgia, "Palatino Linotype", serif' },
  default: {},
});

export const CALM_SOFT_SHADOW = Platform.select({
  web: { boxShadow: '0 14px 40px rgba(199, 162, 179, 0.14)' },
  default: {
    shadowColor: '#C7A2B3',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 22,
    elevation: 4,
  },
});

export const CALM_PILLOW_CARD = {
  backgroundColor: CALM_GLASS,
  borderRadius: CALM_CARD_RADIUS,
  ...CALM_SOFT_SHADOW,
};
