"use client";

import React from "react";

import { composeEventHandlers } from "@radix-ui/primitive";
import { atom, useAtomValue, useSetAtom } from "jotai";

import { DesktopSearchButton } from "@fern-docs/search-ui";

import { FERN_SEARCH_BUTTON_ID } from "@/components/constants";

export const searchDialogOpenAtom = atom(false);
export const searchInitializedAtom = atom(false);

searchInitializedAtom.onMount = (setInitialized) => {
  if (typeof window === "undefined") {
    return;
  }

  const initialize = () => {
    setInitialized(true);
  };

  // enable other components to initialize the search state
  window.addEventListener("search:initialized", initialize);
  return () => {
    window.removeEventListener("search:initialized", initialize);
  };
};

export const SearchV2Trigger = React.memo(function SearchV2Trigger(
  props: React.ComponentProps<typeof DesktopSearchButton>
) {
  const isInitialized = useAtomValue(searchInitializedAtom);
  const toggleSearchDialog = useToggleSearchDialog();
  return (
    <DesktopSearchButton
      /**
       * IMPORTANT: This component must be rendered only ONCE in the entire DOM tree,
       * because the ID must be unique across the entire document.
       */
      id={FERN_SEARCH_BUTTON_ID}
      {...props}
      onClick={composeEventHandlers(props.onClick, toggleSearchDialog)}
      variant={isInitialized ? "default" : "loading"}
    />
  );
});

export function useIsSearchDialogOpen(): boolean {
  return useAtomValue(searchDialogOpenAtom);
}

export function useToggleSearchDialog(): () => void {
  const setSearchDialogState = useSetAtom(searchDialogOpenAtom);
  return () => setSearchDialogState((prev) => !prev);
}
