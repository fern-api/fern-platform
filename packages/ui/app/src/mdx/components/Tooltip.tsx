import { FernTooltip, FernTooltipProvider } from "@fern-ui/components";
import { useAtomValue } from "jotai";
import { PropsWithChildren, ReactElement, ReactNode } from "react";
import { PORTAL_CONTAINER } from "../../atoms/portal";

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
    const portalContainer = useAtomValue(PORTAL_CONTAINER);
    return (
        <FernTooltipProvider delayDuration={0}>
            <FernTooltip content={tip} side={side} sideOffset={sideOffset} container={portalContainer}>
                {children}
            </FernTooltip>
        </FernTooltipProvider>
    );
}
