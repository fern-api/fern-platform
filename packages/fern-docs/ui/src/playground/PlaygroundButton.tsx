import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import {
  FernButton,
  FernTooltip,
  FernTooltipProvider,
} from "@fern-docs/components";
import { PlaySolid } from "iconoir-react";
import { FC } from "react";
import { useOpenPlayground } from "../atoms";
import { usePlaygroundSettings } from "../hooks/usePlaygroundSettings";
export const PlaygroundButton: FC<{
  state: FernNavigation.NavigationNodeApiLeaf;
  className?: string;
}> = ({ state, className }) => {
  const openPlayground = useOpenPlayground();
  const settings = usePlaygroundSettings(state.id ?? state);

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
              // open custom playground in new tab
              // note: this code implies the current page as the Referrer and the new window can refer
              // to the current `window` through their `window.opener`.
              window.open(settings.button.href, "_blank");
            } else {
              void openPlayground(state);
            }
          }}
          rightIcon={<PlaySolid />}
          variant="filled"
          intent="primary"
          size="small"
          mono={true}
          className={className}
        >
          Try it
        </FernButton>
      </FernTooltip>
    </FernTooltipProvider>
  );
};
