import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Platform } from 'react-native';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, preload } from 'expo-audio';
import {
  ORACLE_AMBIENT_TRACKS,
  getOracleTrackByLabel,
  getDefaultOracleAudioSource,
  resolveOracleAudioSource,
} from './oracleAmbientTracks';
import { guardPromise, logNativeCheckpoint, logNativeError } from './nativeRuntimeGuard';

let audioModeReady = false;
let audioPreloadStarted = false;

const DEFAULT_PLAYER_SOURCE = getDefaultOracleAudioSource();

async function ensureOracleAudioMode() {
  if (audioModeReady) return;
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: true,
    interruptionMode: 'mixWithOthers',
  });
  audioModeReady = true;
}

function warnMissingTrackSource(activeLounge) {
  console.warn('[Audio Warning] Missing or invalid audio track URL for lounge:', activeLounge);
}

async function waitForPlayerReady(player, maxMs = 5000) {
  if (player?.isLoaded) return true;
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    if (player?.isLoaded) return true;
    await new Promise((resolve) => setTimeout(resolve, 60));
  }
  return Boolean(player?.isLoaded);
}

function startNativePlayback(player) {
  if (!isOraclePlayerAlive(player)) return false;
  try {
    player.loop = true;
    player.volume = 1;
    player.play();
    return true;
  } catch (error) {
    if (!isNativeSharedObjectNotFoundError(error)) {
      logNativeError('oracleAudio:startNativePlayback', error);
    }
    return false;
  }
}

function isNativeSharedObjectNotFoundError(error) {
  const message = error?.message ?? String(error ?? '');
  return (
    message.includes('NativeSharedObjectNotFoundException') ||
    message.includes('native shared object')
  );
}

/** True when the expo-audio player still has a live native shared object. */
function isOraclePlayerAlive(player) {
  if (player == null || typeof player.pause !== 'function') {
    return false;
  }
  if (Platform.OS === 'web') {
    return true;
  }
  try {
    // Released players throw when any native-backed property is read.
    void player.isLoaded;
    return true;
  } catch (error) {
    return false;
  }
}

function safePauseOraclePlayer(player, label) {
  if (!isOraclePlayerAlive(player)) {
    return;
  }
  try {
    player.pause();
  } catch (error) {
    if (isNativeSharedObjectNotFoundError(error)) {
      return;
    }
    logNativeError(label, error);
  }
}

/** Looping ambient playback for oracle sound pills — uses expo-audio (SDK 55). */
export function useOracleAmbientSound(activeTrackLabel) {
  const source = useMemo(() => {
    const track = getOracleTrackByLabel(activeTrackLabel);
    return resolveOracleAudioSource(track) ?? DEFAULT_PLAYER_SOURCE;
  }, [activeTrackLabel]);

  const player = useAudioPlayer(source);
  const status = useAudioPlayerStatus(player);
  const playerRef = useRef(player);
  playerRef.current = player;
  const isPlayingRef = useRef(false);
  const mountedRef = useRef(true);
  const webAudioRef = useRef(null);

  const playWebFallback = useCallback(async (audioSource) => {
    if (Platform.OS !== 'web' || typeof audioSource !== 'string') return false;
    try {
      if (!webAudioRef.current) {
        webAudioRef.current = new window.Audio();
        webAudioRef.current.loop = true;
      }
      webAudioRef.current.src = audioSource;
      await webAudioRef.current.play();
      return true;
    } catch (error) {
      logNativeError('oracleAudio:webFallback', error);
      return false;
    }
  }, []);

  const pauseWebFallback = useCallback(() => {
    if (Platform.OS === 'web' && webAudioRef.current) {
      webAudioRef.current.pause();
    }
  }, []);

  const playForLabel = useCallback(
    async (label) => {
      if (!mountedRef.current) return false;

      const track = getOracleTrackByLabel(label);
      const audioSource = resolveOracleAudioSource(track);

      if (!track || audioSource == null) {
        warnMissingTrackSource(label);
        isPlayingRef.current = false;
        return false;
      }

      await guardPromise(ensureOracleAudioMode(), 'oracleAudio:setAudioModeBeforePlay');

      try {
        const ready = status.isLoaded || (await waitForPlayerReady(player));
        if (!ready) {
          console.warn('[Audio Warning] Player not loaded yet for lounge:', label);
          if (typeof audioSource === 'string' && (await playWebFallback(audioSource))) {
            return true;
          }
          return false;
        }

        startNativePlayback(player);
        return true;
      } catch (error) {
        logNativeError('oracleAudio:playForLabel', error);
        if (typeof audioSource === 'string' && (await playWebFallback(audioSource))) {
          return true;
        }
        isPlayingRef.current = false;
        return false;
      }
    },
    [playWebFallback, player, status.isLoaded],
  );

  const playFromCurrentSource = useCallback(
    () => playForLabel(activeTrackLabel),
    [activeTrackLabel, playForLabel],
  );

  const pauseTrack = useCallback(() => {
    isPlayingRef.current = false;
    pauseWebFallback();
    safePauseOraclePlayer(playerRef.current, 'oracleAudio:pause');
  }, [pauseWebFallback]);

  useEffect(() => {
    mountedRef.current = true;
    logNativeCheckpoint('useOracleAmbientSound:init', { activeTrackLabel, source });
    guardPromise(ensureOracleAudioMode(), 'oracleAudio:setAudioMode');

    const playerInstance = player;
    if (isOraclePlayerAlive(playerInstance)) {
      try {
        playerInstance.loop = true;
      } catch (error) {
        if (!isNativeSharedObjectNotFoundError(error)) {
          logNativeError('oracleAudio:setLoopOnInit', error);
        }
      }
    }

    return () => {
      mountedRef.current = false;
      isPlayingRef.current = false;
      // useAudioPlayer releases the native object on unmount/source change — only pause if still alive.
      safePauseOraclePlayer(playerInstance, 'oracleAudio:pauseOnUnmount');
      if (Platform.OS === 'web' && webAudioRef.current) {
        webAudioRef.current.pause();
        webAudioRef.current = null;
      }
    };
  }, [player, activeTrackLabel, source]);

  useEffect(() => {
    if (!isPlayingRef.current || !mountedRef.current) return;
    guardPromise(playForLabel(activeTrackLabel), 'oracleAudio:trackChangeAutoplay');
  }, [source, activeTrackLabel, playForLabel]);

  const togglePlayback = useCallback(async () => {
    if (!isPlayingRef.current) {
      isPlayingRef.current = true;
      const started = await playFromCurrentSource();
      if (!started) {
        isPlayingRef.current = false;
        return false;
      }
      return true;
    }

    pauseTrack();
    return false;
  }, [pauseTrack, playFromCurrentSource]);

  return {
    togglePlayback,
  };
}

export function warmOracleAmbientAudio() {
  if (Platform.OS === 'web') return;
  if (audioPreloadStarted) return;
  audioPreloadStarted = true;
  logNativeCheckpoint('warmOracleAmbientAudio:start');
  ORACLE_AMBIENT_TRACKS.forEach((track) => {
    const source = resolveOracleAudioSource(track);
    if (source == null) {
      warnMissingTrackSource(track?.label);
      return;
    }
    guardPromise(preload(source), `oracleAudio:preload:${track.id}`);
  });
}
