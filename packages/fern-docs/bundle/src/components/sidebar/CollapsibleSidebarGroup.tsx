import React from "react";

import * as Collapsible from "@radix-ui/react-collapsible";

import { cn, useFernCollapseOverflow } from "@fern-docs/components";

export function CollapsibleSidebarGroup({
  open,
  trigger,
  children,
}: {
  open: boolean;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Collapsible.Root open={open}>
      <Collapsible.Trigger asChild>{trigger}</Collapsible.Trigger>
      <Collapsible.Content asChild {...useFernCollapseOverflow()}>
        <ul
          className={cn(
            "fern-sidebar-group fern-collapsible border-border-concealed ml-4 border-l lg:ml-2 lg:py-1 lg:pl-1"
          )}
        >
          {React.Children.map(children, (child, index) => (
            <li
              key={React.isValidElement(child) ? (child.key ?? index) : index}
            >
              {child}
            </li>
          ))}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
