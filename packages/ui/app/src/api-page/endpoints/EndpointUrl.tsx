import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import cn from "clsx";
import React, { PropsWithChildren, ReactElement, useImperativeHandle, useMemo, useRef } from "react";
import { parse } from "url";
import { buildRequestUrl } from "../../api-playground/utils.js";
import { HttpMethodTag } from "../../commons/HttpMethodTag.js";
import { ResolvedEndpointPathParts } from "../../resolver/types.js";
import { CopyToClipboardButton } from "../../syntax-highlighting/CopyToClipboardButton.js";
import { divideEndpointPathToParts, type EndpointPathPart } from "../../util/endpoint.js";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        path: ResolvedEndpointPathParts[];
        method: APIV1Read.HttpMethod;
        environment?: string;
        showEnvironment?: boolean;
        large?: boolean;
        className?: string;
    }>;
}

// TODO: this component needs a refresh
export const EndpointUrl = React.forwardRef<HTMLDivElement, PropsWithChildren<EndpointUrl.Props>>(function EndpointUrl(
    { path, method, environment, showEnvironment, large, className },
    parentRef,
) {
    const endpointPathParts = useMemo(() => divideEndpointPathToParts(path), [path]);

    const ref = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(parentRef, () => ref.current!);

    const renderPathParts = (parts: EndpointPathPart[]) => {
        const elements: (ReactElement | null)[] = [];
        if (showEnvironment && environment != null) {
            const url = parse(environment);
            elements.push(
                <span key="protocol" className="whitespace-nowrap max-sm:hidden">
                    <span className="text-faded">{url.protocol}</span>
                    <span className="text-faded">{"//"}</span>
                    <span className="t-muted">{url.host}</span>
                </span>,
            );

            url.pathname?.split("/").forEach((part, i) => {
                if (part.trim().length === 0) {
                    return;
                }
                elements.push(
                    <span key={`separator-base-${i}`} className="text-faded">
                        {"/"}
                    </span>,
                    <span key={`part-base-${i}`} className="whitespace-nowrap text-faded">
                        {part}
                    </span>,
                );
            });
        }
        parts.forEach((p, i) => {
            elements.push(
                <span key={`separator-${i}`} className="text-faded">
                    {"/"}
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
                        <span key={`part-${i}`} className="t-accent bg-accent-highlight whitespace-nowrap rounded px-1">
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
        <div ref={ref} className={cn("flex h-8 items-center gap-1 pr-2", className)}>
            <HttpMethodTag method={method} />
            <div className={cn("flex items-center")}>
                <CopyToClipboardButton content={buildRequestUrl(environment, path)}>
                    {(onClick) => (
                        <button
                            className={cn(
                                "inline-flex shrink items-baseline hover:bg-tag-default py-0.5 px-1 rounded-md cursor-default",
                            )}
                            onClick={onClick}
                        >
                            <span
                                className={cn("font-mono", {
                                    "text-xs": !large,
                                    "text-sm": large,
                                })}
                            >
                                {renderPathParts(endpointPathParts)}
                            </span>
                        </button>
                    )}
                </CopyToClipboardButton>
            </div>
        </div>
    );
});
