import React from "react";

import * as Collapsible from "@radix-ui/react-collapsible";

import { cn } from "@fern-docs/components";
import { useBooleanState } from "@fern-ui/react-commons";

export function CollapsibleSidebarGroup({
  open,
  trigger,
  children,
}: {
  open: boolean;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) {
  const animationFrameRef = React.useRef<number | null>(null);
  const isAnimatingState = useBooleanState(false);
  return (
    <Collapsible.Root open={open}>
      <Collapsible.Trigger asChild>{trigger}</Collapsible.Trigger>
      <Collapsible.Content
        asChild
        // the collapsible component needs to clip overflowing content during the animation,
        // and remove the clip at least one frame after the animation ends
        onAnimationStart={() => {
          if (animationFrameRef.current != null) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          isAnimatingState.setTrue();
        }}
        onAnimationEnd={() => {
          animationFrameRef.current = requestAnimationFrame(() => {
            isAnimatingState.setFalse();
          });
        }}
      >
        <ul
          className={cn(
            "fern-sidebar-group fern-collapsible border-border-concealed ml-4 border-l lg:ml-2 lg:py-1 lg:pl-1",
            isAnimatingState.value && "overflow-clip"
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
