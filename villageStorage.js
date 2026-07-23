import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const STORAGE_KEYS = {
  HAS_COMPLETED_ONBOARDING: 'hasCompletedOnboarding',
  VILLAGE_PROFILE: 'villageProfile',
};

const FOUNDING_GIFTS_KEYS = ['calmmama_founding_gifts_count', 'calmmama_founding_gifts_user_claimed'];

function clearWebLocal(keys) {
  if (Platform.OS !== 'web' || typeof localStorage === 'undefined') return;
  keys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch (_) {
      /* ignore */
    }
  });
}

export async function loadHasCompletedOnboarding() {
  const value = await AsyncStorage.getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
  return value === 'true';
}

export async function setHasCompletedOnboarding(completed) {
  await AsyncStorage.setItem(
    STORAGE_KEYS.HAS_COMPLETED_ONBOARDING,
    completed ? 'true' : 'false'
  );
}

export async function loadVillageProfile() {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.VILLAGE_PROFILE);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveVillageProfile(profile) {
  await AsyncStorage.setItem(STORAGE_KEYS.VILLAGE_PROFILE, JSON.stringify(profile));
}

export async function loadBootState() {
  const [hasCompletedOnboarding, profile] = await Promise.all([
    loadHasCompletedOnboarding(),
    loadVillageProfile(),
  ]);
  return { hasCompletedOnboarding, profile };
}

export async function clearAllVillageStorage() {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.HAS_COMPLETED_ONBOARDING,
    STORAGE_KEYS.VILLAGE_PROFILE,
    'villageRewards',
  ]);
  clearWebLocal(FOUNDING_GIFTS_KEYS);
}

export function buildProfileSnapshot(state) {
  return {
    displayName: state.mamaName?.trim() || 'Mama',
    userJourney: state.userJourney,
    weeksPregnant: state.weeksPregnant,
    dueDate: state.dueDate,
    babyAge: state.babyAge,
    mamaBirthday: state.mamaBirthday,
    approximateCity: state.approximateCity,
    usState: state.usState,
    mamaDiscovery: state.mamaDiscovery,
    profilePhotoUri: state.profilePhotoUri,
    timeCapsuleEntries: state.timeCapsuleEntries ?? {},
  };
}

export function applyProfileSnapshot(profile, setters) {
  if (!profile) return;
  if (profile.displayName) setters.setMamaName(profile.displayName);
  if (profile.userJourney === 'pregnant' || profile.userJourney === 'postpartum') {
    setters.setUserJourney(profile.userJourney);
  }
  if (profile.weeksPregnant != null) setters.setWeeksPregnant(String(profile.weeksPregnant));
  if (profile.dueDate != null) setters.setDueDate(profile.dueDate);
  if (profile.babyAge != null) setters.setBabyAge(profile.babyAge);
  if (profile.mamaBirthday != null) setters.setMamaBirthday(profile.mamaBirthday);
  if (profile.approximateCity != null) setters.setApproximateCity(profile.approximateCity);
  if (profile.usState != null) setters.setUsState(profile.usState);
  if (profile.mamaDiscovery != null) setters.setMamaDiscovery(profile.mamaDiscovery);
  if (profile.profilePhotoUri != null) setters.setProfilePhotoUri(profile.profilePhotoUri);
  if (profile.timeCapsuleEntries != null && setters.setTimeCapsuleEntries) {
    setters.setTimeCapsuleEntries(profile.timeCapsuleEntries);
  }
}
