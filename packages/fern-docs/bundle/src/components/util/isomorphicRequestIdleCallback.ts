export function isomorphicRequestIdleCallback(fn: () => void, timeout = 0) {
  try {
    if (requestIdleCallback) {
      const handle = requestIdleCallback(fn, { timeout });
      return () => cancelAnimationFrame(handle);
    }
  } catch {
    // do nothing
  }
  const timeoutId = setTimeout(fn, timeout);
  return () => clearTimeout(timeoutId);
}
