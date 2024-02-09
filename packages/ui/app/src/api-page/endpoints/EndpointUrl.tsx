import { APIV1Read } from "@fern-api/fdr-sdk";
import { divideEndpointPathToParts, ResolvedEndpointPathParts, type EndpointPathPart } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import React, { PropsWithChildren, ReactElement, useCallback, useMemo } from "react";
import { HttpMethodTag } from "../../commons/HttpMethodTag";
import styles from "./EndpointUrl.module.scss";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        urlStyle: "default" | "overflow";
        path: ResolvedEndpointPathParts[];
        method: APIV1Read.HttpMethod;
        environment?: string;
        className?: string;
    }>;
}

export const EndpointUrl = React.forwardRef<HTMLDivElement, PropsWithChildren<EndpointUrl.Props>>(function EndpointUrl(
    { path, method, environment, className, urlStyle },
    ref,
) {
    const endpointPathParts = useMemo(() => divideEndpointPathToParts(path), [path]);

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
                <div key={`separator-${i}`} className="text-text-disabled">
                    /
                </div>,
                visitDiscriminatedUnion(p, "type")._visit({
                    literal: (literal) => {
                        return (
                            <div key={`part-${i}`} className="t-muted whitespace-nowrap font-mono text-xs">
                                {literal.value}
                            </div>
                        );
                    },
                    pathParameter: (pathParameter) => (
                        <div
                            key={`part-${i}`}
                            className="bg-accent-highlight t-accent flex items-center justify-center whitespace-nowrap rounded px-1 font-mono text-xs"
                        >
                            :{pathParameter.name}
                        </div>
                    ),
                    _other: () => null,
                }),
            );
        });
        return elements;
    }, []);

    return (
        <div ref={ref} className={classNames("flex h-8 overflow-x-hidden items-center", className)}>
            <HttpMethodTag method={method} />
            <div
                className={classNames("ml-3 flex shrink grow items-center space-x-1 overflow-x-hidden", {
                    [styles.urlOverflowContainer ?? ""]: urlStyle === "overflow",
                })}
            >
                {environment != null && <span className="t-muted font-mono text-xs">{environment}</span>}
                {renderPathParts(endpointPathParts)}
            </div>
        </div>
    );
});
