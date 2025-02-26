import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { NavArrowUp, TerminalTag } from "iconoir-react";
import { useAtomValue } from "jotai";
import {
  CURRENT_NODE_ATOM,
  IS_PLAYGROUND_ENABLED_ATOM,
  useOpenPlayground,
} from "../atoms";
import { usePlaygroundSettings } from "../hooks/usePlaygroundSettings";

export const PlaygroundFloatingButton = () => {
  const openPlayground = useOpenPlayground();
  const isPlaygroundEnabled = useAtomValue(IS_PLAYGROUND_ENABLED_ATOM);
  const node = useAtomValue(CURRENT_NODE_ATOM);
  const settings = usePlaygroundSettings(node?.id ?? undefined);
  const apiLeaf = node && FernNavigation.isApiLeaf(node);

  if (!isPlaygroundEnabled || settings?.disabled || !apiLeaf) {
    return null;
  }

  return (
    <button
      className="playground-floating-button"
      onClick={() => {
        if (settings?.button?.href) {
          console.log("settings.button.href: ", settings.button.href);
          window.open(settings.button.href, "_blank");
        } else if (apiLeaf) {
          void openPlayground(node);
        }
      }}
    >
      <TerminalTag height={16} width={16} />

      <NavArrowUp height={16} width={16} className="nav-arrow" />
    </button>
  );
};
