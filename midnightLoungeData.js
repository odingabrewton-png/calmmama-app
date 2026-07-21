export const MIDNIGHT_LOUNGE_POSTS = [
  {
    id: 'p1',
    authorId: 'anya',
    name: 'Anya',
    handle: '@CalmMama_Anya',
    avatarEmoji: '🌸',
    timestamp: '2:14 AM',
    body: "Tossed and turned with baby's first tooth... Who else is up right now in Brooklyn?",
    imageUri: null,
    likes: 24,
    comments: 8,
    liked: false,
  },
  {
    id: 'p2',
    authorId: 'jules',
    name: 'Jules',
    handle: '@JulesAfterDark',
    avatarEmoji: '🌙',
    timestamp: '1:48 AM',
    body: 'Pumping at midnight again. Sending love to every mama awake in the quiet hours — you are not alone.',
    imageUri: null,
    likes: 41,
    comments: 12,
    liked: true,
  },
  {
    id: 'p3',
    authorId: 'mira',
    name: 'Mira',
    handle: '@MiraMoonMama',
    avatarEmoji: '✨',
    timestamp: '12:55 AM',
    body: 'Soft playlist + chamomile. Finally got little one back down. What’s your go-to late-night reset ritual?',
    imageUri:
      'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=800&q=80',
    likes: 18,
    comments: 5,
    liked: false,
  },
  {
    id: 'p4',
    authorId: 'sloane',
    name: 'Sloane',
    handle: '@SloaneVillage',
    avatarEmoji: '🪷',
    timestamp: '12:20 AM',
    body: 'Third wake-up tonight. Reminding myself: seasons change. This one is hard and holy.',
    imageUri: null,
    likes: 56,
    comments: 19,
    liked: false,
  },
];

export const MIDNIGHT_MAMA_PROFILES = {
  anya: {
    id: 'anya',
    name: 'Anya',
    handle: '@CalmMama_Anya',
    avatarEmoji: '🌸',
    location: 'Brooklyn, NY',
    phase: 'Mom of a 7-month-old',
    bio: 'Just a mama finding my balance, trying to pour back into my own cup.',
    following: false,
  },
  jules: {
    id: 'jules',
    name: 'Jules',
    handle: '@JulesAfterDark',
    avatarEmoji: '🌙',
    location: 'Austin, TX',
    phase: 'Mom of a 3-month-old',
    bio: 'Night owl, gentle parent, believer in village energy over perfection.',
    following: true,
  },
  mira: {
    id: 'mira',
    name: 'Mira',
    handle: '@MiraMoonMama',
    avatarEmoji: '✨',
    location: 'Portland, OR',
    phase: 'Mom of a 14-month-old',
    bio: 'Tea, tarot, and toddler snuggles. Here for the real talk after bedtime.',
    following: false,
  },
  sloane: {
    id: 'sloane',
    name: 'Sloane',
    handle: '@SloaneVillage',
    avatarEmoji: '🪷',
    location: 'Chicago, IL',
    phase: 'Mom of twins · 9 months',
    bio: 'Twin mama surviving on grace and group texts. Midnight lounge is my therapy.',
    following: false,
  },
};

export const MIDNIGHT_CHAT_THREADS = [
  {
    id: 't1',
    mamaId: 'anya',
    lastMessage: 'Still up if you want to vent 💜',
    timestamp: '2:18 AM',
    unread: 1,
  },
  {
    id: 't2',
    mamaId: 'jules',
    lastMessage: 'Thank you for the playlist rec!',
    timestamp: 'Yesterday',
    unread: 0,
  },
];

/** Rituals home — journey-specific oracle cards */
export const MIDNIGHT_LOUNGE_FEATURES_PREGNANT = [
  {
    id: 'ml-journal',
    title: 'The Sanctuary Journal',
    vibe: 'A quiet, reflective space to drop your late-night thoughts, wins, and heavy moments.',
    description:
      'A private digital tracking and journaling feature built for the 2 AM fog — unload your mind in the calm.',
  },
  {
    id: 'ml-pregnancy-oracle',
    title: 'The 2 AM Pregnancy Oracle',
    vibe: 'Twilight rituals for restless nights — sound, breath, and village polls.',
    description:
      'Ambient soundscapes, swipeable breathing companions, and live poll questions fired straight to the village feed.',
  },
];

export const MIDNIGHT_LOUNGE_FEATURES_POSTPARTUM = [
  {
    id: 'ml-journal',
    title: 'The Sanctuary Journal',
    vibe: 'A quiet, reflective space to drop your late-night thoughts, wins, and heavy moments.',
    description:
      'A private digital tracking and journaling feature built for the 2 AM fog, helping you log feeds, track sleep, or simply unload your mind.',
  },
  {
    id: 'ml-baby-oracle',
    title: 'The 2 AM Baby Oracle',
    vibe: 'A calm, comforting guide for fussy late-night baby worries.',
    description:
      'Interactive fussy-baby chat with close wellness advice — helping you settle in before rushing to panic.',
  },
];

/** @deprecated Use journey-specific feature lists */
export const MIDNIGHT_LOUNGE_FEATURES = MIDNIGHT_LOUNGE_FEATURES_POSTPARTUM;
