/**
 * Constellation network query — state isolation + Village Shield distance fuzzing.
 * Precise coordinates never leave this module; clients receive fuzzy distance text only.
 */

const VILLAGE_SHIELD_OFFSET_MIN_MI = 0.2;
const VILLAGE_SHIELD_OFFSET_MAX_MI = 0.5;
const EARTH_RADIUS_MI = 3958.8;

export const CONSTELLATION_EMPTY_PLACEHOLDER =
  'Your state village is growing! Invite nearby mamas to expand the constellation. ✨';

/** @internal Server-side node store — includes precise coordinates (never sent to clients) */
const CONSTELLATION_NETWORK_NODES = [
  {
    id: 'm1',
    state: 'TX',
    latitude: 30.2841,
    longitude: -97.7341,
    nickname: 'Sage Bloom Mama',
    persona: 'Pregnant · 28 weeks',
    bio: 'First-time mama nesting in the village — love gentle walks and birth-plan chats.',
  },
  {
    id: 'm2',
    state: 'TX',
    latitude: 30.2512,
    longitude: -97.7698,
    nickname: 'Moonlit Nest',
    persona: 'Postpartum · 2 months',
    bio: 'Surviving the fourth trimester with coffee, crocheting, and late-night feeding solidarity.',
  },
  {
    id: 'm3',
    state: 'TX',
    latitude: 30.3018,
    longitude: -97.7155,
    nickname: 'Terracotta Heart',
    persona: 'Pregnant · 32 weeks',
    bio: 'Looking for local mamas who understand heartburn humor and nursery paint indecision.',
  },
  {
    id: 'm4',
    state: 'TX',
    latitude: 30.2389,
    longitude: -97.7522,
    nickname: 'Village Willow',
    persona: 'Postpartum · 6 weeks',
    bio: 'Healing slowly, celebrating tiny wins — happy to swap recovery tips and meal ideas.',
  },
  {
    id: 'mny1',
    state: 'NY',
    latitude: 40.7128,
    longitude: -74.006,
    nickname: 'Brooklyn Nightlight',
    persona: 'Postpartum · 3 months',
    bio: 'Late-night walks and bodega coffee — never visible to mamas outside New York.',
  },
  {
    id: 'mny2',
    state: 'NY',
    latitude: 40.758,
    longitude: -73.9855,
    nickname: 'Hudson Soft Glow',
    persona: 'Pregnant · 30 weeks',
    bio: 'Nesting between subway rides — looking for NYC mamas who get the hustle and the hush.',
  },
  {
    id: 'mca1',
    state: 'CA',
    latitude: 34.0522,
    longitude: -118.2437,
    nickname: 'Golden Hour Mama',
    persona: 'Pregnant · 24 weeks',
    bio: 'Sunset hikes and nursery daydreams — California constellation only.',
  },
  {
    id: 'mca2',
    state: 'CA',
    latitude: 37.7749,
    longitude: -122.4194,
    nickname: 'Foggy Nest',
    persona: 'Postpartum · 8 weeks',
    bio: 'Bay Area mornings, soft playdates, and tea with whoever else is awake at 3am.',
  },
  {
    id: 'mfl1',
    state: 'FL',
    latitude: 28.5383,
    longitude: -81.3792,
    nickname: 'Orange Blossom Mama',
    persona: 'Pregnant · 22 weeks',
    bio: 'Humidity, sunshine, and second-trimester snack opinions welcome.',
  },
  {
    id: 'mfl2',
    state: 'FL',
    latitude: 25.7617,
    longitude: -80.1918,
    nickname: 'Coral Tide Nest',
    persona: 'Postpartum · 4 months',
    bio: 'Beach stroller walks and soft Latin lullabies — Florida village only.',
  },
  {
    id: 'mga1',
    state: 'GA',
    latitude: 33.749,
    longitude: -84.388,
    nickname: 'Peach Grove Mama',
    persona: 'Pregnant · 34 weeks',
    bio: 'Atlanta nesting season — birth-class buddies and porch-swing solidarity wanted.',
  },
  {
    id: 'mco1',
    state: 'CO',
    latitude: 39.7392,
    longitude: -104.9903,
    nickname: 'Alpine Glow Mama',
    persona: 'Postpartum · 10 weeks',
    bio: 'Mountain air, altitude naps, and Denver mamas who understand dry winters.',
  },
  {
    id: 'mil1',
    state: 'IL',
    latitude: 41.8781,
    longitude: -87.6298,
    nickname: 'Lakefront Soft Heart',
    persona: 'Pregnant · 26 weeks',
    bio: 'Chicago winters, warm broth, and village chats over wind-chill humor.',
  },
  {
    id: 'mwa1',
    state: 'WA',
    latitude: 47.6062,
    longitude: -122.3321,
    nickname: 'Evergreen Nest',
    persona: 'Postpartum · 5 months',
    bio: 'Rainy park walks and Seattle coffee that somehow still tastes like survival.',
  },
  {
    id: 'mnc1',
    state: 'NC',
    latitude: 35.2271,
    longitude: -80.8431,
    nickname: 'Dogwood Mama',
    persona: 'Pregnant · 18 weeks',
    bio: 'Charlotte soft landings — looking for local mamas building gentle routines.',
  },
  {
    id: 'moh1',
    state: 'OH',
    latitude: 39.9612,
    longitude: -82.9988,
    nickname: 'Buckeye Bloom',
    persona: 'Postpartum · 7 weeks',
    bio: 'Columbus fourth trimester — meal trains, early bedtimes, and kind check-ins.',
  },
  {
    id: 'mpa1',
    state: 'PA',
    latitude: 39.9526,
    longitude: -75.1652,
    nickname: 'Liberty Soft Nest',
    persona: 'Pregnant · 29 weeks',
    bio: 'Philly sidewalks and soft playdates — Pennsylvania constellation only.',
  },
  {
    id: 'maz1',
    state: 'AZ',
    latitude: 33.4484,
    longitude: -112.074,
    nickname: 'Desert Moon Mama',
    persona: 'Postpartum · 3 months',
    bio: 'Phoenix mornings before the heat — hydration buddies always welcome.',
  },
];

export function normalizeUsState(state) {
  if (!state || typeof state !== 'string') return null;
  const trimmed = state.trim().toUpperCase();
  return trimmed.length === 2 ? trimmed : null;
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

/** Haversine great-circle distance in miles */
export function estimateDistanceMiles(lat1, lon1, lat2, lon2) {
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number'
  ) {
    return null;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MI * c;
}

/** Stable per-node shield offset in [0.2, 0.5] miles — never reveals exact home */
function shieldOffsetMilesForNode(nodeId) {
  let hash = 0;
  const key = String(nodeId || '');
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) % 9973;
  }
  const t = hash / 9973;
  return VILLAGE_SHIELD_OFFSET_MIN_MI + t * (VILLAGE_SHIELD_OFFSET_MAX_MI - VILLAGE_SHIELD_OFFSET_MIN_MI);
}

export function formatShieldedDistanceMiles(rawMiles, nodeId) {
  const base = typeof rawMiles === 'number' && rawMiles >= 0 ? rawMiles : 1;
  const fuzzed = base + shieldOffsetMilesForNode(nodeId);
  const rounded = Math.round(fuzzed * 10) / 10;
  return `${rounded} miles away`;
}

function toClientSafeNode(node, distanceLabel) {
  return {
    id: node.id,
    nickname: node.nickname,
    persona: node.persona,
    bio: node.bio,
    distance: distanceLabel,
  };
}

/**
 * Query constellation nodes for the active user — state-filtered, coordinates stripped.
 * @param {{ state?: string, latitude?: number, longitude?: number }} user
 */
export function fetchConstellationNodesForUser(user) {
  const userState = normalizeUsState(user?.state);
  if (!userState) {
    return { nodes: [], empty: true };
  }

  const userLat = user?.latitude;
  const userLng = user?.longitude;
  const hasUserCoords = typeof userLat === 'number' && typeof userLng === 'number';

  const stateMatches = CONSTELLATION_NETWORK_NODES.filter(
    (node) => normalizeUsState(node.state) === userState
  );

  const nodes = stateMatches.map((node) => {
    const rawMiles = hasUserCoords
      ? estimateDistanceMiles(userLat, userLng, node.latitude, node.longitude)
      : 1.2;
    const distance = formatShieldedDistanceMiles(rawMiles, node.id);
    return toClientSafeNode(node, distance);
  });

  return {
    nodes,
    empty: nodes.length === 0,
  };
}
