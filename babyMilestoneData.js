/** Shared milestone tiles — postpartum infant scrapbook (locked stack in postpartumInfantHomeLayoutConfig.js). */

export const MILESTONE_TILES = Object.freeze([
  { id: 'first-smile', emoji: '😊', label: 'First Smile', tint: '#F8E6DE' },
  { id: 'rolling', emoji: '🔄', label: 'Rolling Over', tint: '#E8E0F2' },
  { id: 'sitting', emoji: '🪑', label: 'Sitting Up', tint: '#D8E6F4' },
  { id: 'crawling', emoji: '🐛', label: 'First Crawl', tint: '#F3E4EC' },
  { id: 'first-words', emoji: '💬', label: 'First Words', tint: '#F5DDD0' },
  { id: 'first-steps', emoji: '👣', label: 'First Steps', tint: '#E6ECE6' },
  { id: 'laughing', emoji: '😂', label: 'Belly Laugh', tint: '#F8EDE4' },
  { id: 'solid-food', emoji: '🥣', label: 'First Bite', tint: '#E8E0F2' },
  { id: 'sleep-through', emoji: '🌙', label: 'Longer Sleep', tint: '#D4E8F7' },
]);

export function isMilestoneEntryComplete(entry) {
  if (!entry) return false;
  return Boolean(entry.note?.trim() || entry.photoUri);
}

export function areAllMilestonesComplete(entries) {
  return MILESTONE_TILES.every((tile) => isMilestoneEntryComplete(entries[tile.id]));
}
