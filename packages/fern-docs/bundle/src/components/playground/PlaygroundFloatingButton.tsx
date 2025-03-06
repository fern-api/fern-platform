"use client";

import { ChevronUp, SquareTerminal } from "lucide-react";

import { FernTooltip, FernTooltipProvider } from "@fern-docs/components";

import { ButtonLink } from "@/components/FernLinkButton";
import { useCurrentVersionSlug } from "@/state/navigation";

import { conformExplorerRoute } from "./utils/explorer-route";

// todo (catherine): add this to the endpoint content
export const PlaygroundFloatingButton = () => {
  const slug = useCurrentVersionSlug();

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
          href={slug ? conformExplorerRoute(slug) : "/~explorer"}
        >
          <SquareTerminal height={16} width={16} />

          <ChevronUp height={16} width={16} className="nav-arrow" />
        </ButtonLink>
      </FernTooltip>
    </FernTooltipProvider>
  );
};
