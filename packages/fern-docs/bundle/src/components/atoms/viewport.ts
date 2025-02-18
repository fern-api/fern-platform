import { atomWithDefault } from "jotai/utils";

export const SCROLL_BODY_ATOM = atomWithDefault<
  Document | HTMLDivElement | null
>(() => {
  if (typeof document === "undefined") {
    return null;
  }
  return document;
});
SCROLL_BODY_ATOM.debugLabel = "SCROLL_BODY_ATOM";
