import { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { FernTag, FernTagColorScheme, FernTagProps, FernTooltip } from "@fern-ui/components";
import clsx from "clsx";
import { ReactNode, memo } from "react";

export declare namespace HttpMethodTag {
    export interface Props extends FernTagProps {
        method: APIV1Read.HttpMethod | "STREAM" | "WSS";
        active?: boolean;
    }
}

const METHOD_COLOR_SCHEMES: Record<HttpMethodTag.Props["method"], FernTagColorScheme> = {
    GET: "green",
    DELETE: "red",
    POST: "blue",
    STREAM: "blue",
    WSS: "green",
    PUT: "amber",
    PATCH: "amber",
};

export const HttpMethodTag = memo<HttpMethodTag.Props>(({ method, active, size = "lg", className, ...rest }) => {
    return (
        <FernTag
            colorScheme={METHOD_COLOR_SCHEMES[method]}
            variant={active ? "solid" : "subtle"}
            className={clsx(
                "uppercase",
                {
                    "w-10 font-bold": size === "sm",
                    "tracking-tighter": method === "STREAM",
                },
                "mt-0.5",
                className,
            )}
            size={size}
            {...rest}
        >
            {method === APIV1Read.HttpMethod.Delete ? "DEL" : method}
        </FernTag>
    );
});
HttpMethodTag.displayName = "HttpMethodTag";

export function withStream(text: ReactNode, size: "sm" | "lg" = "sm"): ReactNode {
    return (
        <span className="inline-flex items-center gap-2">
            <span>{text}</span>
            <HttpMethodTag size={size} method="STREAM" />
        </span>
    );
}
export function withWss(text: ReactNode, size: "sm" | "lg" = "sm"): ReactNode {
    return (
        <span className="inline-flex items-center gap-2">
            <span>{text}</span>
            <FernTooltip content="WebSocket Channel">
                <HttpMethodTag size={size} method="WSS" />
            </FernTooltip>
        </span>
    );
}
