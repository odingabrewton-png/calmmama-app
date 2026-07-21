/**
 * Mama's Daily Crossword — levelled mini puzzles for pregnant Home.
 */

function hashDateString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/** @typedef {{ id: string, theme: string, size: number, grid: (string|null)[][], words: object[] }} CrosswordPuzzle */

/** @type {{ id: string, label: string, puzzles: CrosswordPuzzle[] }[]} */
export const PREGNANT_HOME_CROSSWORD_LEVELS = Object.freeze([
  {
    id: 'level-1',
    label: 'Level 1 · Gentle Bloom',
    puzzles: [
      {
        id: 'nesting-mode',
        theme: 'Nesting Mode',
        size: 4,
        grid: [
          [null, 'C', 'O', 'Y'],
          ['N', 'A', 'P', null],
          [null, 'R', 'U', 'G'],
          [null, 'B', 'E', 'D'],
        ],
        words: [
          { id: 'w1', direction: 'across', row: 0, col: 1, answer: 'COY', clue: 'Sweetly shy — like easing into your nest' },
          { id: 'w2', direction: 'across', row: 1, col: 0, answer: 'NAP', clue: 'The nesting-hour superpower every mama deserves' },
          { id: 'w3', direction: 'across', row: 2, col: 1, answer: 'RUG', clue: 'A plush landing zone for nursery wiggles' },
          { id: 'w4', direction: 'across', row: 3, col: 1, answer: 'BED', clue: 'Where you recharge your gentle magic' },
          { id: 'w5', direction: 'down', row: 0, col: 1, answer: 'CARB', clue: 'Cozy comfort fuel — toast, oats, and kindness' },
        ],
      },
      {
        id: 'nursery-vibes',
        theme: 'Nursery Vibes',
        size: 4,
        grid: [
          [null, 'B', 'U', 'B'],
          ['N', 'A', 'P', null],
          [null, 'R', 'U', 'G'],
          [null, 'B', 'E', 'D'],
        ],
        words: [
          { id: 'w1', direction: 'across', row: 0, col: 1, answer: 'BUB', clue: 'The sound of joy echoing through the nursery' },
          { id: 'w2', direction: 'across', row: 1, col: 0, answer: 'NAP', clue: 'A hushed pause while the mobile spins' },
          { id: 'w3', direction: 'across', row: 2, col: 1, answer: 'RUG', clue: 'Tummy-time territory on soft woven loops' },
          { id: 'w4', direction: 'across', row: 3, col: 1, answer: 'BED', clue: 'Dreamland HQ for your little sprout' },
          { id: 'w5', direction: 'down', row: 0, col: 1, answer: 'BARB', clue: 'A gentle hook for hanging tiny keepsakes' },
        ],
      },
      {
        id: 'craving-hour',
        theme: 'Craving Hour',
        size: 4,
        grid: [
          [null, 'C', 'O', 'B'],
          ['N', 'A', 'P', null],
          [null, 'R', 'U', 'G'],
          [null, 'B', 'E', 'D'],
        ],
        words: [
          { id: 'w1', direction: 'across', row: 0, col: 1, answer: 'COB', clue: 'Golden comfort — think warm buttered corn' },
          { id: 'w2', direction: 'across', row: 1, col: 0, answer: 'NAP', clue: 'Food coma bliss between snack adventures' },
          { id: 'w3', direction: 'across', row: 2, col: 1, answer: 'RUG', clue: 'Where you picnic with pickles and pillows' },
          { id: 'w4', direction: 'across', row: 3, col: 1, answer: 'BED', clue: 'Midnight snack headquarters, obviously' },
          { id: 'w5', direction: 'down', row: 0, col: 1, answer: 'CARB', clue: 'Cozy fuel when cravings come calling' },
        ],
      },
      {
        id: 'mama-rest',
        theme: 'Mama Rest',
        size: 4,
        grid: [
          [null, 'B', 'O', 'B'],
          ['N', 'A', 'P', null],
          [null, 'R', 'U', 'G'],
          [null, 'B', 'E', 'D'],
        ],
        words: [
          { id: 'w1', direction: 'across', row: 0, col: 1, answer: 'BOB', clue: 'A slow blink that says "I need five minutes"' },
          { id: 'w2', direction: 'across', row: 1, col: 0, answer: 'NAP', clue: 'Sacred stillness while the house is quiet' },
          { id: 'w3', direction: 'across', row: 2, col: 1, answer: 'RUG', clue: 'Barefoot grounding before you sink into rest' },
          { id: 'w4', direction: 'across', row: 3, col: 1, answer: 'BED', clue: 'Your throne of blankets and deserved peace' },
          { id: 'w5', direction: 'down', row: 0, col: 1, answer: 'BARB', clue: 'Soft woven threads that hold your calm' },
        ],
      },
      {
        id: 'baby-steps',
        theme: 'Baby Steps',
        size: 4,
        grid: [
          [null, 'B', 'I', 'B'],
          ['N', 'A', 'P', null],
          [null, 'R', 'U', 'G'],
          [null, 'B', 'E', 'D'],
        ],
        words: [
          { id: 'w1', direction: 'across', row: 0, col: 1, answer: 'BIB', clue: 'Tiny syllable for your almost-here love' },
          { id: 'w2', direction: 'across', row: 1, col: 0, answer: 'NAP', clue: 'Practice rest before the beautiful chaos' },
          { id: 'w3', direction: 'across', row: 2, col: 1, answer: 'RUG', clue: 'First wobbly steps start on something soft' },
          { id: 'w4', direction: 'across', row: 3, col: 1, answer: 'BED', clue: 'Where midnight feedings will soon unfold' },
          { id: 'w5', direction: 'down', row: 0, col: 1, answer: 'BARB', clue: 'Storyteller of lullabies yet to be sung' },
        ],
      },
      {
        id: 'cozy-nest',
        theme: 'Cozy Nest',
        size: 4,
        grid: [
          [null, 'H', 'U', 'G'],
          ['N', 'A', 'P', null],
          [null, 'R', 'U', 'G'],
          [null, 'B', 'E', 'D'],
        ],
        words: [
          { id: 'w1', direction: 'across', row: 0, col: 1, answer: 'HUG', clue: 'The squeeze that says everything without words' },
          { id: 'w2', direction: 'across', row: 1, col: 0, answer: 'NAP', clue: 'Twenty stolen minutes of golden silence' },
          { id: 'w3', direction: 'across', row: 2, col: 1, answer: 'RUG', clue: 'Where bare toes meet morning sunshine' },
          { id: 'w4', direction: 'across', row: 3, col: 1, answer: 'BED', clue: 'Pillow fort headquarters for tired queens' },
          { id: 'w5', direction: 'down', row: 0, col: 1, answer: 'HARB', clue: 'Safe harbor for your tender heart' },
        ],
      },
    ],
  },
  {
    id: 'level-2',
    label: 'Level 2 · Village Path',
    puzzles: [
      {
        id: 'village-warmth',
        theme: 'Village Warmth',
        size: 5,
        grid: [
          [null, 'S', 'O', 'U', 'L'],
          ['P', 'E', 'A', 'C', 'E'],
          [null, 'N', 'E', 'S', 'T'],
          ['M', 'A', 'M', 'A', null],
          [null, 'H', 'U', 'G', null],
        ],
        words: [
          { id: 'w1', direction: 'across', row: 0, col: 1, answer: 'SOUL', clue: 'The quiet center only you can nourish' },
          { id: 'w2', direction: 'across', row: 1, col: 0, answer: 'PEACE', clue: 'What you deserve between every to-do' },
          { id: 'w3', direction: 'across', row: 2, col: 1, answer: 'NEST', clue: 'Where your village gathers around you' },
          { id: 'w4', direction: 'across', row: 3, col: 0, answer: 'MAMA', clue: 'The bravest title you will ever wear' },
          { id: 'w5', direction: 'across', row: 4, col: 1, answer: 'HUG', clue: 'Free medicine from your favorite people' },
          { id: 'w6', direction: 'down', row: 0, col: 1, answer: 'SEN', clue: 'Three letters of gentle wisdom (abbr.)' },
        ],
      },
      {
        id: 'heart-and-home',
        theme: 'Heart & Home',
        size: 5,
        grid: [
          [null, 'B', 'L', 'O', 'O'],
          ['H', 'E', 'A', 'R', 'T'],
          [null, 'M', 'O', 'O', 'N'],
          ['W', 'A', 'R', 'M', null],
          [null, 'J', 'O', 'Y', null],
        ],
        words: [
          { id: 'w1', direction: 'across', row: 0, col: 1, answer: 'BLOO', clue: 'First four letters of your growing miracle' },
          { id: 'w2', direction: 'across', row: 1, col: 0, answer: 'HEART', clue: 'Beating for two with endless courage' },
          { id: 'w3', direction: 'across', row: 2, col: 1, answer: 'MOON', clue: 'Nightlight for late-night cravings' },
          { id: 'w4', direction: 'across', row: 3, col: 0, answer: 'WARM', clue: 'How tea and blankets should always feel' },
          { id: 'w5', direction: 'across', row: 4, col: 1, answer: 'JOY', clue: 'The flutter that rewrites your whole world' },
          { id: 'w6', direction: 'down', row: 0, col: 4, answer: 'OT', clue: 'Two letters of cozy overtime rest' },
        ],
      },
      {
        id: 'bloom-day',
        theme: 'Bloom Day',
        size: 5,
        grid: [
          [null, 'C', 'A', 'L', 'M'],
          ['P', 'E', 'A', 'C', 'E'],
          [null, 'R', 'E', 'S', 'T'],
          ['B', 'L', 'O', 'O', 'M'],
          [null, 'G', 'L', 'O', 'W'],
        ],
        words: [
          { id: 'w1', direction: 'across', row: 0, col: 1, answer: 'CALM', clue: 'Your breath between the busy moments' },
          { id: 'w2', direction: 'across', row: 1, col: 0, answer: 'PEACE', clue: 'Soft exhale when the world feels loud' },
          { id: 'w3', direction: 'across', row: 2, col: 1, answer: 'REST', clue: 'Permission slip you wrote yourself' },
          { id: 'w4', direction: 'across', row: 3, col: 0, answer: 'BLOOM', clue: 'What your body is doing beautifully' },
          { id: 'w5', direction: 'across', row: 4, col: 1, answer: 'GLOW', clue: 'The light everyone says you carry' },
        ],
      },
    ],
  },
  {
    id: 'level-3',
    label: 'Level 3 · Moonlit Nest',
    puzzles: [
      {
        id: 'moonlit-lullaby',
        theme: 'Moonlit Lullaby',
        size: 6,
        grid: [
          ['P', 'E', 'A', 'C', 'E', null],
          [null, null, 'O', null, null, 'T'],
          ['C', 'O', 'C', 'O', 'O', 'N'],
          [null, null, 'O', null, null, 'Y'],
          ['W', 'O', 'M', 'B', null, null],
          [null, 'H', 'U', 'S', 'H', null],
        ],
        words: [
          { id: 'w1', direction: 'across', row: 0, col: 0, answer: 'PEACE', clue: 'What the nursery hums at midnight' },
          { id: 'w2', direction: 'across', row: 2, col: 0, answer: 'COCOON', clue: 'Swaddle-soft wrap for sleepy little ones' },
          { id: 'w3', direction: 'across', row: 4, col: 0, answer: 'WOMB', clue: 'First home your baby ever knew' },
          { id: 'w4', direction: 'across', row: 5, col: 1, answer: 'HUSH', clue: 'The sound that settles tiny hearts' },
        ],
      },
      {
        id: 'sanctuary-night',
        theme: 'Sanctuary Night',
        size: 6,
        grid: [
          [null, 'L', 'U', 'L', 'L', 'A'],
          [null, null, null, null, null, 'B'],
          [null, 'D', 'R', 'E', 'A', 'M'],
          [null, null, 'O', null, null, 'Y'],
          ['S', 'O', 'U', 'L', null, null],
          [null, 'N', 'E', 'S', 'T', null],
        ],
        words: [
          { id: 'w1', direction: 'across', row: 0, col: 1, answer: 'LULLA', clue: 'Opening notes of a bedtime song' },
          { id: 'w2', direction: 'across', row: 2, col: 1, answer: 'DREAM', clue: 'Where you meet your baby before birth' },
          { id: 'w3', direction: 'across', row: 4, col: 0, answer: 'SOUL', clue: 'The part of you growing alongside baby' },
          { id: 'w4', direction: 'across', row: 5, col: 1, answer: 'NEST', clue: 'Pillow fortress of deserved rest' },
        ],
      },
    ],
  },
]);

export function getCrosswordLevel(levelIndex, date = new Date()) {
  const today = date.toDateString();
  const safeIndex = Math.max(0, Math.min(PREGNANT_HOME_CROSSWORD_LEVELS.length - 1, levelIndex));
  const level = PREGNANT_HOME_CROSSWORD_LEVELS[safeIndex];
  const puzzleIndex = hashDateString(`${today}-${level.id}`) % level.puzzles.length;
  const puzzle = level.puzzles[puzzleIndex];

  return {
    today,
    level,
    levelIndex: safeIndex,
    puzzle,
  };
}

export function crosswordCellSize(gridSize) {
  if (gridSize <= 4) return 38;
  if (gridSize === 5) return 34;
  return 30;
}
