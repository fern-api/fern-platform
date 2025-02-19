import React from "react";

import { cn } from "@fern-docs/components";

export function MobileSidebarHeaderLinks({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!children) {
    return null;
  }
  return (
    <div
      className={cn(
        "border-border-default -mx-4 mt-4 list-none border-t p-4 [&>*]:block",
        { "lg:hidden": true }
      )}
    >
      {children}
    </div>
  );
}
