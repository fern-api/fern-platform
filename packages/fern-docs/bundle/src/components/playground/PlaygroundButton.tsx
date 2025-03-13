"use client";

import { FC } from "react";

import { Play } from "lucide-react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernTooltip, FernTooltipProvider } from "@fern-docs/components";

import { ButtonLink } from "@/components/FernLinkButton";

import { usePlaygroundSettings } from "../hooks/usePlaygroundSettings";
import { conformExplorerRoute } from "./utils/explorer-route";

import { cn } from "@fern-docs/components";

export const PlaygroundButton: FC<{
  state: FernNavigation.NavigationNodeApiLeaf;
  className?: string;
}> = ({ state, className }) => {
  const settings = usePlaygroundSettings(state.id);

  return (
    <FernTooltipProvider>
      <FernTooltip
        content={
          <span>
            Customize and run in{" "}
            <span className="text-(color:--accent-a11) font-semibold">
              API Explorer
            </span>
          </span>
        }
      >
        <ButtonLink
          id={`playground-button:${state.slug}`}
          aria-description={
            settings?.button?.href
              ? "Opens an API Explorer in a new tab"
              : "Opens the API Explorer"
          }
          href={settings?.button?.href ?? conformExplorerRoute(state.slug)}
          target={settings?.button?.href ? "_blank" : undefined}
          variant="default"
          size="xs"
          className={cn("font-mono", className)}
          scroll={false}
        >
          <Play className="fill-current" />
          Try it
        </ButtonLink>
      </FernTooltip>
    </FernTooltipProvider>
  );
};
