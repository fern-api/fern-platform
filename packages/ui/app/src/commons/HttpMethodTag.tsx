import { FdrAPI } from "@fern-api/fdr-sdk";
import cn from "clsx";
import { memo } from "react";
export declare namespace HttpMethodTag {
    export interface Props {
        method: FdrAPI.api.v1.read.HttpMethod;
        small?: boolean;
        className?: string;
        active?: boolean;
    }
}

const UnmemoizedHttpMethodTag: React.FC<HttpMethodTag.Props> = ({ method, small = false, className, active }) => {
    return (
        <span
            className={cn(className, "uppercase font-mono inline-flex justify-center items-center leading-none", {
                ["bg-tag-method-get text-text-method-get dark:text-method-get-dark"]:
                    method === FdrAPI.api.v1.read.HttpMethod.Get && !active,
                ["bg-method-get text-text-default-inverted"]: method === FdrAPI.api.v1.read.HttpMethod.Get && active,
                ["bg-tag-method-post text-text-method-post"]: method === FdrAPI.api.v1.read.HttpMethod.Post && !active,
                ["bg-method-post text-text-default-inverted"]: method === FdrAPI.api.v1.read.HttpMethod.Post && active,
                ["bg-tag-method-delete text-text-method-delete"]:
                    method === FdrAPI.api.v1.read.HttpMethod.Delete && !active,
                ["bg-method-delete text-text-default-inverted"]:
                    method === FdrAPI.api.v1.read.HttpMethod.Delete && active,
                ["bg-tag-method-put text-text-method-put"]: method === FdrAPI.api.v1.read.HttpMethod.Put && !active,
                ["bg-method-put text-text-default-inverted"]: method === FdrAPI.api.v1.read.HttpMethod.Put && active,
                ["bg-tag-method-patch text-text-method-patch"]:
                    method === FdrAPI.api.v1.read.HttpMethod.Patch && !active,
                ["bg-method-patch text-text-default-inverted"]:
                    method === FdrAPI.api.v1.read.HttpMethod.Patch && active,
                ["rounded-md h-[18px] text-[10px] w-9"]: small,
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
