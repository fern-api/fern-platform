import { type RefObject, useRef } from "react";

const EMPTY_VALUE = Symbol("useLazyRef empty value");

export const useLazyRef = <T>(init: () => T): RefObject<T> => {
  const resultRef = useRef<T | typeof EMPTY_VALUE>(EMPTY_VALUE);

  if (resultRef.current === EMPTY_VALUE) {
    resultRef.current = init();
  }

  return resultRef as RefObject<T>;
};
