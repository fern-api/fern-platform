import { ComponentPropsWithoutRef, forwardRef } from "react";

import { Kbd } from "@fern-docs/components";
import { Play } from "lucide-react";

import * as Command from "../cmdk";

export const CommandGroupPlayground = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof Command.Group> & {
    togglePlayground?: () => void;
    playgroundOpen?: boolean;
  }
>(({ togglePlayground, playgroundOpen, ...props }, ref) => {
  if (togglePlayground == null) {
    return false;
  }

  return (
    <Command.Group heading="API Explorer" ref={ref} {...props}>
      <Command.Item
        value={playgroundOpen ? "close api explorer" : "open api explorer"}
        onSelect={() => togglePlayground()}
      >
        <Play />
        {playgroundOpen ? "Close API Explorer" : "Open API Explorer"}
        <Kbd className="ml-auto">ctrl+&#96;</Kbd>
      </Command.Item>
    </Command.Group>
  );
});

CommandGroupPlayground.displayName = "CommandGroupPlayground";
