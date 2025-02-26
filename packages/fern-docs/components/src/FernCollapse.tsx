import { FC, PropsWithChildren, ReactNode } from "react";
import React from "react";

import * as Collapsible from "@radix-ui/react-collapsible";

import { useBooleanState } from "@fern-ui/react-commons/src/useBooleanState";

import { cn } from "./cn";

interface FernCollapseProps extends Collapsible.CollapsibleProps {
  open?: boolean;
  className?: string;
  trigger?: ReactNode;
}

export enum AnimationStates {
  OPEN_START,
  OPEN,
  CLOSING_START,
  CLOSED,
}

export const FernCollapse: FC<PropsWithChildren<FernCollapseProps>> = ({
  children,
  trigger,
  ...props
}) => {
  const animationFrameRef = React.useRef<number | null>(null);
  const isAnimatingState = useBooleanState(false);
  return (
    <Collapsible.Root {...props}>
      {trigger && <Collapsible.Trigger asChild>{trigger}</Collapsible.Trigger>}
      <Collapsible.Content
        className={cn("fern-collapsible", {
          "overflow-clip": isAnimatingState.value,
        })}
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
        <div className="fern-collapsible-child">{children}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
