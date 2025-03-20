import { PropsWithChildren, ReactElement, ReactNode } from "react";

import { FernTooltip, FernTooltipProvider } from "@fern-docs/components";

interface TooltipProps {
  tip: string | ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

export function Tooltip({
  children,
  tip,
  side = "top",
  sideOffset = 6,
}: PropsWithChildren<TooltipProps>): ReactElement<any> {
  return (
    <FernTooltipProvider delayDuration={0}>
      <FernTooltip content={tip} side={side} sideOffset={sideOffset}>
        {children}
      </FernTooltip>
    </FernTooltipProvider>
  );
}
