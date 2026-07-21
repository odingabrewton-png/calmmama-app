import { Platform } from 'react-native';

const TIME_CAPSULE_DIR = 'time-capsule/';

export function getEntryPhotos(entry) {
  if (!entry) return [];
  if (Array.isArray(entry.photoUris) && entry.photoUris.length > 0) {
    return entry.photoUris.filter(Boolean);
  }
  if (entry.photoUri) return [entry.photoUri];
  return [];
}

export function entryHasContent(entry) {
  if (!entry) return false;
  return Boolean(entry.summary?.trim()) || getEntryPhotos(entry).length > 0;
}

export function normalizeTimeCapsuleEntry(entry) {
  if (!entry || typeof entry !== 'object') return entry;
  const photoUris = getEntryPhotos(entry);
  const { photoUri, ...rest } = entry;
  return photoUris.length ? { ...rest, photoUris } : rest;
}

export function normalizeTimeCapsuleEntries(entries) {
  if (!entries || typeof entries !== 'object') return {};
  return Object.fromEntries(
    Object.entries(entries).map(([monthId, entry]) => [
      monthId,
      normalizeTimeCapsuleEntry(entry),
    ])
  );
}

function getFileExtension(uri) {
  const clean = String(uri || '').split('?')[0];
  const ext = clean.split('.').pop();
  if (!ext || ext.length > 5) return 'jpg';
  return ext.toLowerCase();
}

export async function persistTimeCapsulePhoto(sourceUri) {
  if (!sourceUri) return null;

  if (Platform.OS === 'web') {
    return sourceUri;
  }

  try {
    // Expo SDK 55+: legacy APIs live under expo-file-system/legacy
    const FileSystem = require('expo-file-system/legacy');
    const docDir = FileSystem.documentDirectory;
    if (!docDir) return sourceUri;
    if (String(sourceUri).startsWith(docDir)) return sourceUri;

    const dir = `${docDir}${TIME_CAPSULE_DIR}`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

    const dest = `${dir}${Date.now()}-${Math.random().toString(36).slice(2)}.${getFileExtension(sourceUri)}`;
    await FileSystem.copyAsync({ from: sourceUri, to: dest });
    return dest;
  } catch {
    return sourceUri;
  }
}

export async function persistTimeCapsulePhotos(sourceUris) {
  const uris = Array.isArray(sourceUris) ? sourceUris.filter(Boolean) : [];
  const persisted = await Promise.all(uris.map((uri) => persistTimeCapsulePhoto(uri)));
  return persisted.filter(Boolean);
}
