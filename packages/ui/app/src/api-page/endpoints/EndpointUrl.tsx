import { Tooltip } from "@blueprintjs/core";
import { divideEndpointPathToParts, ResolvedEndpointDefinition, type EndpointPathPart } from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { useCopyToClipboard } from "@fern-ui/react-commons";
import classNames from "classnames";
import React, { PropsWithChildren, ReactElement, useCallback, useMemo } from "react";
import { buildEndpointUrl } from "../../api-playground/utils";
import { HttpMethodTag } from "../../commons/HttpMethodTag";
import styles from "./EndpointUrl.module.scss";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        urlStyle: "default" | "overflow";
        endpoint: ResolvedEndpointDefinition;
        className?: string;
    }>;
}

export const EndpointUrl = React.forwardRef<HTMLDivElement, PropsWithChildren<EndpointUrl.Props>>(function EndpointUrl(
    { endpoint, className, urlStyle },
    ref
) {
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
                            <div key={`part-${i}`} className="t-muted whitespace-nowrap font-mono text-xs">
                                {literal.value}
                            </div>
                        );
                    },
                    pathParameter: (pathParameter) => (
                        <div
                            key={`part-${i}`}
                            className="bg-accent-highlight dark:bg-accent-highlight-dark text-accent-primary dark:text-accent-primary-dark flex items-center justify-center whitespace-nowrap rounded px-1 font-mono text-xs"
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

    const { copyToClipboard, wasJustCopied } = useCopyToClipboard(() => buildEndpointUrl(endpoint, undefined));

    return (
        <div ref={ref} className={classNames("flex h-8 flex-1 items-baseline", className)}>
            <HttpMethodTag method={endpoint.method} className="mr-3" />
            <Tooltip
                hoverOpenDelay={500}
                hoverCloseDelay={wasJustCopied ? 1000 : 0}
                content={wasJustCopied ? "Copied!" : "Click to copy"}
                placement="top"
                popoverClassName="text-xs"
                compact={true}
                renderTarget={({ isOpen, className, ...props }) => (
                    <span
                        {...props}
                        className={classNames(
                            className,
                            "!inline-flex leading-none shrink grow items-center overflow-x-hidden hover:bg-tag-default-light dark:hover:bg-tag-default-dark px-2 rounded-md -mx-2 h-6 cursor-pointer",
                            {
                                [styles.urlOverflowContainer ?? ""]: urlStyle === "overflow",
                            }
                        )}
                        onClick={copyToClipboard}
                    >
                        <span className="inline-flex items-baseline space-x-1">
                            {renderPathParts(endpointPathParts)}
                        </span>
                    </span>
                )}
            />
        </div>
    );
});
