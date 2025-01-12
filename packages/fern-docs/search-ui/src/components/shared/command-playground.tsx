import { Kbd } from "@fern-docs/components";
import { Play } from "lucide-react";
import { ComponentPropsWithoutRef, forwardRef } from "react";
import * as Command from "../cmdk";

export const CommandGroupExplorer = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Command.Group> & {
    toggleExplorer?: () => void;
    explorerOpen?: boolean;
  }
>(({ toggleExplorer, explorerOpen, ...props }, ref) => {
  if (toggleExplorer == null) {
    return false;
  }

  return (
    <Command.Group heading="API Explorer" ref={ref} {...props}>
      <Command.Item
        value={explorerOpen ? "close api explorer" : "open api explorer"}
        onSelect={() => toggleExplorer()}
      >
        <Play />
        {explorerOpen ? "Close API Explorer" : "Open API Explorer"}
        <Kbd className="ml-auto">ctrl+&#96;</Kbd>
      </Command.Item>
    </Command.Group>
  );
});

CommandGroupExplorer.displayName = "CommandGroupExplorer";
