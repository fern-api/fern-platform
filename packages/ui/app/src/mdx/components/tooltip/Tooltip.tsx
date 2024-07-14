import { FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { PropsWithChildren, ReactElement, ReactNode } from "react";

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
}: PropsWithChildren<TooltipProps>): ReactElement {
    return (
        <FernTooltipProvider delayDuration={0}>
            <FernTooltip content={tip} side={side} sideOffset={sideOffset}>
                {children}
            </FernTooltip>
        </FernTooltipProvider>
    );
}
