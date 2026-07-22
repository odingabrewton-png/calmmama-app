import React, { memo, useEffect, useRef } from 'react';
import {
  Animated,
  AppState,
  Easing,
  StyleSheet,
  View,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import {
  getWeeklyBabyVideoSource,
  resolveBabyGrowthWeek,
} from './modularBabyGrowthConfig';

/** Source clips are 1280×720 — keep the frame matched so cover doesn't pillarbox. */
const VIDEO_ASPECT = 16 / 9;
const FRAME_FILL = '#E8C4B8';
const WEEK_FADE_MS = 420;
/** Slight overscan crops baked-in black letterbox edges in the source renders. */
const BORDER_CROP_SCALE = 1.14;
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

function playMutedLoop(player) {
  if (!player) return;
  try {
    player.loop = true;
    player.muted = true;
    player.volume = 0;
    player.play();
  } catch (_) {
    /* ignore */
  }
}

function pauseMuted(player) {
  if (!player) return;
  try {
    player.loop = true;
    player.muted = true;
    player.volume = 0;
    player.pause();
  } catch (_) {
    /* ignore */
  }
}

async function replaceSource(player, source) {
  if (!player || source == null) return;
  if (typeof player.replaceAsync === 'function') {
    await player.replaceAsync(source);
    return;
  }
  if (typeof player.replace === 'function') {
    player.replace(source);
  }
}

function waitForReady(player, timeoutMs = 6000) {
  return new Promise((resolve) => {
    if (!player) {
      resolve(false);
      return;
    }
    if (player.status === 'readyToPlay') {
      resolve(true);
      return;
    }

    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try {
        sub?.remove?.();
      } catch (_) {
        /* ignore */
      }
      resolve(ok);
    };

    const sub = player.addListener?.('statusChange', ({ status }) => {
      if (status === 'readyToPlay') finish(true);
      if (status === 'error') finish(false);
    });
    const timer = setTimeout(() => finish(player.status === 'readyToPlay'), timeoutMs);
  });
}

/**
 * Dual sticky blooming-body players with fixed VideoViews.
 *
 * Slot A/B never remount — only opacities and sources change. The outgoing clip
 * stays painted until the next week is ready, then we dissolve over it.
 */
function ModularBabyGrowth({ currentWeek = 20, embedded = false, isActive = true }) {
  const { width: windowW } = useWindowDimensions();
  const displayWeek = resolveBabyGrowthWeek(currentWeek);
  const { week: videoWeek, source: babySource } = getWeeklyBabyVideoSource(displayWeek);

  const frameW = Math.min(Math.max(windowW - (embedded ? 64 : 48), 200), embedded ? 360 : 420);
  const frameH = Math.round(frameW / VIDEO_ASPECT);

  const bootSource = useRef(babySource).current;
  const playerA = useVideoPlayer(bootSource, pauseMuted);
  const playerB = useVideoPlayer(null, pauseMuted);

  const frontSlotRef = useRef(0); // 0 = A visible, 1 = B visible
  const loadedWeekRef = useRef(videoWeek);
  const swappingRef = useRef(false);
  const opacityA = useRef(new Animated.Value(1)).current;
  const opacityB = useRef(new Animated.Value(0)).current;

  // Play only the front slot while Bloom is active.
  useEffect(() => {
    const kick = () => {
      const front = frontSlotRef.current === 0 ? playerA : playerB;
      const back = frontSlotRef.current === 0 ? playerB : playerA;
      if (isActive) {
        playMutedLoop(front);
        pauseMuted(back);
      } else {
        pauseMuted(playerA);
        pauseMuted(playerB);
      }
    };

    kick();
    if (!isActive) return undefined;

    const t1 = setTimeout(kick, 50);
    const t2 = setTimeout(kick, 200);
    const t3 = setTimeout(kick, 500);

    const onAppState = (state) => {
      if (state === 'active') kick();
      else {
        pauseMuted(playerA);
        pauseMuted(playerB);
      }
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      sub.remove();
      pauseMuted(playerA);
      pauseMuted(playerB);
    };
  }, [isActive, playerA, playerB]);

  // Soft dual-slot crossfade when the resolved video week changes.
  useEffect(() => {
    if (videoWeek === loadedWeekRef.current) return undefined;
    if (swappingRef.current) return undefined;

    let cancelled = false;
    swappingRef.current = true;

    const run = async () => {
      const outgoingSlot = frontSlotRef.current;
      const incomingSlot = 1 - outgoingSlot;
      const outgoing = outgoingSlot === 0 ? playerA : playerB;
      const incoming = incomingSlot === 0 ? playerA : playerB;
      const incomingOpacity = incomingSlot === 0 ? opacityA : opacityB;
      const outgoingOpacity = outgoingSlot === 0 ? opacityA : opacityB;

      try {
        await replaceSource(incoming, babySource);
        if (cancelled) return;

        const ready = await waitForReady(incoming);
        if (cancelled) return;
        if (!ready) {
          swappingRef.current = false;
          return;
        }

        if (isActive) playMutedLoop(incoming);

        await new Promise((resolve) => {
          Animated.parallel([
            Animated.timing(incomingOpacity, {
              toValue: 1,
              duration: WEEK_FADE_MS,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
            Animated.timing(outgoingOpacity, {
              toValue: 0,
              duration: WEEK_FADE_MS,
              easing: Easing.inOut(Easing.cubic),
              useNativeDriver: USE_NATIVE_DRIVER,
            }),
          ]).start(({ finished }) => resolve(finished));
        });

        if (cancelled) return;

        pauseMuted(outgoing);
        frontSlotRef.current = incomingSlot;
        loadedWeekRef.current = videoWeek;
      } catch (_) {
        /* keep prior frame */
      } finally {
        swappingRef.current = false;
      }
    };

    run();
    return () => {
      cancelled = true;
      swappingRef.current = false;
    };
  }, [videoWeek, babySource, isActive, playerA, playerB, opacityA, opacityB]);

  const videoProps = {
    style: styles.babyVideo,
    nativeControls: false,
    contentFit: 'cover',
    allowsFullscreen: false,
    playsInline: true,
    useExoShutter: false,
    ...(Platform.OS === 'android' ? { surfaceType: 'textureView' } : {}),
  };

  return (
    <View
      style={[
        styles.mainContainer,
        { width: frameW, height: frameH },
        embedded && styles.mainContainerEmbedded,
      ]}
      collapsable={false}
    >
      {isActive ? (
        <View style={styles.videoClip} pointerEvents="none" collapsable={false}>
          <View style={styles.videoScale}>
            <Animated.View style={[styles.slot, { opacity: opacityA }]}>
              <VideoView
                player={playerA}
                {...videoProps}
                onFirstFrameRender={() => {
                  if (isActive && frontSlotRef.current === 0) playMutedLoop(playerA);
                }}
              />
            </Animated.View>
            <Animated.View style={[styles.slot, { opacity: opacityB }]}>
              <VideoView
                player={playerB}
                {...videoProps}
                onFirstFrameRender={() => {
                  if (isActive && frontSlotRef.current === 1) playMutedLoop(playerB);
                }}
              />
            </Animated.View>
          </View>
        </View>
      ) : (
        <View style={[styles.videoClip, styles.placeholder]} pointerEvents="none" />
      )}
    </View>
  );
}

export default memo(ModularBabyGrowth);

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 4,
    borderRadius: 24,
    overflow: 'hidden',
    alignSelf: 'center',
    backgroundColor: FRAME_FILL,
  },
  mainContainerEmbedded: {
    marginTop: 0,
    borderRadius: 20,
  },
  videoClip: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: FRAME_FILL,
  },
  videoScale: {
    ...StyleSheet.absoluteFillObject,
    transform: [{ scale: BORDER_CROP_SCALE }],
  },
  placeholder: {
    backgroundColor: FRAME_FILL,
  },
  slot: {
    ...StyleSheet.absoluteFillObject,
  },
  babyVideo: {
    width: '100%',
    height: '100%',
  },
});
