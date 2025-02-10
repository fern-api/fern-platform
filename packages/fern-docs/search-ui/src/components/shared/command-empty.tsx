import { ComponentProps, forwardRef } from "react";

import { useSearchHits } from "../../hooks/use-search-hits";
import * as Command from "../cmdk";

export const CommandEmpty = forwardRef<
  HTMLDivElement,
  ComponentProps<typeof Command.Empty>
>(({ children, ...props }, ref) => {
  const query = Command.useCommandState((state) => state.search);
  const items = useSearchHits();

  if (typeof query === "string" && query.trimStart().length === 0) {
    return null;
  }

  if (items.length > 0) {
    return null;
  }

  return (
    <Command.Empty ref={ref} {...props}>
      {children ?? <>No results found for &ldquo;{query}&rdquo;.</>}
    </Command.Empty>
  );
});

CommandEmpty.displayName = "CommandEmpty";
