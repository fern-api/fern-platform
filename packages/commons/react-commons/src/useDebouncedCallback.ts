import { type DependencyList, useCallback, useEffect, useRef } from "react";

import { debounce } from "es-toolkit/function";

import useWillUnmount from "./useWillUnmount";

interface DebounceOptions {
  /**
   * An optional AbortSignal to cancel the debounced function.
   */
  signal?: AbortSignal;
  /**
   * An optional array specifying whether the function should be invoked on the leading edge, trailing edge, or both.
   * If `edges` includes "leading", the function will be invoked at the start of the delay period.
   * If `edges` includes "trailing", the function will be invoked at the end of the delay period.
   * If both "leading" and "trailing" are included, the function will be invoked at both the start and end of the delay period.
   * @default ["trailing"]
   */
  edges?: ("leading" | "trailing")[];
}

const defaultOptions: DebounceOptions = {
  edges: ["trailing"],
};

/**
 * Accepts a function and returns a new debounced yet memoized version of that same function that delays
 * its invoking by the defined time.
 * If time is not defined, its default value will be 250ms.
 */

const useDebouncedCallback = <TCallback extends (...args: any[]) => void>(
  fn: TCallback,
  dependencies?: DependencyList,
  wait: number = 600,
  options: DebounceOptions = defaultOptions
): TCallback & {
  cancel: () => void;
  schedule: () => void;
  flush: () => void;
} => {
  const debounced = useRef(debounce<TCallback>(fn, wait, options));

  useEffect(() => {
    debounced.current = debounce(fn, wait, options);
  }, [fn, wait, options]);

  useWillUnmount(() => {
    debounced.current?.cancel();
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(debounced.current, dependencies ?? []) as any;
};

export { useDebouncedCallback };
