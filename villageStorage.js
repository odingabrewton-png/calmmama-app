import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  ACTIVE_MODES,
  deriveActiveMode,
  HOME_TRACKS,
  normalizeChildren,
  normalizeCurrentPregnancy,
  resolveActiveMode,
} from './mamaJourneyProfile';

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
  const currentPregnancy = normalizeCurrentPregnancy(
    state.currentPregnancy,
    state.weeksPregnant,
    state.dueDate,
  );
  const children = normalizeChildren(state.children, state.babyAge);
  const activeMode =
    state.activeMode ||
    deriveActiveMode({
      currentPregnancy,
      weeksPregnant: state.weeksPregnant,
      dueDate: state.dueDate,
      children,
      babyAge: state.babyAge,
    });
  const homeTrack =
    state.homeTrack === HOME_TRACKS.TODDLER || state.homeTrack === HOME_TRACKS.PREGNANT
      ? state.homeTrack
      : activeMode === ACTIVE_MODES.POSTPARTUM
        ? HOME_TRACKS.TODDLER
        : HOME_TRACKS.PREGNANT;

  return {
    displayName: state.mamaName?.trim() || 'Mama',
    userJourney: state.userJourney,
    weeksPregnant: state.weeksPregnant,
    dueDate: state.dueDate,
    babyAge: state.babyAge,
    currentPregnancy,
    children,
    activeMode,
    homeTrack,
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

  const currentPregnancy = normalizeCurrentPregnancy(
    profile.currentPregnancy,
    profile.weeksPregnant,
    profile.dueDate,
  );
  const children = normalizeChildren(profile.children, profile.babyAge);
  const activeMode = resolveActiveMode({
    ...profile,
    currentPregnancy,
    children,
  });

  if (setters.setCurrentPregnancy) setters.setCurrentPregnancy(currentPregnancy);
  if (setters.setChildren) setters.setChildren(children);
  if (setters.setActiveMode) setters.setActiveMode(activeMode);

  if (profile.homeTrack === HOME_TRACKS.PREGNANT || profile.homeTrack === HOME_TRACKS.TODDLER) {
    setters.setHomeTrack?.(profile.homeTrack);
  } else if (setters.setHomeTrack) {
    setters.setHomeTrack(
      activeMode === ACTIVE_MODES.POSTPARTUM ? HOME_TRACKS.TODDLER : HOME_TRACKS.PREGNANT,
    );
  }

  if (
    profile.userJourney === 'pregnant' ||
    profile.userJourney === 'postpartum' ||
    profile.userJourney === 'hybrid'
  ) {
    setters.setUserJourney(
      profile.userJourney === 'hybrid' ? ACTIVE_MODES.HYBRID : profile.userJourney,
    );
  } else if (setters.setUserJourney) {
    setters.setUserJourney(activeMode);
  }

  if (currentPregnancy?.weeksPregnant != null || profile.weeksPregnant != null) {
    setters.setWeeksPregnant(
      String(currentPregnancy?.weeksPregnant ?? profile.weeksPregnant ?? '24'),
    );
  }
  if (currentPregnancy?.dueDate != null || profile.dueDate != null) {
    setters.setDueDate(String(currentPregnancy?.dueDate ?? profile.dueDate ?? ''));
  }
  const primaryChildAge = children[0]?.ageLabel || profile.babyAge;
  if (primaryChildAge != null) setters.setBabyAge(primaryChildAge);

  if (profile.mamaBirthday != null) setters.setMamaBirthday(profile.mamaBirthday);
  if (profile.approximateCity != null) setters.setApproximateCity(profile.approximateCity);
  if (profile.usState != null) setters.setUsState(profile.usState);
  if (profile.mamaDiscovery != null) setters.setMamaDiscovery(profile.mamaDiscovery);
  if (profile.profilePhotoUri != null) setters.setProfilePhotoUri(profile.profilePhotoUri);
  if (profile.timeCapsuleEntries != null && setters.setTimeCapsuleEntries) {
    setters.setTimeCapsuleEntries(profile.timeCapsuleEntries);
  }
}
