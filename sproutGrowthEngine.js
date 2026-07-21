function isToday(timestamp) {
  if (!timestamp) return false;
  const d = new Date(timestamp);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function countTodayLogs(logs) {
  return (logs || []).filter((log) => isToday(log.timestamp)).length;
}

function countTodayVibes(vibeHistory, selectedVibes) {
  const fromHistory = (vibeHistory || []).filter((v) => isToday(v.timestamp)).length;
  const fromSelected = (selectedVibes || []).length;
  return Math.max(fromHistory, fromSelected);
}

/**
 * Growth score 0–100 from today's self-care + baby care signals.
 */
export function computeSproutGrowth({
  mamaWinsTasks = [],
  postpartumVibeHistory = [],
  selectedPostpartumVibes = [],
  nurseryLogs = [],
  hydrationOz = 0,
  hydrationGoal = 64,
  minutesForMe = 0,
}) {
  const winsTotal = mamaWinsTasks.length || 1;
  const winsDone = mamaWinsTasks.filter((t) => t.done).length;
  const winScore = (winsDone / winsTotal) * 40;

  const vibeScore = Math.min(countTodayVibes(postpartumVibeHistory, selectedPostpartumVibes), 3) * 10;
  const nurseryScore = Math.min(countTodayLogs(nurseryLogs), 4) * 10;

  const hydrationRatio = hydrationGoal > 0 ? Math.min(hydrationOz / hydrationGoal, 1) : 0;
  const hydrationScore = hydrationRatio * 20;

  const minutesScore = Math.min(minutesForMe / 15, 1) * 20;

  const score = Math.round(
    Math.min(100, winScore + vibeScore + nurseryScore + hydrationScore + minutesScore)
  );

  return {
    score,
    winsDone,
    winsTotal,
    vibesToday: countTodayVibes(postpartumVibeHistory, selectedPostpartumVibes),
    logsToday: countTodayLogs(nurseryLogs),
    hydrationRatio,
    minutesForMe,
  };
}

export function getSproutStage(score) {
  if (score < 12) {
    return {
      id: 'seed',
      label: 'Sleeping seed',
      stemH: 0,
      leafCount: 0,
      bloom: false,
      palette: { soil: '#8B7355', stem: '#6B8F5E', leaf: '#9BB896', glow: '#E8D4C0' },
    };
  }
  if (score < 30) {
    return {
      id: 'sprout',
      label: 'First sprout',
      stemH: 28,
      leafCount: 0,
      bloom: false,
      palette: { soil: '#8B7355', stem: '#7BA872', leaf: '#A8C9A0', glow: '#E6ECE6' },
    };
  }
  if (score < 55) {
    return {
      id: 'leaves',
      label: 'Fresh leaves',
      stemH: 52,
      leafCount: 2,
      bloom: false,
      palette: { soil: '#7A6A52', stem: '#6F9E66', leaf: '#8FB888', glow: '#DDE8DD' },
    };
  }
  if (score < 80) {
    return {
      id: 'growing',
      label: 'Growing strong',
      stemH: 72,
      leafCount: 4,
      bloom: false,
      palette: { soil: '#6E5E48', stem: '#5E9160', leaf: '#7BA872', glow: '#C8D8C4' },
    };
  }
  return {
    id: 'bloom',
    label: 'In full bloom',
    stemH: 84,
    leafCount: 5,
    bloom: true,
    palette: { soil: '#6A5A46', stem: '#5A8A58', leaf: '#6F9E66', glow: '#E8C4B8' },
  };
}

export function getSproutNourishHints(metrics) {
  const hints = [];
  if (metrics.winsDone < metrics.winsTotal) {
    hints.push('Complete Mama Wins on Daily to water your sprout');
  }
  if (metrics.vibesToday < 1) {
    hints.push('Log how you feel today — your heart nourishes the garden');
  }
  if (metrics.logsToday < 1) {
    hints.push('Track baby moments in Nursery to help leaves unfurl');
  }
  if (metrics.hydrationRatio < 0.5) {
    hints.push('Hydration Station sips help color bloom in');
  }
  if (metrics.minutesForMe < 5) {
    hints.push('Steal peaceful minutes for yourself — the sprout feels it');
  }
  if (!hints.length) {
    hints.push('You are tending your garden beautifully today, mama');
  }
  return hints.slice(0, 2);
}
