import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import React, { PropsWithChildren, ReactElement, useMemo } from "react";
import { buildRequestUrl } from "../../api-playground/utils";
import { CopyToClipboardButton } from "../../commons/CopyToClipboardButton";
import { HttpMethodTag } from "../../commons/HttpMethodTag";
import { divideEndpointPathToParts, type EndpointPathPart } from "../../util/endpoint";
import { ResolvedEndpointPathParts } from "../../util/resolver";
import styles from "./EndpointUrl.module.scss";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        urlStyle: "default" | "overflow";
        path: ResolvedEndpointPathParts[];
        method: APIV1Read.HttpMethod;
        environment?: string;
        showEnvironment?: boolean;
        large?: boolean;
        className?: string;
    }>;
}

export const EndpointUrl = React.forwardRef<HTMLDivElement, PropsWithChildren<EndpointUrl.Props>>(function EndpointUrl(
    { path, method, environment, showEnvironment, large, className, urlStyle },
    ref,
) {
    const endpointPathParts = useMemo(() => divideEndpointPathToParts(path), [path]);

    const renderPathParts = (parts: EndpointPathPart[]) => {
        const elements: (ReactElement | null)[] = [];
        if (showEnvironment && environment != null) {
            elements.push(
                <span key="base-url" className="text-faded whitespace-nowrap">
                    {environment}
                </span>,
            );
        }
        parts.forEach((p, i) => {
            elements.push(
                <span key={`separator-${i}`} className="text-faded">
                    /
                </span>,
                visitDiscriminatedUnion(p, "type")._visit({
                    literal: (literal) => {
                        return (
                            <span key={`part-${i}`} className="t-muted whitespace-nowrap">
                                {literal.value}
                            </span>
                        );
                    },
                    pathParameter: (pathParameter) => (
                        <span key={`part-${i}`} className="bg-accent-highlight t-accent whitespace-nowrap rounded px-1">
                            :{pathParameter.name}
                        </span>
                    ),
                    _other: () => null,
                }),
            );
        });
        return elements;
    };

    return (
        <div ref={ref} className={classNames("flex h-8 items-center gap-1", className)}>
            <HttpMethodTag method={method} />
            <div
                className={classNames("flex items-center overflow-hidden", {
                    [styles.urlOverflowContainer ?? ""]: urlStyle === "overflow",
                })}
            >
                <CopyToClipboardButton content={buildRequestUrl(environment, path)}>
                    {(onClick) => (
                        <span
                            className={classNames(
                                "inline-flex shrink items-baseline hover:bg-tag-default py-0.5 px-1 rounded-md cursor-pointer",
                            )}
                            onClick={onClick}
                        >
                            <span
                                className={classNames("font-mono", {
                                    "text-xs": !large,
                                    "text-sm": large,
                                })}
                            >
                                {renderPathParts(endpointPathParts)}
                            </span>
                        </span>
                    )}
                </CopyToClipboardButton>
            </div>
        </div>
    );
});
