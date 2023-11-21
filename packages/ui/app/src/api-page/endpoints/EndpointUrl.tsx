import type * as FernRegistryApiRead from "@fern-api/fdr-sdk/dist/generated/api/resources/api/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import React, { PropsWithChildren, ReactElement, useCallback, useMemo } from "react";
// import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { divideEndpointPathToParts, type EndpointPathPart } from "@fern-ui/app-utils";
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

    const renderPathParts = useCallback((parts: EndpointPathPart[]) => {
        const elements: (ReactElement | null)[] = [];
        // Temporarily hiding base url
        // if (apiDefinition.hasMultipleBaseUrls === true) {
        //     const url = getEndpointEnvironmentUrl(endpoint);
        //     if (url != null) {
        //         elements.push(
        //             <div key="base-url" className="t-muted whitespace-nowrap font-light">
        //                 {url}
        //             </div>
        //         );
        //     }
        // }
        parts.forEach((p, i) => {
            elements.push(
                <div key={`separator-${i}`} className="text-text-disabled-light dark:text-text-disabled-dark">
                    /
                </div>,
                visitDiscriminatedUnion(p, "type")._visit({
                    literal: (literal) => {
                        return (
                            <div key={`part-${i}`} className="t-muted whitespace-nowrap font-mono text-xs font-normal">
                                {literal.value}
                            </div>
                        );
                    },
                    pathParameter: (pathParameter) => (
                        <div
                            key={`part-${i}`}
                            className="bg-accent-highlight text-accent-primary flex items-center justify-center whitespace-nowrap rounded px-1 font-mono text-xs font-normal"
                        >
                            :{pathParameter.name}
                        </div>
                    ),
                    _other: () => null,
                })
            );
        });
        return elements;
    }, []);

    return (
        <div ref={ref} className={classNames("flex h-8 overflow-x-hidden items-center", className)}>
            <div className="t-muted bg-tag-default-light dark:bg-tag-default-dark flex shrink-0 items-center justify-center rounded-lg px-2 py-1 text-xs font-normal uppercase">
                {endpoint.method}
            </div>
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
