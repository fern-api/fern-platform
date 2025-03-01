import { FC, PropsWithChildren, ReactNode } from "react";
import React from "react";

import * as Collapsible from "@radix-ui/react-collapsible";

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
  return (
    <Collapsible.Root {...props}>
      {trigger && <Collapsible.Trigger asChild>{trigger}</Collapsible.Trigger>}
      <Collapsible.Content
        className="fern-collapsible"
        {...useFernCollapseOverflow()}
      >
        <div className="fern-collapsible-child">{children}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

export function useFernCollapseOverflow() {
  const ref = React.useRef<HTMLDivElement>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  return {
    ref,
    onAnimationStart: () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        if (ref.current != null) {
          ref.current.style.overflow = "hidden";
        }
      });
    },
    onAnimationEnd: () => {
      if (animationFrameRef.current != null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        if (ref.current != null) {
          ref.current.style.overflow = "visible";
        }
      });
    },
  };
}
