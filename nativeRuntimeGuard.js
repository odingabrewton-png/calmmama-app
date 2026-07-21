const DEV = typeof __DEV__ !== 'undefined' && __DEV__;

/** Dev-only breadcrumb immediately before native / JSI calls. */
export function logNativeCheckpoint(label, detail) {
  if (!DEV) return;
  if (detail !== undefined) {
    console.log(`[CalmMama native] ${label}`, detail);
  } else {
    console.log(`[CalmMama native] ${label}`);
  }
}

export function logNativeError(label, error) {
  const message = error?.message ?? String(error ?? 'unknown');
  const stack = error?.stack;
  console.error(`[CalmMama native] ${label}: ${message}`, stack ?? '');
}

export function runNativeGuard(label, fn) {
  try {
    logNativeCheckpoint(`${label} → start`);
    const result = fn();
    logNativeCheckpoint(`${label} → ok`);
    return result;
  } catch (error) {
    logNativeError(label, error);
    return undefined;
  }
}

export function guardPromise(promise, label) {
  return Promise.resolve(promise).catch((error) => {
    logNativeError(label, error);
    return undefined;
  });
}
