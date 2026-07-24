/**
 * Hybrid mama journey helpers — pregnancy + parenting tracks without wiping data.
 */

export const ACTIVE_MODES = Object.freeze({
  PREGNANT: 'pregnant',
  POSTPARTUM: 'postpartum',
  HYBRID: 'hybrid',
});

export const HOME_TRACKS = Object.freeze({
  PREGNANT: 'pregnant',
  TODDLER: 'toddler',
});

export function createChildEntry({ ageLabel = 'Newborn', stage } = {}) {
  const label = String(ageLabel || 'Newborn').trim() || 'Newborn';
  const inferredStage =
    stage ||
    (/year|12-24|toddler/i.test(label) ? 'toddler' : 'infant');
  return {
    id: `child-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ageLabel: label,
    stage: inferredStage,
  };
}

export function hasPregnancyTrack({ currentPregnancy, weeksPregnant, dueDate } = {}) {
  const weeks = String(
    currentPregnancy?.weeksPregnant ?? weeksPregnant ?? '',
  ).trim();
  const due = String(currentPregnancy?.dueDate ?? dueDate ?? '').trim();
  return Boolean(weeks || due);
}

export function hasChildrenTrack({ children, babyAge } = {}) {
  // Prefer explicit children[]; bare babyAge alone is often a leftover default.
  if (Array.isArray(children) && children.length > 0) return true;
  return Boolean(String(babyAge || '').trim());
}

export function deriveActiveMode(input = {}) {
  const pregnant = hasPregnancyTrack(input);
  const parenting = hasChildrenTrack(input);
  if (pregnant && parenting) return ACTIVE_MODES.HYBRID;
  if (pregnant) return ACTIVE_MODES.PREGNANT;
  if (parenting) return ACTIVE_MODES.POSTPARTUM;
  return ACTIVE_MODES.PREGNANT;
}

/**
 * Resolve mama stage from saved profile. Hybrid is opt-in only (onboarding / Me),
 * so leftover weeksPregnant + default babyAge never silently force hybrid.
 */
export function resolveActiveMode(profile = {}) {
  const raw = profile.activeMode || profile.userJourney;
  if (
    raw === ACTIVE_MODES.HYBRID ||
    raw === ACTIVE_MODES.PREGNANT ||
    raw === ACTIVE_MODES.POSTPARTUM
  ) {
    return raw;
  }
  return deriveActiveMode(profile);
}

export function normalizeChildren(raw, fallbackBabyAge) {
  if (Array.isArray(raw) && raw.length) {
    return raw
      .map((child, index) => ({
        id: child?.id || `child-${index}`,
        ageLabel: String(child?.ageLabel || child?.age || fallbackBabyAge || 'Newborn').trim(),
        stage: child?.stage === 'toddler' ? 'toddler' : 'infant',
      }))
      .filter((child) => child.ageLabel);
  }
  if (String(fallbackBabyAge || '').trim()) {
    return [createChildEntry({ ageLabel: fallbackBabyAge })];
  }
  return [];
}

export function normalizeCurrentPregnancy(raw, weeksPregnant, dueDate) {
  const weeks = String(raw?.weeksPregnant ?? weeksPregnant ?? '').trim();
  const due = String(raw?.dueDate ?? dueDate ?? '').trim();
  if (!weeks && !due) return null;
  return {
    weeksPregnant: weeks || '24',
    dueDate: due || '',
  };
}

/** Journey used by existing XOR UI (nav, kitchen, lounge) for the active home track. */
export function getEffectiveUserJourney(activeMode, homeTrack) {
  if (activeMode === ACTIVE_MODES.HYBRID) {
    return homeTrack === HOME_TRACKS.PREGNANT
      ? ACTIVE_MODES.PREGNANT
      : ACTIVE_MODES.POSTPARTUM;
  }
  return activeMode === ACTIVE_MODES.POSTPARTUM
    ? ACTIVE_MODES.POSTPARTUM
    : ACTIVE_MODES.PREGNANT;
}

export function formatPregnancyPillLabel(weeksPregnant) {
  const weeks = String(weeksPregnant || '').replace(/[^\d]/g, '');
  if (weeks) return `🤰 Pregnancy (${weeks}w)`;
  return '🤰 Pregnancy';
}

export function formatToddlerPillLabel(babyAge) {
  const age = String(babyAge || '').trim();
  if (/year|toddler|12-24/i.test(age)) return '🧸 Toddler Mode';
  if (age) return `🧸 Little One (${age})`;
  return '🧸 Toddler Mode';
}

/** Build Soul Sanctuary journey context for Gemini. */
export function buildSanctuaryJourneyContext({
  activeMode,
  currentPregnancy,
  weeksPregnant,
  dueDate,
  children,
  babyAge,
} = {}) {
  const pregnancy = normalizeCurrentPregnancy(currentPregnancy, weeksPregnant, dueDate);
  const kids = normalizeChildren(children, babyAge);
  const mode = activeMode || deriveActiveMode({
    currentPregnancy: pregnancy,
    weeksPregnant,
    dueDate,
    children: kids,
    babyAge,
  });

  if (mode === ACTIVE_MODES.HYBRID && pregnancy && kids.length) {
    const childAges = kids.map((c) => c.ageLabel).join(', ');
    return `She is BOTH pregnant (about ${pregnancy.weeksPregnant || '?'} weeks${pregnancy.dueDate ? `, due ${pregnancy.dueDate}` : ''}) AND parenting a young child (${childAges}). If the user is both pregnant and parenting a toddler, acknowledge the unique physical and emotional weight of growing a baby while caring for a young child in your responses.`;
  }
  if (mode === ACTIVE_MODES.PREGNANT && pregnancy) {
    return `She is pregnant (about ${pregnancy.weeksPregnant || '?'} weeks${pregnancy.dueDate ? `, due ${pregnancy.dueDate}` : ''}).`;
  }
  if (kids.length) {
    return `She is postpartum / parenting (${kids.map((c) => c.ageLabel).join(', ')}).`;
  }
  return '';
}
