/** Founding Sisters — first 40 free merch bundle */

export const FOUNDING_GIFTS_CAP = 40;

export const FOUNDING_GIFT_PLACEHOLDER = require('./assets/calmmama-official-logo.png');

export const FOUNDING_GIFTS_PROMO_COPY =
  'As a special thank you for joining our yearly village inner circle, we want to send this exclusive Boutique Cotton Canvas Tote Bag, Custom CalmMama Pin, & Matching Ceramic Mug Bundle straight to your doorstep—100% free.';

export const FOUNDING_GIFT_ITEMS = [
  {
    id: 'canvas-tote',
    title: 'Premium Canvas Tote Bag',
    subtitle: 'Full-body zen mama floral gown illustration',
    imageSource: require('./assets/founding-gifts-person-4-front.png'),
    previewImage: require('./assets/founding-gifts-person-4-front.png'),
  },
  {
    id: 'village-pin',
    title: 'Custom Village Pin',
    subtitle: "Exclusive 'Mama You Matter' 2026 Member Badge",
    imageSource: require('./assets/founding-gifts-pin-front-2.png'),
    previewImage: require('./assets/founding-gifts-pin-front-2.png'),
  },
  {
    id: 'ceramic-mug',
    title: 'Boutique Ceramic Mug',
    subtitle: "Matching 'Mama You Matter' morning coffee & tea mug",
    imageSource: require('./assets/founding-gifts-mug-front.png'),
    previewImage: require('./assets/founding-gifts-mug-front.png'),
  },
];

export const FOUNDING_GIFT_PREVIEW_STYLE = {
  width: 120,
  height: 120,
  borderRadius: 16,
  resizeMode: 'contain',
  backgroundColor: '#FFF',
  margin: 8,
};

export function getFoundingGiftPreviewSource(item) {
  return item?.previewImage ?? item?.imageSource ?? FOUNDING_GIFT_PLACEHOLDER;
}
