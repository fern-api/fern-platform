import type * as FernRegistryApiRead from "@fern-api/fdr-sdk/dist/generated/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import React, { PropsWithChildren, useMemo } from "react";
// import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { divideEndpointPathToParts } from "@fern-ui/app-utils";
import { HttpMethodTag } from "../../commons/HttpMethodTag";
import { renderPathParts } from "../utils/renderPathParts";
import styles from "./EndpointUrl.module.scss";
// import { getEndpointEnvironmentUrl } from "./getEndpointEnvironmentUrl";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        urlStyle: "default" | "overflow";
        endpoint: FernRegistryApiRead.EndpointDefinition;
        className?: string;
    }>;
}

export const EndpointUrl = React.forwardRef<HTMLDivElement, PropsWithChildren<EndpointUrl.Props>>(function EndpointUrl(
    { endpoint, className, urlStyle },
    ref
) {
    // const { apiDefinition } = useApiDefinitionContext();
    const endpointPathParts = useMemo(() => divideEndpointPathToParts(endpoint), [endpoint]);

    return (
        <div ref={ref} className={classNames("flex h-8 overflow-x-hidden items-center", className)}>
            <HttpMethodTag method={endpoint.method} />
            <div
                className={classNames("ml-3 flex shrink grow items-center space-x-1 overflow-x-hidden", {
                    [styles.urlOverflowContainer ?? ""]: urlStyle === "overflow",
                })}
            >
                {renderPathParts(endpointPathParts)}
            </div>
        </div>
    );
});
