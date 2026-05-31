const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Western tropical zodiac — ordered for boundary checks (Capricorn wraps year-end). */
const ZODIAC_RANGES = [
  { sign: 'Capricorn', emoji: '♑', start: [12, 22], end: [1, 19] },
  { sign: 'Aquarius', emoji: '♒', start: [1, 20], end: [2, 18] },
  { sign: 'Pisces', emoji: '♓', start: [2, 19], end: [3, 20] },
  { sign: 'Aries', emoji: '♈', start: [3, 21], end: [4, 19] },
  { sign: 'Taurus', emoji: '♉', start: [4, 20], end: [5, 20] },
  { sign: 'Gemini', emoji: '♊', start: [5, 21], end: [6, 20] },
  { sign: 'Cancer', emoji: '♋', start: [6, 21], end: [7, 22] },
  { sign: 'Leo', emoji: '♌', start: [7, 23], end: [8, 22] },
  { sign: 'Virgo', emoji: '♍', start: [8, 23], end: [9, 22] },
  { sign: 'Libra', emoji: '♎', start: [9, 23], end: [10, 22] },
  { sign: 'Scorpio', emoji: '♏', start: [10, 23], end: [11, 21] },
  { sign: 'Sagittarius', emoji: '♐', start: [11, 22], end: [12, 21] },
];

function encodeMonthDay(month, day) {
  return month * 100 + day;
}

function isOnOrAfter(month, day, refMonth, refDay) {
  const value = encodeMonthDay(month, day);
  const ref = encodeMonthDay(refMonth, refDay);
  return value >= ref;
}

function isOnOrBefore(month, day, refMonth, refDay) {
  const value = encodeMonthDay(month, day);
  const ref = encodeMonthDay(refMonth, refDay);
  return value <= ref;
}

export function getDaysInMonth(month) {
  if (!month || month < 1 || month > 12) return 31;
  if (month === 2) return 29;
  if ([4, 6, 9, 11].includes(month)) return 30;
  return 31;
}

export function isValidBirthday(birthday) {
  if (!birthday?.month || !birthday?.day) return false;
  const { month, day } = birthday;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > getDaysInMonth(month)) return false;
  return true;
}

export function getZodiacSign(month, day) {
  if (!month || !day) return null;

  for (const range of ZODIAC_RANGES) {
    const [startMonth, startDay] = range.start;
    const [endMonth, endDay] = range.end;

    if (startMonth > endMonth) {
      if (
        isOnOrAfter(month, day, startMonth, startDay) ||
        isOnOrBefore(month, day, endMonth, endDay)
      ) {
        return { sign: range.sign, emoji: range.emoji };
      }
      continue;
    }

    if (
      isOnOrAfter(month, day, startMonth, startDay) &&
      isOnOrBefore(month, day, endMonth, endDay)
    ) {
      return { sign: range.sign, emoji: range.emoji };
    }
  }

  return { sign: 'Capricorn', emoji: '♑' };
}

export function formatBirthdayDisplay(birthday, { short = false } = {}) {
  if (!isValidBirthday(birthday)) return 'Add your birthday';
  const names = short ? MONTH_SHORT : MONTH_NAMES;
  return `${names[birthday.month - 1]} ${birthday.day}`;
}

export function getBirthdayProfileSummary(birthday) {
  if (!isValidBirthday(birthday)) {
    return { dateLabel: 'Tap to add your birthday', zodiac: null };
  }
  return {
    dateLabel: formatBirthdayDisplay(birthday),
    zodiac: getZodiacSign(birthday.month, birthday.day),
  };
}

export function isBirthdayToday(birthday) {
  if (!isValidBirthday(birthday)) return false;
  const now = new Date();
  return now.getMonth() + 1 === birthday.month && now.getDate() === birthday.day;
}

export function clampBirthdayDay(month, day) {
  const maxDay = getDaysInMonth(month);
  return Math.min(Math.max(day, 1), maxDay);
}

export function normalizeBirthday(birthday) {
  if (!birthday?.month || !birthday?.day) return null;
  const month = Math.min(Math.max(parseInt(String(birthday.month), 10), 1), 12);
  const day = clampBirthdayDay(month, parseInt(String(birthday.day), 10));
  return { month, day };
}

export { MONTH_NAMES, MONTH_SHORT };
