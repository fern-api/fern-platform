import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { CopyToClipboardButton } from "@fern-ui/components";
import { useBooleanState } from "@fern-ui/react-commons";
import cn from "clsx";
import React, { PropsWithChildren, ReactElement, useImperativeHandle, useMemo, useRef, useState } from "react";
import { noop } from "ts-essentials";
import { HttpMethodTag } from "../../components/HttpMethodTag";
import { MaybeEnvironmentDropdown } from "../../components/MaybeEnvironmentDropdown";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        path: ApiDefinition.PathPart[];
        method: ApiDefinition.HttpMethod;
        baseUrl?: string;
        environmentId?: ApiDefinition.EnvironmentId;
        showEnvironment?: boolean;
        large?: boolean;
        className?: string;
    }>;
}

// TODO: this component needs a refresh
export const EndpointUrl = React.forwardRef<HTMLDivElement, PropsWithChildren<EndpointUrl.Props>>(function EndpointUrl(
    { path, method, baseUrl, environmentId, large, className, showEnvironment },
    parentRef,
) {
    const ref = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    useImperativeHandle(parentRef, () => ref.current!);

    const [isHovered, setIsHovered] = useState(false);
    const isEditingEnvironment = useBooleanState(false);

    const pathParts = useMemo(() => {
        const elements: (ReactElement | null)[] = [];
        path.forEach((part, i) => {
            visitDiscriminatedUnion(part)._visit({
                literal: (literal) => {
                    literal.value.split(/(?=\/)|(?<=\/)/).forEach((value, j) => {
                        if (value === "/") {
                            elements.push(
                                <span key={`separator-${i}-${j}`} className="text-faded">
                                    {"/"}
                                </span>,
                            );
                        } else {
                            elements.push(
                                <span key={`part-${i}-${j}`} className="whitespace-nowrap text-faded">
                                    {value}
                                </span>,
                            );
                        }
                    });
                },
                pathParameter: (pathParameter) => {
                    elements.push(
                        <span
                            key={`part-${i}`}
                            className="whitespace-nowrap text-accent bg-accent-highlight rounded px-1"
                        >
                            :{pathParameter.value}
                        </span>,
                    );
                },
                _other: noop,
            });
        });
        return elements;
    }, [path]);

    return (
        <div ref={ref} className={cn("flex items-center gap-1 pr-2", className)}>
            <HttpMethodTag method={method} />

            <div className={cn("flex items-center")}>
                <span
                    className={`inline-flex shrink items-baseline ${isHovered ? "hover:bg-tag-default" : ""} py-0.5 px-1 rounded-md cursor-default`}
                >
                    <CopyToClipboardButton
                        content={() =>
                            ApiDefinition.buildRequestUrl({
                                baseUrl,
                                path,
                            })
                        }
                    >
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
                                    {showEnvironment && (
                                        <span className="whitespace-nowrap max-sm:hidden">
                                            <MaybeEnvironmentDropdown
                                                baseUrl={baseUrl}
                                                environmentId={environmentId}
                                                urlTextStyle="t-muted"
                                                protocolTextStyle="text-faded"
                                                isEditingEnvironment={isEditingEnvironment}
                                                editable
                                            />
                                        </span>
                                    )}
                                    {pathParts}
                                </span>
                            </button>
                        )}
                    </CopyToClipboardButton>
                </span>
            </div>
        </div>
    );
});
