import { FdrAPI } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import { ReactNode, memo } from "react";
import { FernTooltip } from "../components/FernTooltip";
import { Tag, TagProps } from "../components/Tag";
export declare namespace HttpMethodTag {
    export interface Props extends TagProps {
        method: FdrAPI.api.v1.read.HttpMethod | "STREAM" | "WSS";
        active?: boolean;
    }
}

const UnmemoizedHttpMethodTag: React.FC<HttpMethodTag.Props> = ({
    method,
    active,
    size = "sm",
    className,
    ...rest
}) => {
    return (
        <Tag
            colorScheme={
                method === "GET"
                    ? "green"
                    : method === "DELETE"
                      ? "red"
                      : method === "POST"
                        ? "blue"
                        : method === "STREAM" || method === "WSS"
                          ? "accent"
                          : "yellow"
            }
            variant={active ? "solid" : "subtle"}
            className={clsx("uppercase", { "w-11": size === "sm" }, className)}
            size={size}
            {...rest}
        >
            {method === FdrAPI.api.v1.read.HttpMethod.Delete ? "DEL" : method}
        </Tag>
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
