/**
 * US states for Village constellation organization + privacy-safe area maps.
 * Exact home pins are never used — maps open to city/state area queries only.
 */

export const US_STATES = Object.freeze([
  { code: 'AL', name: 'Alabama', cityHint: 'Greater Birmingham area', lat: 32.806671, lng: -86.79113 },
  { code: 'AK', name: 'Alaska', cityHint: 'Greater Anchorage area', lat: 61.370716, lng: -152.404419 },
  { code: 'AZ', name: 'Arizona', cityHint: 'Greater Phoenix area', lat: 33.729759, lng: -111.431221 },
  { code: 'AR', name: 'Arkansas', cityHint: 'Greater Little Rock area', lat: 34.969704, lng: -92.373123 },
  { code: 'CA', name: 'California', cityHint: 'Greater Los Angeles area', lat: 36.116203, lng: -119.681564 },
  { code: 'CO', name: 'Colorado', cityHint: 'Greater Denver area', lat: 39.059811, lng: -105.311104 },
  { code: 'CT', name: 'Connecticut', cityHint: 'Greater Hartford area', lat: 41.597782, lng: -72.755371 },
  { code: 'DE', name: 'Delaware', cityHint: 'Greater Wilmington area', lat: 39.318523, lng: -75.507141 },
  { code: 'DC', name: 'Washington, D.C.', cityHint: 'Greater D.C. area', lat: 38.897438, lng: -77.026817 },
  { code: 'FL', name: 'Florida', cityHint: 'Greater Orlando area', lat: 27.766279, lng: -81.686783 },
  { code: 'GA', name: 'Georgia', cityHint: 'Greater Atlanta area', lat: 33.040619, lng: -83.643074 },
  { code: 'HI', name: 'Hawaii', cityHint: 'Greater Honolulu area', lat: 21.094318, lng: -157.498337 },
  { code: 'ID', name: 'Idaho', cityHint: 'Greater Boise area', lat: 44.240459, lng: -114.478828 },
  { code: 'IL', name: 'Illinois', cityHint: 'Greater Chicago area', lat: 40.349457, lng: -88.986137 },
  { code: 'IN', name: 'Indiana', cityHint: 'Greater Indianapolis area', lat: 39.849426, lng: -86.258278 },
  { code: 'IA', name: 'Iowa', cityHint: 'Greater Des Moines area', lat: 42.011539, lng: -93.210526 },
  { code: 'KS', name: 'Kansas', cityHint: 'Greater Wichita area', lat: 38.5266, lng: -96.726486 },
  { code: 'KY', name: 'Kentucky', cityHint: 'Greater Louisville area', lat: 37.66814, lng: -84.670067 },
  { code: 'LA', name: 'Louisiana', cityHint: 'Greater New Orleans area', lat: 31.169546, lng: -91.867805 },
  { code: 'ME', name: 'Maine', cityHint: 'Greater Portland area', lat: 44.693947, lng: -69.381927 },
  { code: 'MD', name: 'Maryland', cityHint: 'Greater Baltimore area', lat: 39.063946, lng: -76.802101 },
  { code: 'MA', name: 'Massachusetts', cityHint: 'Greater Boston area', lat: 42.230171, lng: -71.530106 },
  { code: 'MI', name: 'Michigan', cityHint: 'Greater Detroit area', lat: 43.326618, lng: -84.536095 },
  { code: 'MN', name: 'Minnesota', cityHint: 'Greater Twin Cities area', lat: 45.694454, lng: -93.900192 },
  { code: 'MS', name: 'Mississippi', cityHint: 'Greater Jackson area', lat: 32.741646, lng: -89.678696 },
  { code: 'MO', name: 'Missouri', cityHint: 'Greater St. Louis area', lat: 38.456085, lng: -92.288368 },
  { code: 'MT', name: 'Montana', cityHint: 'Greater Billings area', lat: 46.921925, lng: -110.454353 },
  { code: 'NE', name: 'Nebraska', cityHint: 'Greater Omaha area', lat: 41.12537, lng: -98.268082 },
  { code: 'NV', name: 'Nevada', cityHint: 'Greater Las Vegas area', lat: 38.313515, lng: -117.055374 },
  { code: 'NH', name: 'New Hampshire', cityHint: 'Greater Manchester area', lat: 43.452492, lng: -71.563896 },
  { code: 'NJ', name: 'New Jersey', cityHint: 'Greater Newark area', lat: 40.298904, lng: -74.521011 },
  { code: 'NM', name: 'New Mexico', cityHint: 'Greater Albuquerque area', lat: 34.840515, lng: -106.248482 },
  { code: 'NY', name: 'New York', cityHint: 'Greater New York area', lat: 42.165726, lng: -74.948051 },
  { code: 'NC', name: 'North Carolina', cityHint: 'Greater Charlotte area', lat: 35.630066, lng: -79.806419 },
  { code: 'ND', name: 'North Dakota', cityHint: 'Greater Fargo area', lat: 47.528912, lng: -99.784012 },
  { code: 'OH', name: 'Ohio', cityHint: 'Greater Columbus area', lat: 40.388783, lng: -82.764915 },
  { code: 'OK', name: 'Oklahoma', cityHint: 'Greater Oklahoma City area', lat: 35.565342, lng: -96.928917 },
  { code: 'OR', name: 'Oregon', cityHint: 'Greater Portland area', lat: 44.572021, lng: -122.070938 },
  { code: 'PA', name: 'Pennsylvania', cityHint: 'Greater Philadelphia area', lat: 40.590752, lng: -77.209755 },
  { code: 'RI', name: 'Rhode Island', cityHint: 'Greater Providence area', lat: 41.680893, lng: -71.51178 },
  { code: 'SC', name: 'South Carolina', cityHint: 'Greater Charleston area', lat: 33.856892, lng: -80.945007 },
  { code: 'SD', name: 'South Dakota', cityHint: 'Greater Sioux Falls area', lat: 44.299782, lng: -99.438828 },
  { code: 'TN', name: 'Tennessee', cityHint: 'Greater Nashville area', lat: 35.747845, lng: -86.692345 },
  { code: 'TX', name: 'Texas', cityHint: 'Greater Austin area', lat: 31.054487, lng: -97.563461 },
  { code: 'UT', name: 'Utah', cityHint: 'Greater Salt Lake area', lat: 40.150032, lng: -111.862434 },
  { code: 'VT', name: 'Vermont', cityHint: 'Greater Burlington area', lat: 44.045876, lng: -72.710686 },
  { code: 'VA', name: 'Virginia', cityHint: 'Greater Richmond area', lat: 37.769337, lng: -78.169968 },
  { code: 'WA', name: 'Washington', cityHint: 'Greater Seattle area', lat: 47.400902, lng: -121.490494 },
  { code: 'WV', name: 'West Virginia', cityHint: 'Greater Charleston area', lat: 38.491226, lng: -80.954453 },
  { code: 'WI', name: 'Wisconsin', cityHint: 'Greater Milwaukee area', lat: 44.268543, lng: -89.616508 },
  { code: 'WY', name: 'Wyoming', cityHint: 'Greater Cheyenne area', lat: 42.755966, lng: -107.30249 },
]);

export function getUsStateByCode(code) {
  const normalized = String(code || '').trim().toUpperCase();
  return US_STATES.find((state) => state.code === normalized) || null;
}

export function getUsStateLabel(code) {
  const state = getUsStateByCode(code);
  return state ? `${state.name} (${state.code})` : String(code || '').trim() || 'Choose your state';
}

/** Privacy-safe maps query — city/state area only, never a street address. */
export function buildVillageAreaMapsQuery({ approximateCity, usState } = {}) {
  const state = getUsStateByCode(usState);
  const city = String(approximateCity || '').trim();
  if (city && state) return `${city}, ${state.name}, USA`;
  if (state) return `${state.cityHint}, ${state.name}, USA`;
  if (city) return `${city}, USA`;
  return 'United States';
}

/**
 * Open Apple Maps (iOS) or Google Maps (Android/web) centered on the mama's village area.
 * Village Shield: approximate area only — no precise home pin.
 */
export function getVillageAreaMapsUrl({ approximateCity, usState, preferApple } = {}) {
  const query = encodeURIComponent(buildVillageAreaMapsQuery({ approximateCity, usState }));
  const useApple =
    preferApple === true ||
    (preferApple !== false &&
      typeof navigator !== 'undefined' &&
      /iPhone|iPad|iPod/i.test(navigator.userAgent || ''));
  if (useApple) {
    return `https://maps.apple.com/?q=${query}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function getVillageAreaMapsUrlForPlatform(platformOs, location = {}) {
  const query = encodeURIComponent(buildVillageAreaMapsQuery(location));
  if (platformOs === 'ios') return `http://maps.apple.com/?q=${query}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}
