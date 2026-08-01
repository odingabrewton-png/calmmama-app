/**
 * PREGNANT MAMA HOME — layout + daily word search puzzle sheets.
 * Structural pager edits require explicit "UNLOCK LAYOUT" from the user.
 */

export const PREGNANT_HOME_LAYOUT_LOCKED = true;

export const PREGNANT_HOME_FROSTED_BOXES = Object.freeze([
  'baby-registry',
  'name-oracle',
  'baby-trivia',
  'daily-crossword',
  'daily-word-search',
]);

export const PREGNANT_HOME_LOUNGE_PAGES = Object.freeze([
  {
    id: 'baby',
    title: 'Baby Registry',
    initialProgress: 0,
  },
  {
    id: 'crossword',
    title: 'Daily Mini Crossword',
  },
  {
    id: 'word-search',
    title: "Mama's Daily Word Search",
  },
]);

export const PREGNANT_HOME_LAYOUT = Object.freeze({
  parentHorizontalPad: 20,
  domainBlockMarginBottom: 16,
  pagerDomainMarginBottom: 24,
  scrollFooterPad: 120,
  logoTopInsetExtra: 20,
  logoSectionMarginBottom: 20,
  registryOracleGap: 16,
  oracleTriviaGap: 16,
});

function hashDateString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function createSeededRng(seed) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function pickJumbledFillLetter(rng, row, col, matrix, size) {
  const forbidden = new Set();

  if (col > 0) forbidden.add(matrix[row][col - 1]);
  if (col > 1 && matrix[row][col - 1] === matrix[row][col - 2]) {
    forbidden.add(matrix[row][col - 1]);
  }
  if (row > 0) forbidden.add(matrix[row - 1][col]);
  if (row > 1 && matrix[row - 1][col] === matrix[row - 2][col]) {
    forbidden.add(matrix[row - 1][col]);
  }

  const candidates = ALPHABET.split('').filter((letter) => !forbidden.has(letter));
  const pool = candidates.length ? candidates : ALPHABET.split('');
  return pool[Math.floor(rng() * pool.length)];
}

export function buildJumbledWordSearchGrid(words, size = 10, seed = 0) {
  const matrix = Array.from({ length: size }, () => Array(size).fill(''));
  const locked = new Set();
  const rng = createSeededRng(seed);

  words.forEach((word) => {
    word.cells.forEach(([row, col], index) => {
      matrix[row][col] = word.text[index];
      locked.add(cellKey(row, col));
    });
  });

  const openCells = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!locked.has(cellKey(row, col))) {
        openCells.push([row, col]);
      }
    }
  }

  for (let i = openCells.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [openCells[i], openCells[j]] = [openCells[j], openCells[i]];
  }

  openCells.forEach(([row, col]) => {
    matrix[row][col] = pickJumbledFillLetter(rng, row, col, matrix, size);
  });

  return matrix.map((row) => row.join(''));
}

/** @typedef {{ id: string, label: string, words: { id: string, text: string, cells: [number, number][] }[] }} WordSearchLevel */

/** @type {WordSearchLevel[]} */
export const PREGNANT_HOME_WORD_SEARCH_LEVELS = Object.freeze([
  {
    id: 'level-1',
    label: 'Level 1 · Gentle Bloom',
    words: [
      { id: 'calm', text: 'CALM', cells: [[1, 1], [1, 2], [1, 3], [1, 4]] },
      { id: 'nest', text: 'NEST', cells: [[3, 6], [4, 6], [5, 6], [6, 6]] },
      { id: 'hug', text: 'HUG', cells: [[2, 2], [3, 3], [4, 4]] },
      { id: 'rest', text: 'REST', cells: [[7, 2], [7, 3], [7, 4], [7, 5]] },
      { id: 'tea', text: 'TEA', cells: [[5, 1], [6, 1], [7, 1]] },
      { id: 'glow', text: 'GLOW', cells: [[0, 5], [0, 6], [0, 7], [0, 8]] },
      { id: 'cozy', text: 'COZY', cells: [[8, 6], [8, 7], [8, 8], [8, 9]] },
      { id: 'bump', text: 'BUMP', cells: [[2, 8], [3, 8], [4, 8], [5, 8]] },
    ],
  },
  {
    id: 'level-2',
    label: 'Level 2 · Village Path',
    words: [
      { id: 'peace', text: 'PEACE', cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
      { id: 'warm', text: 'WARM', cells: [[5, 0], [6, 0], [7, 0], [8, 0]] },
      { id: 'soul', text: 'SOUL', cells: [[1, 1], [2, 1], [3, 1], [4, 1]] },
      { id: 'heart', text: 'HEART', cells: [[1, 2], [2, 2], [3, 2], [4, 2], [5, 2]] },
      { id: 'grace', text: 'GRACE', cells: [[2, 5], [3, 5], [4, 5], [5, 5], [6, 5]] },
      { id: 'mama', text: 'MAMA', cells: [[6, 1], [6, 2], [6, 3], [6, 4]] },
      { id: 'snug', text: 'SNUG', cells: [[0, 9], [1, 8], [2, 7], [3, 6]] },
      { id: 'joy', text: 'JOY', cells: [[4, 9], [5, 8], [6, 7]] },
      { id: 'brave', text: 'BRAVE', cells: [[7, 5], [7, 6], [7, 7], [7, 8], [7, 9]] },
      { id: 'bloom', text: 'BLOOM', cells: [[9, 1], [9, 2], [9, 3], [9, 4], [9, 5]] },
    ],
  },
  {
    id: 'level-3',
    label: 'Level 3 · Moonlit Nest',
    words: [
      { id: 'lullaby', text: 'LULLABY', cells: [[0, 0], [1, 1], [2, 2], [3, 3], [4, 4], [5, 5], [6, 6]] },
      { id: 'pillow', text: 'PILLOW', cells: [[0, 9], [1, 8], [2, 7], [3, 6], [4, 5], [5, 4]] },
      { id: 'dream', text: 'DREAM', cells: [[3, 0], [4, 1], [5, 2], [6, 3], [7, 4]] },
      { id: 'womb', text: 'WOMB', cells: [[1, 8], [2, 8], [3, 8], [4, 8]] },
      { id: 'sweet', text: 'SWEET', cells: [[8, 2], [8, 3], [8, 4], [8, 5], [8, 6]] },
      { id: 'moon', text: 'MOON', cells: [[7, 5], [7, 6], [7, 7], [7, 8]] },
      { id: 'hush', text: 'HUSH', cells: [[6, 9], [7, 9], [8, 9], [9, 9]] },
      { id: 'blanket', text: 'BLANKET', cells: [[9, 0], [9, 1], [9, 2], [9, 3], [9, 4], [9, 5], [9, 6]] },
    ],
  },
]);

export function getWordSearchLevel(levelIndex, date = new Date()) {
  const today = date.toDateString();
  const safeIndex = Math.max(0, Math.min(PREGNANT_HOME_WORD_SEARCH_LEVELS.length - 1, levelIndex));
  const level = PREGNANT_HOME_WORD_SEARCH_LEVELS[safeIndex];
  const seed = hashDateString(`${today}-${level.id}`);
  const grid = buildJumbledWordSearchGrid(level.words, 10, seed);

  return {
    today,
    level,
    levelIndex: safeIndex,
    puzzle: {
      id: `${level.id}-${today}`,
      grid,
      words: level.words,
    },
  };
}

export function getCurrentDailyWordSearchPuzzle(date = new Date()) {
  return getWordSearchLevel(0, date);
}

export function cellKey(row, col) {
  return `${row}-${col}`;
}

export function cellsOnLine(start, end) {
  const [r0, c0] = start;
  const [r1, c1] = end;
  const dr = r1 - r0;
  const dc = c1 - c0;
  const steps = Math.max(Math.abs(dr), Math.abs(dc));
  if (steps === 0) return [[r0, c0]];

  const sr = dr === 0 ? 0 : dr / Math.abs(dr);
  const sc = dc === 0 ? 0 : dc / Math.abs(dc);
  if (Math.abs(dr) !== Math.abs(dc) && dr !== 0 && dc !== 0) {
    return null;
  }

  const cells = [];
  for (let i = 0; i <= steps; i += 1) {
    cells.push([r0 + sr * i, c0 + sc * i]);
  }
  return cells;
}

export function readLettersFromCells(grid, cells) {
  return cells.map(([row, col]) => grid[row][col]).join('');
}

export const BABY_TRIVIA_DECK_SIZE = 12;

export const PREGNANT_HOME_BABY_TRIVIA_CARDS = Object.freeze([
  {
    id: 'hearing-20-weeks',
    question:
      'Did you know that at 20 weeks, your baby can hear your voice and your heartbeat?',
    correctAnswer: 'true',
    feedbackTrue:
      'Correct! Talking, reading, or singing to your bump is a beautiful way to start bonding right now.',
    feedbackFalse:
      'Sweet guess — by about 20 weeks, little ears are tuning in. Your voice is already a familiar lullaby.',
  },
  {
    id: 'brain-growth-third-trimester',
    question: 'In the third trimester, a baby\'s brain develops about 250,000 neurons every minute.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! That rapid brain growth is one reason rest and nourishment matter so much for you both.',
    feedbackFalse:
      'Actually true — those tiny neurons are blooming fast. Your body is doing incredible work.',
  },
  {
    id: 'hiccups-in-utero',
    question: 'Babies can get hiccups in the womb, and many mamas feel little rhythmic taps.',
    correctAnswer: 'true',
    feedbackTrue:
      'Right! Those sweet hiccups are a normal sign of developing lungs and diaphragm.',
    feedbackFalse:
      'They really can! Those gentle taps are often baby hiccups — totally normal and adorable.',
  },
  {
    id: 'taste-amniotic-fluid',
    question: 'Babies cannot taste anything until they are born.',
    correctAnswer: 'false',
    feedbackTrue:
      'They can taste through amniotic fluid — flavors from your meals may reach them in the womb.',
    feedbackFalse:
      'Correct! Amniotic fluid carries flavors, so your kitchen adventures may already be shared.',
  },
  {
    id: 'rem-sleep-before-birth',
    question: 'Unborn babies experience REM sleep, which may support early brain development.',
    correctAnswer: 'true',
    feedbackTrue:
      'Exactly — even before birth, little dream cycles may be helping that growing brain.',
    feedbackFalse:
      'They do! REM sleep in the womb is believed to help wire up a developing nervous system.',
  },
  {
    id: 'hair-always-thick',
    question: 'Every baby is born with a full head of thick hair.',
    correctAnswer: 'false',
    feedbackTrue:
      'Hair at birth varies widely — bald, peach fuzz, or a full mane are all perfectly normal.',
    feedbackFalse:
      'Correct! Some babies arrive with lots of hair and some with very little — all beautiful.',
  },
  {
    id: 'recognize-mamas-voice',
    question: 'Newborns often recognize their mama\'s voice right after birth.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! Months of hearing you in the womb can make your voice feel like home on day one.',
    feedbackFalse:
      'They often do — your voice has been their soundtrack long before they meet you.',
  },
  {
    id: 'yawn-in-womb',
    question: 'Ultrasound sometimes catches babies yawning and stretching in the womb.',
    correctAnswer: 'true',
    feedbackTrue:
      'So true — those sleepy little yawns are one of the sweetest sights on an ultrasound.',
    feedbackFalse:
      'They really do! Yawning and stretching are common little womb routines.',
  },
  {
    id: 'bones-fully-formed-birth',
    question: 'A newborn\'s bones are already completely hardened like an adult\'s.',
    correctAnswer: 'false',
    feedbackTrue:
      'Many bones are still soft and flexible at birth — that helps babies travel through and grow safely.',
    feedbackFalse:
      'Right! Soft, flexible bones at birth help protect baby (and you) during delivery.',
  },
  {
    id: 'crying-no-tears-early',
    question: 'Brand-new babies can cry from day one, but real tears may take a few weeks to appear.',
    correctAnswer: 'true',
    feedbackTrue:
      'Correct! Crying comes first; tear ducts often mature a little later — totally normal.',
    feedbackFalse:
      'True — those first cries may be tearless while tear ducts finish developing.',
  },
  {
    id: 'fingerprints-first-trimester',
    question: 'A baby\'s unique fingerprints begin forming during the first trimester.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! Those one-of-a-kind prints are already taking shape early in your journey.',
    feedbackFalse:
      'They really do — tiny fingertips are busy becoming uniquely theirs very early on.',
  },
  {
    id: 'heart-beats-early',
    question: 'A baby\'s heart may start beating around 5 to 6 weeks of pregnancy.',
    correctAnswer: 'true',
    feedbackTrue:
      'Correct! That first flutter of a heartbeat is one of pregnancy\'s earliest miracles.',
    feedbackFalse:
      'It often does — around 5–6 weeks, a tiny heart may already be beating.',
  },
  {
    id: 'lanugo-womb-coating',
    question: 'Some babies are covered in fine downy hair called lanugo before they are born.',
    correctAnswer: 'true',
    feedbackTrue:
      'Right! Lanugo is a soft protective coat that many babies wear in the womb.',
    feedbackFalse:
      'True — that peach-fuzz lanugo is completely normal and often sheds before or after birth.',
  },
  {
    id: 'twins-one-placenta',
    question: 'All twin pregnancies always share a single placenta.',
    correctAnswer: 'false',
    feedbackTrue:
      'Twins can share one placenta or have separate ones — it depends on how they formed.',
    feedbackFalse:
      'Correct! Some twins share a placenta and some do not — both patterns are common.',
  },
  {
    id: 'first-kicks-second-trimester',
    question: 'Many mamas first feel baby kicks during the second trimester.',
    correctAnswer: 'true',
    feedbackTrue:
      'Exactly! Those first flutters often arrive in trimester two — a magical milestone.',
    feedbackFalse:
      'They often do — second trimester is when many mamas first notice those little hello taps.',
  },
  {
    id: 'water-breaks-dramatic',
    question: 'A mama\'s water always breaks in a dramatic gush before labor begins.',
    correctAnswer: 'false',
    feedbackTrue:
      'Only some mamas experience a big gush — others have a slow trickle or labor starts another way.',
    feedbackFalse:
      'Correct! Hollywood makes it look universal, but many labors begin differently.',
  },
  {
    id: 'placenta-nourishes',
    question: 'The placenta helps deliver oxygen and nutrients to baby during pregnancy.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! Your placenta is a remarkable lifeline nourishing you both every day.',
    feedbackFalse:
      'It absolutely does — the placenta is your shared nourishment hub in pregnancy.',
  },
  {
    id: 'cravings-mean-deficiency',
    question: 'Every food craving in pregnancy always means the body is missing that exact nutrient.',
    correctAnswer: 'false',
    feedbackTrue:
      'Cravings are common and complex — they do not always map to a single missing vitamin.',
    feedbackFalse:
      'Correct! Cravings can be hormonal, emotional, or cultural — not always a deficiency clue.',
  },
  {
    id: 'breathing-practice-womb',
    question: 'Babies practice breathing movements in the womb, even while surrounded by fluid.',
    correctAnswer: 'true',
    feedbackTrue:
      'Right! Those practice breaths help tiny lungs and muscles prepare for the outside world.',
    feedbackFalse:
      'They really do — breathing practice in the womb is part of healthy development.',
  },
  {
    id: 'gender-ultrasound-perfect',
    question: 'An early ultrasound gender guess is always 100% accurate.',
    correctAnswer: 'false',
    feedbackTrue:
      'Position, timing, and technique can affect accuracy — surprises still happen!',
    feedbackFalse:
      'Correct! Ultrasounds are helpful but not infallible — keep room for joyful surprises.',
  },
  {
    id: 'vernix-skin-shield',
    question: 'Vernix is a waxy coating that can protect a baby\'s skin in the womb.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! That creamy vernix acts like a gentle shield for delicate skin.',
    feedbackFalse:
      'True — vernix caseosa helps protect and moisturize baby\'s skin before birth.',
  },
  {
    id: 'nesting-instinct',
    question: 'Many mamas feel a nesting instinct as their due date draws closer.',
    correctAnswer: 'true',
    feedbackTrue:
      'So true — that urge to organize and prepare is a well-known late-pregnancy rhythm.',
    feedbackFalse:
      'It\'s very common — nesting can be your heart and home getting ready together.',
  },
  {
    id: 'baby-sleeps-constantly-womb',
    question: 'Unborn babies sleep continuously in the womb and never wake up.',
    correctAnswer: 'false',
    feedbackTrue:
      'Babies cycle through sleep and wakefulness — you may feel more movement when they are alert.',
    feedbackFalse:
      'Correct! Womb life includes active stretches and quieter rest periods throughout the day.',
  },
  {
    id: 'stretch-marks-hereditary',
    question: 'Stretch marks can be influenced by genetics as well as how quickly skin stretches.',
    correctAnswer: 'true',
    feedbackTrue:
      'Exactly — family patterns and rapid growth both play a role, and they are incredibly common.',
    feedbackFalse:
      'True — genetics and skin stretching both matter, and every stripe tells a story of growth.',
  },
  {
    id: 'amniotic-fluid-renews',
    question: 'Amniotic fluid continuously renews throughout pregnancy.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! Fresh fluid keeps cycling — a quiet daily refresh for your little one\'s cozy world.',
    feedbackFalse:
      'It does — amniotic fluid is constantly being replaced all pregnancy long.',
  },
  {
    id: 'due-date-exact',
    question: 'Most babies are born exactly on their estimated due date.',
    correctAnswer: 'false',
    feedbackTrue:
      'A due date is an estimate — only a small share of babies arrive right on that day.',
    feedbackFalse:
      'Correct! Due dates are guides, not guarantees — your baby will choose their own timing.',
  },
  {
    id: 'folic-acid-neural-tube',
    question: 'Folic acid before and during early pregnancy supports healthy neural tube development.',
    correctAnswer: 'true',
    feedbackTrue:
      'Right! Folic acid is a trusted ally in those crucial early weeks of growth.',
    feedbackFalse:
      'True — folic acid is widely recommended to support early brain and spine development.',
  },
  {
    id: 'morning-sickness-only-morning',
    question: '"Morning sickness" only happens in the morning hours.',
    correctAnswer: 'false',
    feedbackTrue:
      'Nausea can strike any time of day — the name is misleading for many mamas.',
    feedbackFalse:
      'Correct! Queasiness can visit morning, afternoon, or night — you are not alone.',
  },
  {
    id: 'umbilical-cord-knot-danger',
    question: 'A knotted umbilical cord always causes serious problems for baby.',
    correctAnswer: 'false',
    feedbackTrue:
      'Many cord knots are harmless — care teams monitor and manage when needed.',
    feedbackFalse:
      'Correct! Knots sound scary but are often harmless thanks to the cord\'s clever design.',
  },
  {
    id: 'thumb-sucking-womb',
    question: 'Some babies suck their thumb or fingers while still in the womb.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! Those sweet ultrasound moments of thumb-sucking are a normal part of practice.',
    feedbackFalse:
      'They really can — many babies discover their thumb long before they meet you.',
  },
  {
    id: 'eye-color-final-birth',
    question: 'A baby\'s eye color is always permanent from the moment they are born.',
    correctAnswer: 'false',
    feedbackTrue:
      'Eye color can shift over the first year as pigment settles — blue may deepen or change.',
    feedbackFalse:
      'Correct! Many babies\' eye color keeps evolving during their first months of life.',
  },
  {
    id: 'belly-size-baby-size',
    question: 'A mama\'s belly size always predicts exactly how big her baby will be.',
    correctAnswer: 'false',
    feedbackTrue:
      'Belly shape depends on so much — baby position, fluid, muscle tone, and genetics.',
    feedbackFalse:
      'Right! A bump tells a story, but it is not a perfect size forecast for baby.',
  },
  {
    id: 'milk-teeth-buds',
    question: 'Babies are born with the buds for all their primary (milk) teeth already formed.',
    correctAnswer: 'true',
    feedbackTrue:
      'Exactly — those tiny tooth buds are tucked in the jaw, waiting for their moment.',
    feedbackFalse:
      'True! Primary teeth begin developing long before you ever see a first little grin.',
  },
  {
    id: 'light-response-third-trimester',
    question: 'In the third trimester, some babies may shift away from bright light on the belly.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! Little eyes can detect light late in pregnancy — a gentle hello from the outside world.',
    feedbackFalse:
      'They may — many babies respond to light in the third trimester with a wiggle or turn.',
  },
  {
    id: 'csection-breastfeeding',
    question: 'Mamas who have a C-section cannot breastfeed their babies.',
    correctAnswer: 'false',
    feedbackTrue:
      'Many C-section mamas breastfeed beautifully — support and positioning make a big difference.',
    feedbackFalse:
      'Correct! A C-section does not close the door to breastfeeding — many mamas nurse successfully.',
  },
  {
    id: 'colostrum-before-milk',
    question: 'Colostrum — a rich early milk — is often produced before mature milk arrives.',
    correctAnswer: 'true',
    feedbackTrue:
      'Right! That golden colostrum is packed with antibodies for baby\'s very first feeds.',
    feedbackFalse:
      'True — colostrum usually comes first, then mature milk follows in the days after birth.',
  },
  {
    id: 'newborn-weight-loss',
    question: 'It is normal for many newborns to lose a little weight in their first days after birth.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes — a small dip is common as baby adjusts; your care team watches the trend with you.',
    feedbackFalse:
      'Correct! A little early weight loss is typical for many babies and usually rebounds with feeding.',
  },
  {
    id: 'fontanelle-soft-spots',
    question: 'Soft spots on a newborn\'s head (fontanelles) are a normal part of development.',
    correctAnswer: 'true',
    feedbackTrue:
      'Exactly — those soft spots allow the head to flex safely during birth and growth.',
    feedbackFalse:
      'They are! Fontanelles are normal, protected by a tough membrane, and close over time.',
  },
  {
    id: 'pacifier-ruins-nursing',
    question: 'Using a pacifier always ruins breastfeeding for every mama and baby.',
    correctAnswer: 'false',
    feedbackTrue:
      'Many families use pacifiers without trouble — timing and latch support matter most.',
    feedbackFalse:
      'Correct! Pacifiers do not automatically derail nursing — every pair finds their own rhythm.',
  },
  {
    id: 'smell-at-birth',
    question: 'Newborns have a strong sense of smell and often recognize their mama\'s scent.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! That powerful little nose helps baby find comfort and nourishment right away.',
    feedbackFalse:
      'They do — scent is one of baby\'s superpowers from the very first hours.',
  },
  {
    id: 'exercise-pregnancy',
    question: 'Most healthy pregnancies can include gentle, provider-approved exercise.',
    correctAnswer: 'true',
    feedbackTrue:
      'Right! Movement tailored to your body can support mood, sleep, and stamina.',
    feedbackFalse:
      'True for many mamas — gentle exercise is often encouraged when your care team agrees.',
  },
  {
    id: 'kick-counts-wellbeing',
    question: 'Tracking baby\'s kicks in later pregnancy can help mamas notice changes in movement.',
    correctAnswer: 'true',
    feedbackTrue:
      'Exactly — knowing your baby\'s usual pattern helps you speak up if something feels different.',
    feedbackFalse:
      'Yes! Kick counts are a simple way to stay tuned in to your little one\'s rhythm.',
  },
  {
    id: 'visible-bump-12-weeks',
    question: 'Every mama shows a visible baby bump by exactly 12 weeks of pregnancy.',
    correctAnswer: 'false',
    feedbackTrue:
      'Bump timing varies widely — first pregnancy, body shape, and position all play a role.',
    feedbackFalse:
      'Correct! Some mamas show early and some later — every bump timeline is beautifully unique.',
  },
  {
    id: 'skin-to-skin-temperature',
    question: 'Skin-to-skin contact can help regulate a newborn\'s body temperature.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! Your chest is a natural incubator — warmth and calm in one embrace.',
    feedbackFalse:
      'It can — skin-to-skin is a powerful way to steady baby\'s temperature and heart rate.',
  },
  {
    id: 'iron-needs-pregnancy',
    question: 'Iron needs often increase during pregnancy to support you and your growing baby.',
    correctAnswer: 'true',
    feedbackTrue:
      'Right! Blood volume rises in pregnancy — iron-rich foods and guidance from your provider help.',
    feedbackFalse:
      'True — many mamas need more iron in pregnancy to support healthy blood and growth.',
  },
  {
    id: 'spicy-food-labor',
    question: 'Eating spicy food always triggers labor to start immediately.',
    correctAnswer: 'false',
    feedbackTrue:
      'Spicy meals may stir digestion, but they are not a guaranteed labor starter for everyone.',
    feedbackFalse:
      'Correct! Spicy food is a fun old tale — baby arrives on their own schedule.',
  },
  {
    id: 'every-contraction-labor',
    question: 'Every tightening or contraction during pregnancy always means labor has begun.',
    correctAnswer: 'false',
    feedbackTrue:
      'Practice contractions (Braxton Hicks) are common — timing, strength, and pattern tell the story.',
    feedbackFalse:
      'Right! Not every tightening is true labor — your care team can help you read the signs.',
  },
  {
    id: 'heartburn-hair-wives-tale',
    question: 'Severe heartburn during pregnancy always means your baby will be born with a full head of hair.',
    correctAnswer: 'false',
    feedbackTrue:
      'A beloved old wives\' tale — heartburn and hair are not a reliable match for every mama.',
    feedbackFalse:
      'Correct! Fun folklore, but heartburn does not predict hair with scientific certainty.',
  },
  {
    id: 'pelvic-floor-helpful',
    question: 'Pelvic floor exercises can support comfort during pregnancy and recovery after birth.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! Gentle pelvic floor work — with proper guidance — can be a steady ally for your body.',
    feedbackFalse:
      'True — many providers recommend pelvic floor care as part of pregnancy and postpartum wellness.',
  },
  {
    id: 'double-birth-weight',
    question: 'Many babies roughly double their birth weight by around five months old.',
    correctAnswer: 'true',
    feedbackTrue:
      'Right! Those growth spurts are remarkable — your nourishment fuels so much change.',
    feedbackFalse:
      'Often true — around five months, many little ones have about doubled their arrival weight.',
  },
  {
    id: 'meconium-first-diaper',
    question: 'A newborn\'s first stool (meconium) is typically dark, sticky, and tar-like.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! That first meconium diaper is a classic milestone — proof the digestive system is waking up.',
    feedbackFalse:
      'Correct! Dark, sticky meconium is completely normal for baby\'s very first bowel movement.',
  },
  {
    id: 'water-intake-swelling',
    question: 'Staying well hydrated during pregnancy can support your body and may ease some swelling.',
    correctAnswer: 'true',
    feedbackTrue:
      'Exactly — good hydration helps your whole system, even when ankles feel puffy.',
    feedbackFalse:
      'True — drinking enough water supports circulation and overall comfort in pregnancy.',
  },
  {
    id: 'babies-cry-language',
    question: 'Crying is a newborn\'s primary way of communicating needs before they can use words.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! Every cry is a little message — hunger, comfort, tired, or just needing you close.',
    feedbackFalse:
      'Right — crying is baby\'s first language, and you are learning to listen together.',
  },
  {
    id: 'gestational-diabetes-manageable',
    question: 'Gestational diabetes can often be managed with monitoring, nutrition, and care team support.',
    correctAnswer: 'true',
    feedbackTrue:
      'Correct — with the right plan, many mamas navigate gestational diabetes safely and confidently.',
    feedbackFalse:
      'True — gestational diabetes is manageable for most mamas with guidance and steady care.',
  },
  {
    id: 'white-noise-womb',
    question: 'White noise can soothe some newborns because it mimics the constant whoosh of the womb.',
    correctAnswer: 'true',
    feedbackTrue:
      'Yes! That gentle shhh can feel like home — a familiar soundtrack from their cozy days inside.',
    feedbackFalse:
      'It often does — womb sounds were baby\'s background music, and white noise can echo that calm.',
  },
  {
    id: 'sleep-on-back-sids',
    question: 'Placing babies on their back to sleep is the recommended safe sleep position.',
    correctAnswer: 'true',
    feedbackTrue:
      'Right! Back-sleeping on a firm, clear surface is the widely recommended safe sleep practice.',
    feedbackFalse:
      'Correct — back sleeping is the standard safe sleep guidance from major health organizations.',
  },
  {
    id: 'postpartum-blues-same',
    question: 'Baby blues and postpartum depression are exactly the same thing with identical symptoms.',
    correctAnswer: 'false',
    feedbackTrue:
      'They are different — baby blues are often short-lived; PPD lasts longer and deserves real support.',
    feedbackFalse:
      'Correct! They are not the same — reach out to your provider if low mood feels heavy or lasting.',
  },
]);

function shuffleIndicesWithSeed(length, seed) {
  const indices = Array.from({ length }, (_, index) => index);
  let state = seed || 1;

  for (let i = length - 1; i > 0; i -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swapIndex = state % (i + 1);
    const current = indices[i];
    indices[i] = indices[swapIndex];
    indices[swapIndex] = current;
  }

  return indices;
}

export function getDailyBabyTriviaDeck(date = new Date()) {
  const today = date.toDateString();
  const pool = PREGNANT_HOME_BABY_TRIVIA_CARDS;
  const deckSize = Math.min(BABY_TRIVIA_DECK_SIZE, pool.length);
  const shuffledIndices = shuffleIndicesWithSeed(
    pool.length,
    hashDateString(`baby-trivia-${today}`),
  );
  const deck = shuffledIndices.slice(0, deckSize).map((index) => pool[index]);
  return { today, deck };
}

export function getDailyBabyTriviaCard(date = new Date()) {
  const { today, deck } = getDailyBabyTriviaDeck(date);
  return { today, card: deck[0] };
}
