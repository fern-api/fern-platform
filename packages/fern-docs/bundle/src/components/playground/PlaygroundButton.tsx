"use client";

import { FC } from "react";

import { PlaySolid } from "iconoir-react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernTooltip, FernTooltipProvider } from "@fern-docs/components";

import { FernLinkButton } from "../components/FernLinkButton";
import { usePlaygroundSettings } from "../hooks/usePlaygroundSettings";
import { conformExplorerRoute } from "./utils/explorer-route";

export const PlaygroundButton: FC<{
  state: FernNavigation.NavigationNodeApiLeaf;
}> = ({ state }) => {
  const settings = usePlaygroundSettings(state.id);

  return (
    <FernTooltipProvider>
      <FernTooltip
        content={
          <span>
            Customize and run in{" "}
            <span className="text-accent font-semibold">API Explorer</span>
          </span>
        }
      >
        <FernLinkButton
          aria-description={
            settings?.button?.href
              ? "Opens an API Explorer in a new tab"
              : "Opens the API Explorer"
          }
          href={settings?.button?.href ?? conformExplorerRoute(state.slug)}
          target={settings?.button?.href ? "_blank" : undefined}
          rightIcon={<PlaySolid />}
          variant="filled"
          intent="primary"
          size="small"
          mono={true}
        >
          Play
        </FernLinkButton>
      </FernTooltip>
    </FernTooltipProvider>
  );
};
