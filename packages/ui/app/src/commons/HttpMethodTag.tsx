import { FdrAPI } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { memo } from "react";
export declare namespace HttpMethodTag {
    export interface Props {
        method: FdrAPI.api.v1.read.HttpMethod;
        small?: boolean;
        className?: string;
    }
}

const UnmemoizedHttpMethodTag: React.FC<HttpMethodTag.Props> = ({ method, small = false, className }) => {
    return (
        <span
            className={classNames(className, "uppercase font-mono flex items-center", {
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
                ["py-1 px-1.5 rounded-md h-5"]: small,
                ["py-1 px-2 rounded-lg h-6"]: !small,
            })}
            style={{
                fontSize: small ? "10px" : "12px",
                lineHeight: 1,
            }}
        >
            {method === FdrAPI.api.v1.read.HttpMethod.Delete ? "DEL" : method}
        </span>
    );
};

export const HttpMethodTag = memo(UnmemoizedHttpMethodTag);
