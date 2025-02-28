import type { ReactElement } from "react";
import React from "react";

import * as Collapsible from "@radix-ui/react-collapsible";

import type { FernNavigation } from "@fern-api/fdr-sdk";
import { cn } from "@fern-docs/components";
import { useBooleanState } from "@fern-ui/react-commons";

interface FernSidebarGroupProps<T> {
  nodes: T[];
  open: boolean;
  renderNode: (node: T) => ReactElement<any>;
  children: ReactElement<any>;
}

export function CollapsibleSidebarGroup<
  T extends FernNavigation.NavigationNode,
>({
  nodes,
  open,
  renderNode,
  children,
}: FernSidebarGroupProps<T>): ReactElement<any> | null {
  const animationFrameRef = React.useRef<number | null>(null);
  const isAnimatingState = useBooleanState(false);
  return (
    <Collapsible.Root open={open}>
      <Collapsible.Trigger asChild>{children}</Collapsible.Trigger>
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
          {nodes.map((node) => (
            <li key={node.id}>{renderNode(node)}</li>
          ))}
        </ul>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
