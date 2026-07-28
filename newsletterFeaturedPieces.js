/**
 * Dated featured newsletter essays — keyed by Tuesday send date (YYYY-MM-DD, America/New_York).
 * CommonJS for Node (weeklyNewsletter / Vercel cron).
 */

/**
 * Calendar date string in America/New_York (YYYY-MM-DD).
 */
function etDateKey(date = new Date()) {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  } catch (_) {
    const d = date instanceof Date ? date : new Date();
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

/**
 * Featured pieces scheduled for specific Tuesday sends.
 * Add new entries with the Tuesday date key when the piece should go out.
 */
const FEATURED_PIECES_BY_TUESDAY = {
  // Next automated Tuesday send (Aug 4, 2026 · 9:00 AM ET)
  '2026-08-04': {
    id: 'instagram-perfect-nursery-2026-08-04',
    eyebrow: 'Village Essay',
    title:
      "Why we're throwing out the 'Instagram-Perfect' nursery trend (and what to focus on instead)",
    paragraphs: [
      "Scroll long enough and every nursery starts to look like a magazine spread — coordinated baskets, floating shelves, a chair that costs more than your first car, and a palette so soft it feels illegal to leave a burp cloth on it. Beautiful? Sometimes. Necessary? Almost never.",
      "Here's the quiet truth we keep hearing from Village mamas: the rooms that photograph best are often the ones that stress moms most. When every corner is styled for the algorithm, real life — spit-up, overnight feeds, a partner looking for wipes at 2 a.m. — feels like a failure of the aesthetic instead of what it actually is: a baby being loved in a home that works.",
      "We're throwing out the Instagram-perfect nursery trend not because beauty is wrong, but because perfection is a poor design brief for motherhood. A nursery's job is not to impress strangers. It is to help you find what you need half-asleep, sit comfortably through a long feed, and feel calm when the day feels loud.",
      "What to focus on instead:",
    ],
    bullets: [
      'Function over filters — Put diapers, cream, and a change of onesie where your hands already reach. Pretty containers are optional; reachability is not.',
      'Soft light + soft seating — A dimmable lamp and a chair you can actually nap in beat a styled vignette every night.',
      'One calm surface — Clear the top of the dresser or changing table. Visual rest lowers nervous-system noise more than matching wallpaper.',
      'Safety + sleep basics first — Firm flat sleep space, clear crib, good blackout if you can. Trends can wait; safe sleep cannot.',
      'Leave room for becoming — Blank walls fill themselves with photos, art your toddler later “helps” hang, and memories that never needed a Pinterest board.',
    ],
    closing:
      "Your nursery does not need to be a showroom. It needs to be a soft landing for two humans learning each other. If it holds love, a few baskets, and a place for you to sit — it is already enough.",
    ctaLabel: 'Open the Village App →',
    ctaPath: '/app',
  },
};

function getFeaturedNewsletterPiece(date = new Date()) {
  const key = etDateKey(date);
  const piece = FEATURED_PIECES_BY_TUESDAY[key];
  if (!piece) return null;
  return { ...piece, sendDateKey: key };
}

module.exports = {
  FEATURED_PIECES_BY_TUESDAY,
  etDateKey,
  getFeaturedNewsletterPiece,
};
