"use client";

import { FC } from "react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { PlaygroundButton } from "./PlaygroundButton";

export const PlaygroundButtonTray: FC<{
  state: FernNavigation.NavigationNodeApiLeaf;
  className?: string;
}> = ({ state, className }) => {
  return (
    <div className="bg-(color:--grayscale-a2) border-card-border flex h-10 justify-end border-t p-2">
      <div className="flex items-center">
        <PlaygroundButton state={state} className={className} />
      </div>
    </div>
  );
};
