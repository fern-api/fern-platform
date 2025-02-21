import cn from "clsx";
import { NavArrowUp, TerminalTag } from "iconoir-react";

export const PlaygroundCornerButton = () => {
  return (
    <button className={cn("playground-corner-button")}>
      <TerminalTag className="text-intent-default" />

      <NavArrowUp className="text-intent-default size-5" />
    </button>
  );
};
