import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import { CopyToClipboardButton } from "@fern-ui/components";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import cn from "clsx";
import React, { PropsWithChildren, ReactElement, useImperativeHandle, useMemo, useRef, useState } from "react";
import { parse } from "url";
import { buildRequestUrl } from "../../api-playground/utils";
import { useAllEnvironmentIds } from "../../atoms/environment";
import { HttpMethodTag } from "../../commons/HttpMethodTag";
import { MaybeEnvironmentDropdown } from "../../components/MaybeEnvironmentDropdown";
import { ResolvedEndpointPathParts } from "../../resolver/types";
import { divideEndpointPathToParts, type EndpointPathPart } from "../../util/endpoint";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        path: ResolvedEndpointPathParts[];
        method: APIV1Read.HttpMethod;
        selectedEnvironment?: APIV1Read.Environment;
        showEnvironment?: boolean;
        large?: boolean;
        className?: string;
    }>;
}

// TODO: this component needs a refresh
export const EndpointUrl = React.forwardRef<HTMLDivElement, PropsWithChildren<EndpointUrl.Props>>(function EndpointUrl(
    { path, method, selectedEnvironment, showEnvironment, large, className },
    parentRef,
) {
    const endpointPathParts = useMemo(() => divideEndpointPathToParts(path), [path]);

    const ref = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(parentRef, () => ref.current!);

    const allEnvironmentIds = useAllEnvironmentIds();
    const [isHovered, setIsHovered] = useState(false);

    const renderPathParts = (parts: EndpointPathPart[]) => {
        const elements: (ReactElement | null)[] = [];
        if (selectedEnvironment != null) {
            const url = parse(selectedEnvironment?.baseUrl);
            if (showEnvironment) {
                if (allEnvironmentIds.length < 2) {
                    elements.push(
                        <span key="protocol" className="whitespace-nowrap max-sm:hidden">
                            <span className="text-faded">{`${url.protocol}//`}</span>
                            <span className="t-muted">{url.host}</span>
                        </span>,
                    );
                }
            }
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
                <span
                    className={`inline-flex shrink items-baseline ${isHovered ? "hover:bg-tag-default" : ""} py-0.5 px-1 rounded-md cursor-default`}
                >
                    {showEnvironment && allEnvironmentIds.length > 1 && (
                        <MaybeEnvironmentDropdown
                            selectedEnvironment={selectedEnvironment}
                            urlTextStyle="t-muted"
                            protocolTextStyle="text-faded"
                        />
                    )}
                    <CopyToClipboardButton content={buildRequestUrl(selectedEnvironment?.baseUrl, path)}>
                        {(onClick) => (
                            <button
                                onClick={onClick}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
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
                </span>
            </div>
        </div>
    );
});
