/** Midnight Lounge — one fresh evening mantra per calendar day. */

export const TONIGHT_MANTRAS = Object.freeze([
  'I am enough, even in the quiet hours.',
  'Rest is sacred work — not a reward I must earn.',
  'My love is steady, even when I am tired.',
  'This season is hard and holy. I am held.',
  'Tomorrow can wait. Tonight I breathe.',
  'I release what I cannot carry into tomorrow.',
  'My body has done beautiful work today.',
  'I am allowed to rest before everything is finished.',
  'The night is gentle with me — I can be gentle with myself.',
  'I am not alone in these quiet hours.',
  'Every slow breath is an act of motherly love.',
  'I trust my tired heart to know what it needs.',
  'Softness is strength in the moonlight.',
  'I deserve peace, even when the to-do list remains.',
  'My worth is not measured by productivity today.',
  'I am growing a human and growing into myself.',
  'The village holds me, even when I cannot see it.',
  'I let go of guilt like exhaling into the dark.',
  'Tonight I honor how far I have already come.',
  'My baby feels my calm when I offer myself kindness.',
  'I am writing a love story in ordinary moments.',
  'Sleep will find me when my nervous system is ready.',
  'I am the safe place — for my little one and for me.',
  'Worries may visit, but they do not have to stay.',
  'I choose one kind thought about myself before I close my eyes.',
  'My courage today was quiet and that still counts.',
  'The stars do not hurry — neither must I.',
  'I am blooming in my own time, in my own way.',
  'Gratitude and grief may share this hour — I make room for both.',
  'I am held by something larger than tonight\'s worries.',
  'When I rest, I am still mothering with love.',
]);

function hashDateString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getTonightMantraDayKey(date = new Date()) {
  return date.toDateString();
}

/** Stable mantra for the given calendar day — changes each evening, not on every app open. */
export function getTonightMantra(date = new Date()) {
  const dayKey = getTonightMantraDayKey(date);
  const index = hashDateString(`tonight-mantra-${dayKey}`) % TONIGHT_MANTRAS.length;
  return TONIGHT_MANTRAS[index];
}
