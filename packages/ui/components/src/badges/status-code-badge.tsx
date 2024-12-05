import { forwardRef } from "react";
import { SemanticColor } from "./colors";
import { SemanticBadge, SemanticBadgeProps } from "./semantic-badge";

interface StatusCodeBadgeProps extends Omit<SemanticBadgeProps, "intent"> {
    statusCode: number | string;
}

const STATIC_CODE_INTENTS: Record<string, SemanticColor> = {
    1: "info",
    2: "success",
    3: "warning",
    4: "error",
    5: "error",
};

export const StatusCodeBadge = forwardRef<HTMLSpanElement & HTMLButtonElement, StatusCodeBadgeProps>(
    ({ statusCode, ...props }, ref) => {
        const statusCodeString = String(statusCode);
        return (
            <SemanticBadge
                {...props}
                ref={ref}
                data-badge-type="status-code"
                intent={STATIC_CODE_INTENTS[statusCodeString[0] ?? ""]}
            >
                {props.children ?? statusCodeString}
            </SemanticBadge>
        );
    },
);

StatusCodeBadge.displayName = "StatusCodeBadge";
