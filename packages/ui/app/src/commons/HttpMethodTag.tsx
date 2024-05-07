import { FdrAPI } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import { ReactNode, memo } from "react";
import { FernTag, FernTagColorScheme, FernTagProps } from "../components/FernTag";
import { FernTooltip } from "../components/FernTooltip";

export declare namespace HttpMethodTag {
    export interface Props extends FernTagProps {
        method: FdrAPI.api.v1.read.HttpMethod | "STREAM" | "WSS";
        active?: boolean;
    }
}

const METHOD_COLOR_SCHEMES: Record<HttpMethodTag.Props["method"], FernTagColorScheme> = {
    GET: "green",
    DELETE: "red",
    POST: "blue",
    STREAM: "accent",
    WSS: "accent",
    PUT: "amber",
    PATCH: "amber",
};

const UnmemoizedHttpMethodTag: React.FC<HttpMethodTag.Props> = ({
    method,
    active,
    size = "sm",
    className,
    ...rest
}) => {
    return (
        <FernTag
            colorScheme={METHOD_COLOR_SCHEMES[method]}
            variant={active ? "solid" : "subtle"}
            className={clsx("uppercase", { "w-11": size === "sm" }, className)}
            size={size}
            {...rest}
        >
            {method === FdrAPI.api.v1.read.HttpMethod.Delete ? "DEL" : method}
        </FernTag>
    );
};

export function withStream(text: ReactNode, size: "sm" | "lg" = "sm"): ReactNode {
    return (
        <span className="inline-flex items-center gap-2">
            <span>{text}</span>
            <UnmemoizedHttpMethodTag size={size} method="STREAM" />
        </span>
    );
}
export function withWss(text: ReactNode, size: "sm" | "lg" = "sm"): ReactNode {
    return (
        <span className="inline-flex items-center gap-2">
            <span>{text}</span>
            <FernTooltip content="WebSocket Channel">
                <UnmemoizedHttpMethodTag size={size} method="WSS" />
            </FernTooltip>
        </span>
    );
}

export const HttpMethodTag = memo(UnmemoizedHttpMethodTag);
