"use client";

import React from "react";

import { atom, useAtomValue, useSetAtom } from "jotai";

import { DesktopSearchButton } from "@fern-docs/search-ui";

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
      {...props}
      onClick={toggleSearchDialog}
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
