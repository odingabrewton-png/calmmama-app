import * as SecureStore from 'expo-secure-store';

const USER_SESSION_TOKEN_KEY = 'user_session_token';
const LOG_PREFIX = '[CalmMama Auth]';

/**
 * Persists the mama's session token in the device keychain / encrypted storage.
 * @param {string} tokenValue
 * @returns {Promise<boolean>} true when saved successfully
 */
export async function saveUserSecureToken(tokenValue) {
  try {
    await SecureStore.setItemAsync(USER_SESSION_TOKEN_KEY, tokenValue);
    return true;
  } catch (error) {
    console.error(`${LOG_PREFIX} saveUserSecureToken failed:`, error?.message ?? error);
    return false;
  }
}

/**
 * Retrieves the mama's session token from secure storage.
 * @returns {Promise<string|null>}
 */
export async function getSecureToken() {
  try {
    const token = await SecureStore.getItemAsync(USER_SESSION_TOKEN_KEY);
    return token ?? null;
  } catch (error) {
    console.error(`${LOG_PREFIX} getSecureToken failed:`, error?.message ?? error);
    return null;
  }
}
