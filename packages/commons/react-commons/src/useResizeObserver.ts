/* eslint-disable react-hooks/rules-of-hooks */
import fastdom from "fastdom";
import { RefObject, useEffect, useMemo, useRef } from "react";
import { noop } from "ts-essentials";
import { useEventCallback } from "./useEventCallback";

export function useResizeObserver(
  ref: RefObject<HTMLElement | null>,
  measure: (entries: ResizeObserverEntry[]) => void
): void {
  // ResizeObserver is not supported in SSG, so this hook should be disabled on the server-side
  if (typeof ResizeObserver === "undefined") {
    return;
  }

  // use fastdom to batch measure calls and avoid layout thrashing
  const cancelMeasure = useRef<() => void>(noop);

  // use event callback to avoid creating a new observer on every render
  const innerMeasure = useEventCallback((entries: ResizeObserverEntry[]) => {
    fastdom.clear(cancelMeasure.current);
    cancelMeasure.current = fastdom.measure(() => measure(entries));
  });

  // this should be a stable reference
  const resizeObserver = useMemo(
    () => new ResizeObserver(innerMeasure),
    [innerMeasure]
  );

  useEffect(() => {
    if (ref.current) {
      resizeObserver.disconnect();
      resizeObserver.observe(ref.current);
    }

    // cleanup on unmount
    return () => {
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizeObserver]);
}
