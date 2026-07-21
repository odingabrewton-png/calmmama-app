const QUESTION_BANK = [
  {
    id: 'palette',
    prompt: 'Which color palette feels most like your mama energy today?',
    options: [
      { id: 'pastels', label: 'Soft pastels', vibes: ['gentle', 'dreamy'] },
      { id: 'earth', label: 'Earthy sage & clay', vibes: ['grounded', 'natural'] },
      { id: 'jewel', label: 'Bold jewel tones', vibes: ['radiant', 'bold'] },
      { id: 'neutral', label: 'Warm creamy neutrals', vibes: ['calm', 'cozy'] },
    ],
  },
  {
    id: 'escape',
    prompt: 'Your ideal peaceful escape looks like…',
    options: [
      { id: 'hike', label: 'Forest trail hiking', vibes: ['natural', 'adventurous'] },
      { id: 'bake', label: 'Cozy kitchen baking', vibes: ['cozy', 'nurturing'] },
      { id: 'ocean', label: 'Quiet ocean sunrise', vibes: ['dreamy', 'calm'] },
      { id: 'gallery', label: 'Slow art gallery stroll', vibes: ['romantic', 'radiant'] },
    ],
  },
  {
    id: 'ritual',
    prompt: 'What daily ritual grounds you best?',
    options: [
      { id: 'music', label: 'R&B / hip-hop on repeat', vibes: ['bold', 'radiant'] },
      { id: 'breath', label: 'Mindful deep breathing', vibes: ['calm', 'gentle'] },
      { id: 'tea', label: 'Warm tea & journaling', vibes: ['nurturing', 'grounded'] },
      { id: 'dance', label: 'Dancing in the kitchen', vibes: ['adventurous', 'dreamy'] },
    ],
  },
  {
    id: 'season',
    prompt: 'Which season matches your nesting mood?',
    options: [
      { id: 'spring', label: 'Blooming spring light', vibes: ['gentle', 'romantic'] },
      { id: 'summer', label: 'Golden summer ease', vibes: ['radiant', 'adventurous'] },
      { id: 'autumn', label: 'Cozy autumn hush', vibes: ['cozy', 'grounded'] },
      { id: 'winter', label: 'Still winter magic', vibes: ['dreamy', 'calm'] },
    ],
  },
  {
    id: 'texture',
    prompt: 'Pick a texture that soothes your soul:',
    options: [
      { id: 'linen', label: 'Breathable linen', vibes: ['calm', 'natural'] },
      { id: 'velvet', label: 'Plush velvet', vibes: ['romantic', 'cozy'] },
      { id: 'ceramic', label: 'Handmade ceramic', vibes: ['grounded', 'nurturing'] },
      { id: 'silk', label: 'Flowing silk', vibes: ['dreamy', 'radiant'] },
    ],
  },
  {
    id: 'lullaby',
    prompt: 'Which lullaby mood would you hum to your little one?',
    options: [
      { id: 'folk', label: 'Soft acoustic folk', vibes: ['gentle', 'natural'] },
      { id: 'jazz', label: 'Warm midnight jazz', vibes: ['romantic', 'calm'] },
      { id: 'pop', label: 'Upbeat golden-hour pop', vibes: ['radiant', 'adventurous'] },
      { id: 'hush', label: 'Wordless hush tones', vibes: ['dreamy', 'cozy'] },
    ],
  },
  {
    id: 'nursery',
    prompt: 'Your dream nursery corner feels most like…',
    options: [
      { id: 'botanical', label: 'Sunlit botanical nook', vibes: ['natural', 'gentle'] },
      { id: 'storybook', label: 'Storybook reading corner', vibes: ['cozy', 'nurturing'] },
      { id: 'stargazer', label: 'Moon-and-star stargazer nook', vibes: ['dreamy', 'calm'] },
      { id: 'gallery', label: 'Bold color gallery wall', vibes: ['bold', 'radiant'] },
    ],
  },
  {
    id: 'weekend',
    prompt: 'On a slow weekend, you and baby would…',
    options: [
      { id: 'farmers', label: 'Stroll the farmers market', vibes: ['grounded', 'nurturing'] },
      { id: 'park', label: 'Picnic in the park', vibes: ['adventurous', 'radiant'] },
      { id: 'home', label: 'Stay home in matching pajamas', vibes: ['cozy', 'gentle'] },
      { id: 'beach', label: 'Collect shells by the shore', vibes: ['dreamy', 'romantic'] },
    ],
  },
  {
    id: 'scent',
    prompt: 'Which scent feels most like home to you?',
    options: [
      { id: 'lavender', label: 'Lavender & chamomile', vibes: ['calm', 'gentle'] },
      { id: 'vanilla', label: 'Vanilla & warm milk', vibes: ['cozy', 'nurturing'] },
      { id: 'citrus', label: 'Bright citrus & mint', vibes: ['bold', 'radiant'] },
      { id: 'rain', label: 'Petrichor after rain', vibes: ['natural', 'dreamy'] },
    ],
  },
  {
    id: 'story',
    prompt: 'Your favorite bedtime story vibe is…',
    options: [
      { id: 'fairytale', label: 'Classic fairytale magic', vibes: ['romantic', 'dreamy'] },
      { id: 'adventure', label: 'Little explorer adventures', vibes: ['adventurous', 'bold'] },
      { id: 'nature', label: 'Gentle nature tales', vibes: ['natural', 'calm'] },
      { id: 'family', label: 'Sweet family memories', vibes: ['nurturing', 'grounded'] },
    ],
  },
  {
    id: 'flower',
    prompt: 'If your mama heart were a flower, it would be…',
    options: [
      { id: 'peony', label: 'Full peony bloom', vibes: ['romantic', 'radiant'] },
      { id: 'daisy', label: 'Cheerful wild daisy', vibes: ['gentle', 'adventurous'] },
      { id: 'eucalyptus', label: 'Calming eucalyptus', vibes: ['calm', 'grounded'] },
      { id: 'cherry', label: 'Soft cherry blossom', vibes: ['dreamy', 'cozy'] },
    ],
  },
  {
    id: 'moon',
    prompt: 'Tonight’s moon energy that matches you best:',
    options: [
      { id: 'crescent', label: 'Tender crescent glow', vibes: ['gentle', 'calm'] },
      { id: 'full', label: 'Bright full moon courage', vibes: ['bold', 'radiant'] },
      { id: 'gibbous', label: 'Almost-full anticipation', vibes: ['adventurous', 'dreamy'] },
      { id: 'waning', label: 'Quiet waning rest', vibes: ['cozy', 'nurturing'] },
    ],
  },
  {
    id: 'snack',
    prompt: 'Your cozy craving pick for nesting hour:',
    options: [
      { id: 'berries', label: 'Fresh berries & yogurt', vibes: ['natural', 'gentle'] },
      { id: 'soup', label: 'Slow-simmered soup', vibes: ['nurturing', 'grounded'] },
      { id: 'chocolate', label: 'Dark chocolate & tea', vibes: ['romantic', 'cozy'] },
      { id: 'toast', label: 'Avocado toast & sunshine', vibes: ['radiant', 'calm'] },
    ],
  },
  {
    id: 'legacy',
    prompt: 'What quality do you most hope to pass on?',
    options: [
      { id: 'kindness', label: 'Gentle kindness', vibes: ['gentle', 'nurturing'] },
      { id: 'curiosity', label: 'Fearless curiosity', vibes: ['adventurous', 'bold'] },
      { id: 'peace', label: 'Inner peace', vibes: ['calm', 'grounded'] },
      { id: 'wonder', label: 'Wide-eyed wonder', vibes: ['dreamy', 'radiant'] },
    ],
  },
  {
    id: 'constellation',
    prompt: 'Which night-sky story feels like your little one’s arrival?',
    options: [
      { id: 'shooting', label: 'A daring shooting star', vibes: ['adventurous', 'radiant'] },
      { id: 'constellation', label: 'A quiet constellation map', vibes: ['calm', 'dreamy'] },
      { id: 'aurora', label: 'Dancing northern lights', vibes: ['bold', 'radiant'] },
      { id: 'crescent', label: 'A tender crescent path', vibes: ['gentle', 'romantic'] },
    ],
  },
  {
    id: 'mantra',
    prompt: 'What single word would you whisper as your mama mantra?',
    options: [
      { id: 'breathe', label: 'Breathe', vibes: ['calm', 'gentle'] },
      { id: 'rise', label: 'Rise', vibes: ['bold', 'radiant'] },
      { id: 'nest', label: 'Nest', vibes: ['cozy', 'nurturing'] },
      { id: 'wander', label: 'Wander', vibes: ['adventurous', 'dreamy'] },
    ],
  },
  {
    id: 'heirloom',
    prompt: 'An heirloom you’d love to pass down feels like…',
    options: [
      { id: 'quilt', label: 'A hand-stitched quilt', vibes: ['cozy', 'nurturing'] },
      { id: 'locket', label: 'A golden locket', vibes: ['romantic', 'gentle'] },
      { id: 'journal', label: 'A worn family journal', vibes: ['grounded', 'calm'] },
      { id: 'map', label: 'A well-traveled map', vibes: ['adventurous', 'natural'] },
    ],
  },
  {
    id: 'sound',
    prompt: 'The sound that would soothe your baby fastest:',
    options: [
      { id: 'heartbeat', label: 'Your heartbeat close', vibes: ['nurturing', 'calm'] },
      { id: 'rain', label: 'Rain on the window', vibes: ['dreamy', 'cozy'] },
      { id: 'laughter', label: 'Soft family laughter', vibes: ['radiant', 'adventurous'] },
      { id: 'chimes', label: 'Gentle wind chimes', vibes: ['gentle', 'natural'] },
    ],
  },
  {
    id: 'superpower',
    prompt: 'If you could gift your child one superpower, it would be…',
    options: [
      { id: 'empathy', label: 'Endless empathy', vibes: ['gentle', 'nurturing'] },
      { id: 'explore', label: 'Fearless exploration', vibes: ['adventurous', 'bold'] },
      { id: 'stillness', label: 'Unshakable calm', vibes: ['calm', 'grounded'] },
      { id: 'spark', label: 'Creative spark', vibes: ['dreamy', 'radiant'] },
    ],
  },
  {
    id: 'gathering',
    prompt: 'Your dream village gathering looks like…',
    options: [
      { id: 'porch', label: 'Porch supper with neighbors', vibes: ['cozy', 'nurturing'] },
      { id: 'garden', label: 'Sunlit garden party', vibes: ['natural', 'radiant'] },
      { id: 'bonfire', label: 'Bonfire story circle', vibes: ['adventurous', 'romantic'] },
      { id: 'tea', label: 'Quiet tea circle', vibes: ['calm', 'gentle'] },
    ],
  },
  {
    id: 'blanket',
    prompt: 'The blanket you imagine tucking them in with is…',
    options: [
      { id: 'knit', label: 'Hand-knit cream wool', vibes: ['cozy', 'nurturing'] },
      { id: 'floral', label: 'Quilted wild florals', vibes: ['romantic', 'gentle'] },
      { id: 'grey', label: 'Soft weighted grey', vibes: ['calm', 'grounded'] },
      { id: 'patch', label: 'Adventure patchwork', vibes: ['adventurous', 'natural'] },
    ],
  },
  {
    id: 'firstword',
    prompt: 'The first word you imagine hearing from them:',
    options: [
      { id: 'mama', label: '“Mama”', vibes: ['nurturing', 'gentle'] },
      { id: 'wow', label: '“Wow!”', vibes: ['adventurous', 'radiant'] },
      { id: 'moon', label: '“Moon”', vibes: ['dreamy', 'romantic'] },
      { id: 'home', label: '“Home”', vibes: ['cozy', 'grounded'] },
    ],
  },
  {
    id: 'companion',
    prompt: 'A gentle companion for baby’s world would be…',
    options: [
      { id: 'pup', label: 'A loyal adventure pup', vibes: ['adventurous', 'natural'] },
      { id: 'bunny', label: 'A sleepy velvet bunny', vibes: ['gentle', 'cozy'] },
      { id: 'owl', label: 'A wise moonlit owl', vibes: ['calm', 'dreamy'] },
      { id: 'sunbeam', label: 'A golden sunshine pup', vibes: ['radiant', 'nurturing'] },
    ],
  },
  {
    id: 'rhythm',
    prompt: 'Your body’s favorite rhythm right now is…',
    options: [
      { id: 'waltz', label: 'A slow romantic waltz', vibes: ['romantic', 'calm'] },
      { id: 'drum', label: 'A steady heartbeat drum', vibes: ['grounded', 'bold'] },
      { id: 'lullaby', label: 'A floating lullaby', vibes: ['dreamy', 'gentle'] },
      { id: 'salsa', label: 'A kitchen salsa beat', vibes: ['radiant', 'adventurous'] },
    ],
  },
  {
    id: 'path',
    prompt: 'The life path you hope they walk feels like…',
    options: [
      { id: 'woodland', label: 'A woodland trail', vibes: ['natural', 'adventurous'] },
      { id: 'library', label: 'A candlelit library', vibes: ['cozy', 'calm'] },
      { id: 'meadow', label: 'An open sunlit meadow', vibes: ['radiant', 'gentle'] },
      { id: 'shore', label: 'A starlit shoreline', vibes: ['dreamy', 'romantic'] },
    ],
  },
  {
    id: 'blessing',
    prompt: 'The blessing you’d write on their nursery wall:',
    options: [
      { id: 'brave', label: 'May you be brave and kind', vibes: ['bold', 'gentle'] },
      { id: 'rooted', label: 'Rooted in love always', vibes: ['grounded', 'nurturing'] },
      { id: 'dream', label: 'Dream without limits', vibes: ['dreamy', 'adventurous'] },
      { id: 'light', label: 'You are our light', vibes: ['radiant', 'romantic'] },
    ],
  },
  {
    id: 'morning',
    prompt: 'Your ideal slow morning with baby starts with…',
    options: [
      { id: 'sunrise', label: 'Sunrise stretch by the window', vibes: ['radiant', 'calm'] },
      { id: 'pancakes', label: 'Pancakes and giggles', vibes: ['cozy', 'adventurous'] },
      { id: 'walk', label: 'A misty neighborhood walk', vibes: ['natural', 'gentle'] },
      { id: 'music', label: 'Soft music and cuddles', vibes: ['romantic', 'dreamy'] },
    ],
  },
  {
    id: 'keepsake',
    prompt: 'A keepsake you’d tuck in their memory box:',
    options: [
      { id: 'ultrasound', label: 'First ultrasound photo', vibes: ['nurturing', 'gentle'] },
      { id: 'shell', label: 'A shell from a special trip', vibes: ['adventurous', 'natural'] },
      { id: 'poem', label: 'A handwritten poem', vibes: ['romantic', 'dreamy'] },
      { id: 'booties', label: 'Tiny knitted booties', vibes: ['cozy', 'grounded'] },
    ],
  },
  {
    id: 'element',
    prompt: 'Which element mirrors your mama spirit today?',
    options: [
      { id: 'earth', label: 'Earth — steady and rooted', vibes: ['grounded', 'natural'] },
      { id: 'water', label: 'Water — flowing and soft', vibes: ['calm', 'dreamy'] },
      { id: 'fire', label: 'Fire — warm and bright', vibes: ['bold', 'radiant'] },
      { id: 'air', label: 'Air — light and free', vibes: ['gentle', 'adventurous'] },
    ],
  },
];

const NAME_REVEALS = [
  {
    key: 'gentle-dreamy',
    vibes: ['gentle', 'dreamy'],
    boys: [
      { name: 'Milo', meaning: 'Soldier of calm — soft strength for a peaceful soul.' },
      { name: 'Ezra', meaning: 'Helper of light — quiet courage with poetic grace.' },
      { name: 'Jude', meaning: 'Praised heart — tender devotion in a small frame.' },
    ],
    girls: [
      { name: 'Aria', meaning: 'A melody of air — light, lyrical, and luminous.' },
      { name: 'Wren', meaning: 'Small songbird — bright spirit in a gentle body.' },
      { name: 'Elara', meaning: 'Starlight shine — dreamy poise with quiet magic.' },
    ],
  },
  {
    key: 'natural-grounded',
    vibes: ['natural', 'grounded'],
    boys: [
      { name: 'Rowan', meaning: 'Little red protector — rooted like a mountain tree.' },
      { name: 'Asher', meaning: 'Happy blessing — steady joy like morning forest light.' },
      { name: 'River', meaning: 'Ever-flowing path — calm strength that keeps moving.' },
    ],
    girls: [
      { name: 'Isla', meaning: 'River island — serene, steady, and beautifully wild.' },
      { name: 'Sage', meaning: 'Wise herb — earthy calm with healing presence.' },
      { name: 'Willow', meaning: 'Graceful bend — resilient beauty that sways with life.' },
    ],
  },
  {
    key: 'cozy-nurturing',
    vibes: ['cozy', 'nurturing'],
    boys: [
      { name: 'Theo', meaning: 'Gift of warmth — a hearth-light kind of love.' },
      { name: 'Henry', meaning: 'Home ruler — classic comfort with steady devotion.' },
      { name: 'Caleb', meaning: 'Whole-hearted — faithful warmth you can feel.' },
    ],
    girls: [
      { name: 'Nora', meaning: 'Honored light — tender glow for a cherished heart.' },
      { name: 'Hazel', meaning: 'Wise protector — soft eyes and a nurturing soul.' },
      { name: 'Amara', meaning: 'Eternal grace — love that wraps like a favorite blanket.' },
    ],
  },
  {
    key: 'bold-radiant',
    vibes: ['bold', 'radiant'],
    boys: [
      { name: 'Kai', meaning: 'Ocean warrior — bold tide, bright horizon.' },
      { name: 'Phoenix', meaning: 'Reborn fire — fearless rise with golden courage.' },
      { name: 'Zion', meaning: 'Highest peak — luminous strength and proud spirit.' },
    ],
    girls: [
      { name: 'Zara', meaning: 'Blooming princess — fierce bloom with golden poise.' },
      { name: 'Aurora', meaning: 'Dawn light — radiant arrival with sky-bright hope.' },
      { name: 'Ember', meaning: 'Glowing coal — warm fire with fearless sparkle.' },
    ],
  },
  {
    key: 'calm-romantic',
    vibes: ['calm', 'romantic'],
    boys: [
      { name: 'Leo', meaning: 'Lion-hearted — brave warmth wrapped in gentleness.' },
      { name: 'Julian', meaning: 'Youthful sky — poetic calm with timeless charm.' },
      { name: 'Ellis', meaning: 'Benevolent light — soft devotion with steady poise.' },
    ],
    girls: [
      { name: 'Luna', meaning: 'Moonlit grace — quiet magic that lights the night.' },
      { name: 'Stella', meaning: 'Little star — romantic glow with peaceful shine.' },
      { name: 'Violet', meaning: 'Modest bloom — vintage sweetness with calm depth.' },
    ],
  },
  {
    key: 'adventurous-dreamy',
    vibes: ['adventurous', 'dreamy'],
    boys: [
      { name: 'Atlas', meaning: 'World bearer — curious spirit, endless wonder.' },
      { name: 'Orion', meaning: 'Hunter of stars — bold wonder written in the sky.' },
      { name: 'Felix', meaning: 'Happy fortune — lucky explorer with bright joy.' },
    ],
    girls: [
      { name: 'Nova', meaning: 'New star — sparkling path for a bright adventurer.' },
      { name: 'Skye', meaning: 'Open horizon — free spirit with cloud-soft courage.' },
      { name: 'Lyra', meaning: 'Constellation harp — dreamy music in midnight air.' },
    ],
  },
  {
    key: 'romantic-cozy',
    vibes: ['romantic', 'cozy'],
    boys: [
      { name: 'Elliot', meaning: 'Heaven-bound — poetic heart, soft courage.' },
      { name: 'August', meaning: 'Revered warmth — golden-month ease and charm.' },
      { name: 'Owen', meaning: 'Young warrior — gentle protector with noble heart.' },
    ],
    girls: [
      { name: 'Clara', meaning: 'Clear and bright — classic charm with gentle fire.' },
      { name: 'Rose', meaning: 'Beloved bloom — timeless romance in a soft petal.' },
      { name: 'Maeve', meaning: 'She who intoxicates — mythic warmth with cozy spell.' },
    ],
  },
  {
    key: 'grounded-calm',
    vibes: ['grounded', 'calm'],
    boys: [
      { name: 'Silas', meaning: 'Of the forest — steady roots, peaceful presence.' },
      { name: 'Bennett', meaning: 'Blessed little one — anchored kindness and calm.' },
      { name: 'Dean', meaning: 'Valley keeper — quiet strength with humble grace.' },
    ],
    girls: [
      { name: 'Ivy', meaning: 'Evergreen vine — resilient beauty that keeps growing.' },
      { name: 'Pearl', meaning: 'Hidden gem — calm luster formed through patience.' },
      { name: 'Ada', meaning: 'Noble spirit — simple poise with grounded wisdom.' },
    ],
  },
  {
    key: 'gentle-nurturing',
    vibes: ['gentle', 'nurturing'],
    boys: [
      { name: 'Noah', meaning: 'Rest and comfort — safe harbor for a tender heart.' },
      { name: 'Luca', meaning: 'Bringer of light — soft glow with devoted care.' },
      { name: 'Amir', meaning: 'Prince of peace — gentle royalty with warm strength.' },
    ],
    girls: [
      { name: 'Lily', meaning: 'Pure bloom — delicate grace with nurturing calm.' },
      { name: 'Naomi', meaning: 'Pleasant one — beloved warmth that feels like home.' },
      { name: 'Elena', meaning: 'Shining light — tender radiance with steady love.' },
    ],
  },
  {
    key: 'natural-adventurous',
    vibes: ['natural', 'adventurous'],
    boys: [
      { name: 'Finn', meaning: 'Fair wanderer — wild curiosity with open skies.' },
      { name: 'Archer', meaning: 'Bow bearer — focused aim with explorer spirit.' },
      { name: 'Cedar', meaning: 'Evergreen sentinel — rooted wildness and tall courage.' },
    ],
    girls: [
      { name: 'Juniper', meaning: 'Wild evergreen — fresh spirit with forest freedom.' },
      { name: 'Sienna', meaning: 'Earthy red clay — warm adventure in natural hues.' },
      { name: 'Marlowe', meaning: 'Driftwood shore — literary wander with soft edge.' },
    ],
  },
  {
    key: 'bold-cozy',
    vibes: ['bold', 'cozy'],
    boys: [
      { name: 'Miles', meaning: 'Soldier of mercy — brave heart with homebody warmth.' },
      { name: 'Knox', meaning: 'Round hill — sturdy confidence with snug comfort.' },
      { name: 'Jasper', meaning: 'Treasure keeper — bold gem with hearth-side calm.' },
    ],
    girls: [
      { name: 'Ruby', meaning: 'Precious stone — fiery glow wrapped in cozy love.' },
      { name: 'Harlow', meaning: 'Army hill — confident charm with soft landing.' },
      { name: 'Sloane', meaning: 'Warrior poise — sleek strength with intimate warmth.' },
    ],
  },
  {
    key: 'radiant-dreamy',
    vibes: ['radiant', 'dreamy'],
    boys: [
      { name: 'Sol', meaning: 'Sun bearer — bright center with dreamy horizon.' },
      { name: 'Caspian', meaning: 'Sea wanderer — luminous depth with far-off wonder.' },
      { name: 'Arlo', meaning: 'Fortified hill — golden ease with starlit imagination.' },
    ],
    girls: [
      { name: 'Celeste', meaning: 'Heavenly one — sky-bright grace with soft wonder.' },
      { name: 'Iris', meaning: 'Rainbow messenger — colorful light with dreamy hush.' },
      { name: 'Seren', meaning: 'Star shine — Welsh calm with radiant glow.' },
    ],
  },
];

const RECENT_QUESTION_WINDOW = 12;
const RECENT_NAME_WINDOW = 8;
const DEFAULT_ORACLE_QUESTION_COUNT = 5;

const recentQuestionIds = [];
const recentNameKeys = [];

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function rememberQuestionIds(questions) {
  questions.forEach((question) => {
    recentQuestionIds.push(question.id);
    while (recentQuestionIds.length > RECENT_QUESTION_WINDOW) {
      recentQuestionIds.shift();
    }
  });
}

function pickFromNamePool(pool, revealKey, gender) {
  const tagged = pool.map((entry, index) => ({
    entry,
    tag: `${revealKey}:${gender}:${index}`,
  }));
  const fresh = tagged.filter(({ tag }) => !recentNameKeys.includes(tag));
  const candidates = fresh.length ? fresh : tagged;
  const pick = candidates[Math.floor(Math.random() * candidates.length)];
  recentNameKeys.push(pick.tag);
  while (recentNameKeys.length > RECENT_NAME_WINDOW) {
    recentNameKeys.shift();
  }
  return pick.entry;
}

export function pickOracleQuestions(count = DEFAULT_ORACLE_QUESTION_COUNT) {
  const freshPool = QUESTION_BANK.filter((question) => !recentQuestionIds.includes(question.id));
  const pool = freshPool.length >= count ? freshPool : QUESTION_BANK;
  const picked = shuffle(pool).slice(0, count);
  rememberQuestionIds(picked);
  return picked;
}

export const ORACLE_QUESTION_COUNT = DEFAULT_ORACLE_QUESTION_COUNT;

function scoreVibes(answers) {
  const scores = {};
  answers.forEach((option) => {
    option.vibes.forEach((vibe) => {
      scores[vibe] = (scores[vibe] || 0) + 1;
    });
  });
  return scores;
}

function revealMatchScore(revealVibes, scores) {
  return revealVibes.reduce((sum, vibe) => sum + (scores[vibe] || 0), 0);
}

export function computeNameReveal(answers) {
  const scores = scoreVibes(answers);
  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const topVibes = ranked.slice(0, 2).map(([vibe]) => vibe);

  let best = NAME_REVEALS[0];
  let bestScore = -1;
  const tied = [];

  NAME_REVEALS.forEach((reveal) => {
    const match = revealMatchScore(reveal.vibes, scores);
    if (match > bestScore) {
      bestScore = match;
      tied.length = 0;
      tied.push(reveal);
    } else if (match === bestScore && match > 0) {
      tied.push(reveal);
    }
  });

  if (tied.length > 1) {
    const answerSeed = answers.map((option) => option.id).join('-');
    const tieIndex =
      answerSeed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % tied.length;
    best = tied[tieIndex];
  } else if (tied.length === 1) {
    best = tied[0];
  }

  if (bestScore === 0) {
    const answerSeed = answers.map((option) => option.id).join('-');
    const fallbackIndex =
      answerSeed.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % NAME_REVEALS.length;
    best = NAME_REVEALS[fallbackIndex];
  }

  const boy = pickFromNamePool(best.boys, best.key, 'boy');
  const girl = pickFromNamePool(best.girls, best.key, 'girl');

  return {
    boy,
    girl,
    vibeSignature: topVibes.length ? topVibes.join(' · ') : best.key.replace('-', ' · '),
  };
}
