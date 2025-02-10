import { useCallback } from "react";

import { atom } from "jotai";
import { atomWithLocation } from "jotai-location";
import { useAtomCallback } from "jotai/utils";
import { useCallbackOne } from "use-memo-one";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { useEventCallback } from "@fern-ui/react-commons";

import { useHref } from "../hooks/useHref";
import { useAtomEffect } from "./hooks";

export const LOCATION_ATOM = atomWithLocation();

export const ANCHOR_ATOM = atom(
  (get) => get(LOCATION_ATOM).hash?.slice(1),
  (get, set, anchor: string | undefined) => {
    const location = get(LOCATION_ATOM);
    const hash = anchor != null ? `#${anchor}` : undefined;
    if (location.hash === hash) {
      return;
    }
    set(LOCATION_ATOM, { ...get(LOCATION_ATOM), hash }, { replace: true });
  }
);
ANCHOR_ATOM.debugLabel = "ANCHOR_ATOM";

export const SLUG_ATOM = atom((get) => {
  const location = get(LOCATION_ATOM);
  return FernNavigation.slugjoin(location.pathname);
});

export function useRouteListener(
  slug: FernNavigation.Slug,
  callback: (hash: string | undefined) => void
): void {
  const callbackRef = useEventCallback(callback);
  const route = useHref(slug);
  return useAtomEffect(
    useCallbackOne(
      (get) => {
        const location = get(LOCATION_ATOM);
        if (location.pathname?.toLowerCase() === route.toLowerCase()) {
          setTimeout(() => callbackRef(get(ANCHOR_ATOM)), 0);
        }
      },
      [route, callbackRef]
    )
  );
}

let justNavigatedTimeout: number;

/**
 * This atom is used to prevent the slug from being updated when the user navigates to a new page,
 * which sometimes happens when the on-scroll useApiPageCenterElement is overly sensitive.
 */
export const JUST_NAVIGATED_ATOM = atom(true);
JUST_NAVIGATED_ATOM.debugLabel = "JUST_NAVIGATED_ATOM";

export function useSetJustNavigated(): [set: () => void, destroy: () => void] {
  // note: JUST_NAVIGATED_ATOM is never "mounted" so we need to implement mount/unmount as an effect
  useAtomEffect(
    useCallbackOne((_get, set) => {
      window.clearTimeout(justNavigatedTimeout);
      justNavigatedTimeout = window.setTimeout(() => {
        set(JUST_NAVIGATED_ATOM, false);
      }, 1000);
      return () => {
        window.clearTimeout(justNavigatedTimeout);
      };
    }, [])
  );
  return [
    useAtomCallback(
      useCallbackOne((_get, set) => {
        window.clearTimeout(justNavigatedTimeout);
        set(JUST_NAVIGATED_ATOM, true);
        justNavigatedTimeout = window.setTimeout(() => {
          set(JUST_NAVIGATED_ATOM, false);
        }, 1000);
      }, [])
    ),
    useCallback(() => {
      window.clearTimeout(justNavigatedTimeout);
    }, []),
  ];
}
