"use client";

import { SquareTerminal, ChevronUp } from "lucide-react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernTooltip, FernTooltipProvider } from "@fern-docs/components";

import { ButtonLink } from "@/components/FernLinkButton";

import { usePlaygroundSettings } from "../hooks/usePlaygroundSettings";
import { conformExplorerRoute } from "./utils/explorer-route";
import { getEdgeFlags } from "@fern-docs/edge-config";
import { useCurrentNodeId } from "@/state/navigation";

export const PlaygroundFloatingButton = () => {
  const isPlaygroundEnabled = getEdgeFlags("isApiPlaygroundEnabled");
  const nodeId = useCurrentNodeId();
  const settings = usePlaygroundSettings(nodeId ?? undefined);
  const apiLeaf = nodeId && FernNavigation.isApiLeaf(nodeId);

  if (!isPlaygroundEnabled || settings?.disabled || !apiLeaf) {
    return null;
  }

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
          id="playground-floating-button"
          href={settings?.button?.href ?? conformExplorerRoute(node.slug)}
        >
          <SquareTerminal height={16} width={16} />

          <ChevronUp height={16} width={16} className="nav-arrow" />
        </ButtonLink>
      </FernTooltip>
    </FernTooltipProvider>
  );
};