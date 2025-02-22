import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import cn from "clsx";
import { NavArrowUp, TerminalTag } from "iconoir-react";
import { useAtomValue } from "jotai";
import { IS_PLAYGROUND_ENABLED_ATOM, useOpenPlayground } from "../atoms";
import { usePlaygroundSettings } from "../hooks/usePlaygroundSettings";

export const PlaygroundFloatingButton = ({
  node,
}: {
  node: FernNavigation.NavigationNode;
}) => {
  const openPlayground = useOpenPlayground();
  const isPlaygroundEnabled = useAtomValue(IS_PLAYGROUND_ENABLED_ATOM);
  const settings = usePlaygroundSettings(node.id);
  const apiLeaf = FernNavigation.isApiLeaf(node) ? node : undefined;

  if (!isPlaygroundEnabled || settings?.disabled || !apiLeaf) {
    return null;
  }

  return (
    <button
      className={cn("playground-floating-button")}
      onClick={() => {
        if (settings?.button?.href) {
          window.open(settings.button.href, "_blank");
        } else {
          void openPlayground(apiLeaf);
        }
      }}
    >
      <TerminalTag className="t-accent-aaa" />

      <NavArrowUp className="t-accent-aaa size-5" />
    </button>
  );
};
