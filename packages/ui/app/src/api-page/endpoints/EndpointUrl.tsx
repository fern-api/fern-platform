import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import React, { PropsWithChildren, ReactElement, useImperativeHandle, useMemo, useRef } from "react";
import { buildRequestUrl } from "../../api-playground/utils";
import { HttpMethodTag } from "../../commons/HttpMethodTag";
import { CopyToClipboardButton } from "../../syntax-highlighting/CopyToClipboardButton";
import { divideEndpointPathToParts, type EndpointPathPart } from "../../util/endpoint";
import { ResolvedEndpointPathParts } from "../../util/resolver";

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
            elements.push(
                <span key="base-url" className="text-faded whitespace-nowrap max-sm:hidden">
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
        <div ref={ref} className={classNames("flex h-8 items-center gap-1 pr-2", className)}>
            <HttpMethodTag method={method} />
            <div className={classNames("flex items-center")}>
                <CopyToClipboardButton content={buildRequestUrl(environment, path)}>
                    {(onClick) => (
                        <span
                            className={classNames(
                                "inline-flex shrink items-baseline hover:bg-tag-default py-0.5 px-1 rounded-md cursor-default",
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
