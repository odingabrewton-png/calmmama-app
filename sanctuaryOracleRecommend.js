/**
 * Suggest Midnight Lounge oracles from Soul Sanctuary journal text.
 * Postpartum / baby-up-at-night → 2 AM Baby Oracle
 * Pregnant / restless mind-body → 2 AM Pregnancy Oracle
 */

const PREGNANCY_ORACLE_PATTERNS = [
  /\bcan(?:not|'?t) sleep\b/,
  /\binsomnia\b/,
  /\brace(?:ing)? thoughts?\b/,
  /\bmind (?:will|won)'?t (?:quiet|shut off|stop)\b/,
  /\bmind will not (?:quiet|shut off|stop)\b/,
  /\banxious(?:ness)?\b/,
  /\banxiety\b/,
  /\bpanic\b/,
  /\brestless\b/,
  /\boverwhelmed?\b/,
  /\bstressed?\b/,
  /\bcan(?:not|'?t) calm (?:down|my mind)\b/,
  /\bneed(?:s)? to (?:breathe|settle|calm)\b/,
  /\bbreath(?:e|ing)? (?:exercise|work|practice)?\b/,
  /\bheart (?:racing|pounding)\b/,
  /\bworry(?:ing)? (?:about )?(?:birth|labor|baby|everything)\b/,
  /\bup (?:at )?(?:2|two) ?a\.?m\.?\b/,
  /\bmiddle of the night\b/,
  /\bwide awake\b/,
  /\bcan(?:not|'?t) turn (?:my )?brain off\b/,
  /\bpregnancy insomnia\b/,
  /\bscared (?:about|of) (?:birth|labor|delivery)\b/,
  /\bnausea (?:at night|keeping me)\b/,
  /\bheartburn (?:at night|keeping)\b/,
  /\bbraxton\b/,
  /\bcontractions?\b/,
  /\bkicks? (?:keeping|waking)\b/,
];

const BABY_ISSUE_PATTERNS = [
  /\bbab(?:y|ies)\b/,
  /\bnewborn\b/,
  /\binfant\b/,
  /\blittle one\b/,
  /\blittle guy\b/,
  /\blittle girl\b/,
  /\bkiddo\b/,
  /\btoddler\b/,
  /\bteething\b/,
  /\bgas\b/,
  /\btummy\b/,
  /\bcolic\b/,
  /\bcongest(?:ion|ed)\b/,
  /\bstuffy nose\b/,
  /\bfever\b/,
  /\bcry(?:ing|s)?\b/,
  /\bfuss(?:y|iness)?\b/,
  /\bwake(?:s|ing)? (?:up )?every\b/,
  /\bwon(?:'?t| will not) (?:sleep|settle|nap)\b/,
  /\bcan(?:not|'?t) (?:get|keep) (?:him|her|them|baby) (?:to )?sleep\b/,
  /\bcluster feed/,
  /\brefus(?:e|ing) (?:to )?(?:eat|feed|nurse|take the bottle)\b/,
  /\bup all night with (?:the )?bab/,
  /\bkeeping me up\b/,
  /\bwaking (?:me|us) (?:up )?all night\b/,
  /\bspit[- ]?up\b/,
  /\bdiaper rash\b/,
  /\bear infection\b/,
  /\bhiccups\b/,
];

function scorePatterns(text, patterns) {
  let score = 0;
  const hits = [];
  for (const pattern of patterns) {
    if (pattern.test(text)) {
      score += 1;
      hits.push(String(pattern));
    }
  }
  return { score, hits };
}

function normalizeStage(stage) {
  const raw = String(stage || '')
    .trim()
    .toLowerCase();
  if (raw === 'hybrid' || raw === 'both') return 'hybrid';
  if (raw === 'postpartum' || raw === 'parenting' || raw === 'toddler') return 'postpartum';
  return 'pregnant';
}

/**
 * @returns {null | {
 *   target: 'baby-oracle' | 'pregnancy-oracle',
 *   title: string,
 *   body: string,
 *   ctaLabel: string,
 *   emoji: string,
 * }}
 */
export function recommendOracleFromJournal({ text = '', stage = 'pregnant' } = {}) {
  const raw = String(text || '')
    .trim()
    .toLowerCase();
  if (raw.length < 10) return null;

  const key = normalizeStage(stage);
  const baby = scorePatterns(raw, BABY_ISSUE_PATTERNS);
  const pregnancy = scorePatterns(raw, PREGNANCY_ORACLE_PATTERNS);

  const babyRec = {
    target: 'baby-oracle',
    emoji: '🔮',
    title: '2 AM Baby Oracle can help',
    body: 'Sounds like a little one is keeping you up. The Baby Oracle has gentle midnight steps for sleep, fussiness, gas, teething, and more.',
    ctaLabel: 'Open 2 AM Baby Oracle →',
  };

  const pregnancyRec = {
    target: 'pregnancy-oracle',
    emoji: '🌙',
    title: '2 AM Pregnancy Oracle can help',
    body: 'When your mind or body won’t settle at night, the Pregnancy Oracle has soft sound, breathing, and stretch rituals made for this hour.',
    ctaLabel: 'Open 2 AM Pregnancy Oracle →',
  };

  if (key === 'postpartum') {
    // Baby-up issues → baby oracle. Mama-only night anxiety can still use pregnancy oracle calm tools
    // only if no baby cues — postpartum lounge primarily exposes baby oracle.
    if (baby.score >= 1) return babyRec;
    if (pregnancy.score >= 2) {
      return {
        ...pregnancyRec,
        body: 'If your own mind won’t quiet after a hard night stretch, the Pregnancy Oracle’s calm sound and breath rituals can still hold you — even postpartum.',
      };
    }
    return null;
  }

  if (key === 'pregnant') {
    if (pregnancy.score >= 1) return pregnancyRec;
    // Pregnant mama writing about baby-in-womb sleep kicks etc. still pregnancy oracle
    if (baby.score >= 1 && /\b(kick|womb|belly|pregnant|pregnancy)\b/.test(raw)) {
      return pregnancyRec;
    }
    return null;
  }

  // Hybrid: prefer the stronger signal; baby issues win ties (more urgent at 2am).
  if (baby.score > 0 && baby.score >= pregnancy.score) return babyRec;
  if (pregnancy.score >= 1) return pregnancyRec;
  return null;
}

export default recommendOracleFromJournal;
