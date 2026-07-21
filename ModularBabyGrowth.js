import React, { memo, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, View, Platform, useWindowDimensions } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import {
  getWeeklyBabyVideoSource,
  resolveBabyGrowthWeek,
} from './modularBabyGrowthConfig';

const VIDEO_ASPECT = 4 / 3;
const FRAME_FILL = '#E8C4B8';
const WEEK_FADE_MS = 280;

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

/**
 * Single sticky blooming-body player.
 *
 * Dual-slot / Reanimated crossfades were glitching and racing play/pause.
 * On web, player.play() only works after VideoView mounts a <video> — so we
 * mount the view only on the Bloom tab, then force-play after attach.
 */
function ModularBabyGrowth({ currentWeek = 20, embedded = false, isActive = true }) {
  const { width: windowW } = useWindowDimensions();
  const displayWeek = resolveBabyGrowthWeek(currentWeek);
  const { week: videoWeek, source: babySource } = getWeeklyBabyVideoSource(displayWeek);

  const frameW = Math.min(Math.max(windowW - (embedded ? 64 : 48), 200), embedded ? 360 : 420);
  const frameH = Math.round(frameW / VIDEO_ASPECT);

  // Keep one player forever — week changes use replaceAsync (no remount pop).
  // Pass the Metro asset id directly; expo-video resolves hashed web URIs.
  const bootSource = useRef(babySource).current;
  const player = useVideoPlayer(bootSource, pauseMuted);
  const loadedWeekRef = useRef(videoWeek);
  const [fadeOpacity, setFadeOpacity] = useState(1);
  const fadeTimerRef = useRef(null);

  // Swap week clip on the existing player (hidden slot pattern without a 2nd decoder).
  useEffect(() => {
    if (videoWeek === loadedWeekRef.current) return;
    let cancelled = false;

    const run = async () => {
      setFadeOpacity(0);
      try {
        if (typeof player.replaceAsync === 'function') {
          await player.replaceAsync(babySource);
        } else if (typeof player.replace === 'function') {
          player.replace(babySource);
        }
        if (cancelled) return;
        loadedWeekRef.current = videoWeek;
        if (isActive) playMutedLoop(player);
      } catch (_) {
        /* keep prior frame */
      }
      if (cancelled) return;
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = setTimeout(() => {
        if (!cancelled) setFadeOpacity(1);
      }, 40);
    };

    run();
    return () => {
      cancelled = true;
      clearTimeout(fadeTimerRef.current);
    };
  }, [videoWeek, babySource, player, isActive]);

  // Play only while Bloom is active — and only after VideoView can attach on web.
  useEffect(() => {
    if (!isActive) {
      pauseMuted(player);
      return undefined;
    }

    const kick = () => playMutedLoop(player);
    // Immediate + retries cover the web mount race (_mountedVideos empty until attach).
    kick();
    const t1 = setTimeout(kick, 50);
    const t2 = setTimeout(kick, 200);
    const t3 = setTimeout(kick, 500);

    const onAppState = (state) => {
      if (state === 'active') kick();
      else pauseMuted(player);
    };
    const sub = AppState.addEventListener('change', onAppState);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      sub.remove();
      pauseMuted(player);
    };
  }, [isActive, player, videoWeek]);

  return (
    <View
      style={[
        styles.mainContainer,
        { width: frameW, height: frameH },
        embedded && styles.mainContainerEmbedded,
      ]}
      collapsable={false}
    >
      {/*
        Video surfaces ignore parent opacity and punch through transparent Home.
        Only mount <VideoView> on the active Bloom tab. Soft opacity is CSS-only
        (no Reanimated dual layers) so week changes don't glitch.
      */}
      {isActive ? (
        <View
          style={[styles.videoLayer, { opacity: fadeOpacity }]}
          pointerEvents="none"
          collapsable={false}
        >
          <VideoView
            player={player}
            style={styles.babyVideo}
            nativeControls={false}
            contentFit="cover"
            allowsFullscreen={false}
            playsInline
            onFirstFrameRender={() => playMutedLoop(player)}
          />
        </View>
      ) : (
        <View style={[styles.videoLayer, styles.placeholder]} pointerEvents="none" />
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
  videoLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: FRAME_FILL,
    ...(Platform.OS === 'web'
      ? { transitionProperty: 'opacity', transitionDuration: `${WEEK_FADE_MS}ms` }
      : {}),
  },
  placeholder: {
    backgroundColor: FRAME_FILL,
  },
  babyVideo: {
    width: '100%',
    height: '100%',
  },
});
