import { forwardRef } from "react";
import { Badge, BadgeProps } from "./badge";
import { SemanticColor, SemanticColorMap } from "./colors";

interface SemanticBadgeProps extends Omit<BadgeProps, "color"> {
    intent?: SemanticColor;
}

export const SemanticBadge = forwardRef<HTMLSpanElement, SemanticBadgeProps>(({ intent, ...props }, ref) => {
    return <Badge {...props} ref={ref} color={intent ? SemanticColorMap[intent] : undefined} />;
});

SemanticBadge.displayName = "SemanticBadge";
