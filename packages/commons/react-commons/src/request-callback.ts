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

export function isomorphicRequestAnimationFrame(fn: () => void) {
  try {
    if (requestAnimationFrame) {
      const handle = requestAnimationFrame(fn);
      return () => cancelAnimationFrame(handle);
    }
  } catch {
    // do nothing
  }
  const timeoutId = setTimeout(fn, 0);
  return () => clearTimeout(timeoutId);
}
