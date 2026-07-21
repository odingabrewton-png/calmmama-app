import {
  cancelAnimation,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { logNativeCheckpoint, runNativeGuard } from './nativeRuntimeGuard';

/** Plain objects only — safe to pass into Reanimated UI-thread spring configs. */
export const SNAPPY_SPRING = { damping: 7, stiffness: 40 };
export const LOTUS_CLOSE_SPRING = { damping: 12, stiffness: 140 };

export function safeCancelAnimation(sharedValue, label = 'cancelAnimation') {
  if (!sharedValue) return;
  runNativeGuard(label, () => cancelAnimation(sharedValue));
}

export function safeAssignTiming(sharedValue, toValue, config, label = 'withTiming') {
  if (!sharedValue) return;
  runNativeGuard(label, () => {
    sharedValue.value = withTiming(toValue, config);
  });
}

export function safeAssignSpring(sharedValue, toValue, config = SNAPPY_SPRING, label = 'withSpring') {
  if (!sharedValue) return;
  runNativeGuard(label, () => {
    sharedValue.value = withSpring(toValue, config);
  });
}

export function safeAssignSequence(sharedValue, steps, label = 'withSequence') {
  if (!sharedValue || !steps?.length) return;
  runNativeGuard(label, () => {
    sharedValue.value = withSequence(...steps);
  });
}

export function safeStartOmbrePhase(phase, timingStep, label = 'ombrePhase') {
  if (!phase) return;
  logNativeCheckpoint(`${label} → scheduling repeat`);
  runNativeGuard(label, () => {
    phase.value = timingStep;
  });
}
