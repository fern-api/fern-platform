import { FernRegistry } from "@fern-api/fdr-sdk";
import classNames from "classnames";
export declare namespace HttpMethodTag {
    export interface Props {
        method: FernRegistry.api.v1.read.HttpMethod;
        small?: boolean;
        className?: string;
    }
}

export const HttpMethodTag: React.FC<HttpMethodTag.Props> = ({ method, small = false, className }) => {
    return (
        <span
            className={classNames(className, "py-1 px-1.5 uppercase font-mono flex items-center", {
                ["bg-method-get/10 text-method-get"]: method === FernRegistry.api.v1.read.HttpMethod.Get,
                ["bg-method-post/10 text-method-post"]: method === FernRegistry.api.v1.read.HttpMethod.Post,
                ["bg-method-delete/10 text-method-delete"]: method === FernRegistry.api.v1.read.HttpMethod.Delete,
                ["bg-method-put/10 text-method-put"]: method === FernRegistry.api.v1.read.HttpMethod.Put,
                ["bg-method-patch/10 text-method-patch"]: method === FernRegistry.api.v1.read.HttpMethod.Patch,
                ["py-1 px-1.5 rounded-md h-5"]: small,
                ["py-1 px-2 rounded-lg h-6"]: !small,
            })}
            style={{
                fontSize: small ? "10px" : "12px",
                lineHeight: 1,
            }}
        >
            {method === FernRegistry.api.v1.read.HttpMethod.Delete ? "DEL" : method}
        </span>
    );
};
