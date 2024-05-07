import { FdrAPI } from "@fern-api/fdr-sdk";
import clsx from "clsx";
import { memo } from "react";
import { Tag } from "../components/Tag";
export declare namespace HttpMethodTag {
    export interface Props {
        method: FdrAPI.api.v1.read.HttpMethod | "STREAM" | "WSS";
        size?: "sm" | "lg";
        className?: string;
        active?: boolean;
    }
}

const UnmemoizedHttpMethodTag: React.FC<HttpMethodTag.Props> = ({ method, active, className, ...rest }) => {
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
            className={clsx("w-10", className)}
            {...rest}
        >
            {method === FdrAPI.api.v1.read.HttpMethod.Delete ? "DEL" : method}
        </Tag>
    );
};

export const HttpMethodTag = memo(UnmemoizedHttpMethodTag);
