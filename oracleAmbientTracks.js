/** Shared ambient track list for pregnancy oracle sound rituals. */
export const ORACLE_AMBIENT_TRACKS = [
  {
    id: 'rain',
    label: '🌧️ Midnight Rain',
    url: require('./assets/audio/midnight-rain.mp3'),
  },
  {
    id: 'ocean',
    label: '🌊 Ocean Drifter',
    url: require('./assets/audio/ocean-drifter.mp3'),
  },
  {
    id: 'woods',
    label: '🌬️ Deep Woods Noise',
    url: require('./assets/audio/deep-woods-noise.mp3'),
  },
];

export function getOracleTrackByLabel(label) {
  return ORACLE_AMBIENT_TRACKS.find((track) => track.label === label) ?? ORACLE_AMBIENT_TRACKS[0];
}

export function getOracleTrackById(id) {
  return ORACLE_AMBIENT_TRACKS.find((track) => track.id === id) ?? ORACLE_AMBIENT_TRACKS[0];
}

/**
 * Normalize a track entry into an expo-audio source (https URL string or require() module id).
 * Returns null when the source is missing or not a valid native audio payload.
 */
export function resolveOracleAudioSource(track) {
  if (!track) return null;

  const raw = track.url ?? track;
  if (typeof raw === 'number') return raw;

  if (typeof raw !== 'string') return null;

  const url = raw.trim();
  if (!url) return null;

  return url;
}

export function getDefaultOracleAudioSource() {
  for (const track of ORACLE_AMBIENT_TRACKS) {
    const source = resolveOracleAudioSource(track);
    if (source != null) return source;
  }
  return null;
}
