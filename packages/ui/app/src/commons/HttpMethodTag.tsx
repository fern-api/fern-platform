import { FdrAPI } from "@fern-api/fdr-sdk";
import cn from "clsx";
import { FC, memo } from "react";
export declare namespace HttpMethodTag {
    export interface Props {
        method: FdrAPI.api.v1.read.HttpMethod;
        small?: boolean;
        className?: string;
    }
}

export const WebSocketTag: FC<{ className?: string; small?: boolean }> = ({ className, small = false }) => {
    return (
        <span
            className={cn(
                className,
                "uppercase font-mono inline-flex items-center leading-none bg-tag-default t-default",
                {
                    ["py-1 px-1.5 rounded-md h-5 text-[10px]"]: small,
                    ["py-1 px-2 rounded-lg h-6 text-xs"]: !small,
                },
            )}
            style={{
                lineHeight: 1,
            }}
        >
            WSS
        </span>
    );
};

const UnmemoizedHttpMethodTag: FC<HttpMethodTag.Props> = ({ method, small = false, className }) => {
    return (
        <span
            className={cn(className, "uppercase font-mono inline-flex items-center leading-none", {
                ["bg-method-get/10 text-method-get dark:bg-method-get-dark/10 dark:text-method-get-dark"]:
                    method === FdrAPI.api.v1.read.HttpMethod.Get,
                ["bg-method-post/10 text-method-post dark:bg-method-post-dark/10 dark:text-method-post-dark"]:
                    method === FdrAPI.api.v1.read.HttpMethod.Post,
                ["bg-method-delete/10 text-method-delete dark:bg-method-delete-dark/10 dark:text-method-delete-dark"]:
                    method === FdrAPI.api.v1.read.HttpMethod.Delete,
                ["bg-method-put/10 text-method-put dark:bg-method-put-dark/10 dark:text-method-put-dark"]:
                    method === FdrAPI.api.v1.read.HttpMethod.Put,
                ["bg-method-patch/10 text-method-patch dark:bg-method-patch-dark/10 dark:text-method-patch-dark"]:
                    method === FdrAPI.api.v1.read.HttpMethod.Patch,
                ["py-1 px-1.5 rounded-md h-5 text-[10px]"]: small,
                ["py-1 px-2 rounded-lg h-6 text-xs"]: !small,
            })}
            style={{
                lineHeight: 1,
            }}
        >
            {method === FdrAPI.api.v1.read.HttpMethod.Delete ? "DEL" : method}
        </span>
    );
};

export const HttpMethodTag = memo(UnmemoizedHttpMethodTag);
