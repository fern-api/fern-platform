"use client";

import React from "react";

import { atom, useAtomValue, useSetAtom } from "jotai";

import { DesktopSearchButton } from "@fern-docs/search-ui";

export const searchDialogOpenAtom = atom(false);
export const searchInitializedAtom = atom(false);

export const SearchV2Trigger = React.memo(function SearchV2Trigger() {
  const isInitialized = useAtomValue(searchInitializedAtom);
  const setOpen = useSetAtom(searchDialogOpenAtom);
  return (
    <DesktopSearchButton
      onClick={() => setOpen(true)}
      variant={isInitialized ? "default" : "loading"}
    />
  );
});
