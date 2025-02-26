import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import {
  FernButton,
  FernTooltip,
  FernTooltipProvider,
} from "@fern-docs/components";
import { PlaySolid } from "iconoir-react";
import { useAtomValue } from "jotai";
import { FC } from "react";
import { IS_PLAYGROUND_ENABLED_ATOM, useOpenPlayground } from "../atoms";
import { usePlaygroundSettings } from "../hooks/usePlaygroundSettings";

export const PlaygroundButton: FC<{
  state: FernNavigation.NavigationNodeApiLeaf;
  className?: string;
  showWrapper?: boolean;
}> = ({ state, className, showWrapper = false }) => {
  const openPlayground = useOpenPlayground();
  const isPlaygroundEnabled = useAtomValue(IS_PLAYGROUND_ENABLED_ATOM);
  const settings = usePlaygroundSettings(state.id ?? state);

  if (!isPlaygroundEnabled || settings?.disabled) {
    return null;
  }

  const tryItButton = (
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

  return (
    <>
      {showWrapper ? (
        <div className="border-card-border bg-tag-default-soft flex h-10 justify-end border-t p-2">
          <div className="flex max-w-[76px] items-center">{tryItButton}</div>
        </div>
      ) : (
        tryItButton
      )}
    </>
  );
};