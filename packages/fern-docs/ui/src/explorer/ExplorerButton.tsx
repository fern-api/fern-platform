import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import {
  FernButton,
  FernTooltip,
  FernTooltipProvider,
} from "@fern-docs/components";
import { PlaySolid } from "iconoir-react";
import { useAtomValue } from "jotai";
import { FC } from "react";
import { IS_PLAYGROUND_ENABLED_ATOM, useOpenExplorer } from "../atoms";
import { useExplorerSettings } from "../hooks/useExplorerSettings";

export const ExplorerButton: FC<{
  state: FernNavigation.NavigationNodeApiLeaf;
}> = ({ state }) => {
  const openExplorer = useOpenExplorer();
  const isExplorerEnabled = useAtomValue(IS_PLAYGROUND_ENABLED_ATOM);
  const settings = useExplorerSettings(state.id);

  if (!isExplorerEnabled) {
    return null;
  }

  return (
    <FernTooltipProvider>
      <FernTooltip
        content={
          <span>
            Customize and run in{" "}
            <span className="t-accent font-semibold">API Explorer</span>
          </span>
        }
      >
        <FernButton
          aria-description={
            settings?.button?.href
              ? "Opens an API Explorer in a new tab"
              : "Opens the API Explorer"
          }
          onClick={() => {
            if (settings?.button?.href) {
              // open custom explorer in new tab
              // note: this code implies the current page as the Referrer and the new window can refer
              // to the current `window` through their `window.opener`.
              window.open(settings.button.href, "_blank");
            } else {
              void openExplorer(state);
            }
          }}
          rightIcon={<PlaySolid />}
          variant="outlined"
          intent="primary"
          size="small"
          mono={true}
        >
          Play
        </FernButton>
      </FernTooltip>
    </FernTooltipProvider>
  );
};
