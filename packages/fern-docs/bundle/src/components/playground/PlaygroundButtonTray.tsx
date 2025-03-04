"use client";

import { FC } from "react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { PlaygroundButton } from "./PlaygroundButton";

export const PlaygroundButtonTray: FC<{
  state: FernNavigation.NavigationNodeApiLeaf;
  className?: string;
}> = ({ state, className }) => {
  const isPlaygroundEnabled = useAtomValue(IS_PLAYGROUND_ENABLED_ATOM);
  const settings = usePlaygroundSettings(state.id ?? state);

  if (!isPlaygroundEnabled || settings?.disabled) {
    return null;
  }

  return (
    <div className="border-card-border bg-tag-default-soft flex h-10 justify-end border-t p-2">
      <div className="flex max-w-[76px] items-center">
        <PlaygroundButton state={state} className={className} />
      </div>
    </div>
  );
};