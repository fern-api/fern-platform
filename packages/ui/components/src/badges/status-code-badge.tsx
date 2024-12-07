import { forwardRef } from "react";
import { SemanticColor } from "../colors";
import { SemanticBadge, SemanticBadgeProps } from "./semantic-badge";

interface StatusCodeBadgeProps extends Omit<SemanticBadgeProps, "intent"> {
    statusCode: number | string;
}

const STATIC_CODE_INTENTS: Record<string, SemanticColor> = {
    1: SemanticColor.Info,
    2: SemanticColor.Success,
    3: SemanticColor.Warning,
    4: SemanticColor.Error,
    5: SemanticColor.Error,
};

export const StatusCodeBadge = forwardRef<HTMLSpanElement & HTMLButtonElement, StatusCodeBadgeProps>(
    ({ statusCode, ...props }, ref) => {
        const statusCodeString = String(statusCode);
        return (
            <SemanticBadge
                {...props}
                ref={ref}
                data-badge-type="status-code"
                data-status-code={statusCodeString}
                data-status-level={`${statusCodeString[0]}xx`}
                intent={statusCodeToIntent(statusCodeString)}
            >
                {props.children ?? statusCodeString}
            </SemanticBadge>
        );
    },
);

StatusCodeBadge.displayName = "StatusCodeBadge";

export function statusCodeToIntent(statusCode: string): SemanticColor {
    return STATIC_CODE_INTENTS[statusCode[0] ?? ""] ?? SemanticColor.None;
}
