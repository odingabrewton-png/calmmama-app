/**
 * Profile photo picker — web file input + canvas compress, native expo-image-picker.
 * Returns a JPEG data URL sized for reliable RN/web Image display + AsyncStorage.
 */

import { Alert, Platform } from 'react-native';

const MAX_EDGE = 720;
const JPEG_QUALITY = 0.82;

function loadImageElement(src) {
  return new Promise((resolve, reject) => {
    const ImgCtor = typeof window !== 'undefined' ? window.Image : null;
    if (!ImgCtor) {
      reject(new Error('Image unavailable'));
      return;
    }
    const img = new ImgCtor();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('decode_failed'));
    img.src = src;
  });
}

async function compressFileToJpegDataUrl(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImageElement(objectUrl);
    const w = img.naturalWidth || img.width || 1;
    const h = img.naturalHeight || img.height || 1;
    const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
    const tw = Math.max(1, Math.round(w * scale));
    const th = Math.max(1, Math.round(h * scale));

    if (typeof document === 'undefined') {
      // Fallback: raw FileReader (may be large / HEIC-unfriendly)
      return await readFileAsDataUrl(file);
    }

    const canvas = document.createElement('canvas');
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext('2d');
    if (!ctx) return await readFileAsDataUrl(file);
    ctx.drawImage(img, 0, 0, tw, th);
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    try {
      URL.revokeObjectURL(objectUrl);
    } catch (_) {
      /* ignore */
    }
  }
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('read_failed'));
    };
    reader.onerror = () => reject(new Error('read_failed'));
    reader.readAsDataURL(file);
  });
}

function pickWebImageFile() {
  return new Promise((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null);
      return;
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      resolve(input.files?.[0] || null);
    };
    // iOS Safari: input must stay in DOM briefly for change to fire reliably
    input.style.position = 'fixed';
    input.style.left = '-9999px';
    document.body.appendChild(input);
    input.addEventListener(
      'change',
      () => {
        setTimeout(() => {
          try {
            document.body.removeChild(input);
          } catch (_) {
            /* ignore */
          }
        }, 0);
      },
      { once: true },
    );
    input.click();
  });
}

async function pickNativeImageUri() {
  const ImagePicker = require('expo-image-picker');
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Photo access', 'Allow photo library access to set your profile picture.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: JPEG_QUALITY,
    base64: true,
  });
  if (result.canceled || !result.assets?.length) return null;
  const asset = result.assets[0];
  if (asset.base64) {
    const mime = asset.mimeType || 'image/jpeg';
    return `data:${mime};base64,${asset.base64}`;
  }
  return asset.uri || null;
}

/**
 * @returns {Promise<string|null>} data URL or local uri suitable for <Image source={{ uri }} />
 */
export async function pickProfilePhotoUri() {
  try {
    if (Platform.OS === 'web') {
      const file = await pickWebImageFile();
      if (!file) return null;
      if (!String(file.type || '').startsWith('image/')) {
        Alert.alert('Photo only', 'Please choose an image file for your profile picture.');
        return null;
      }
      try {
        return await compressFileToJpegDataUrl(file);
      } catch (_) {
        Alert.alert(
          'Upload failed',
          'We could not read that photo. Try a JPG or PNG (some phone formats like HEIC need conversion first).',
        );
        return null;
      }
    }

    return await pickNativeImageUri();
  } catch (_) {
    Alert.alert('Upload failed', 'We could not open the photo picker. Please try again.');
    return null;
  }
}
