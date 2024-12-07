import { APIV1Read } from "@fern-api/fdr-sdk";
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
        options?: APIV1Read.Environment[];
        showEnvironment?: boolean;
        size?: "sm" | "md" | "lg";
        className?: string;
    }>;
}

// TODO: this component needs a refresh
export const EndpointUrl = React.forwardRef<HTMLDivElement, PropsWithChildren<EndpointUrl.Props>>(function EndpointUrl(
    { path, method, baseUrl, environmentId, size = "md", className, showEnvironment, options },
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

    // if the environment is hidden, but it contains a basepath, we need to show the basepath
    const environmentBasepath = useMemo(() => {
        const url = baseUrl ?? options?.find((option) => option.id === environmentId)?.baseUrl;
        if (url == null) {
            return undefined;
        }
        try {
            return new URL(url, "http://n").pathname;
        } catch (error) {
            return undefined;
        }
    }, [options, environmentId, baseUrl]);

    return (
        <div ref={ref} className={cn("flex items-center gap-1 pr-2", className)}>
            <HttpMethodTag method={method} size={size === "sm" ? "sm" : "lg"} />

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
                                        "text-xs": size === "sm" || size === "md",
                                        "text-sm": size === "lg",
                                    })}
                                >
                                    {showEnvironment && (
                                        <span className="whitespace-nowrap max-sm:hidden">
                                            <MaybeEnvironmentDropdown
                                                baseUrl={baseUrl}
                                                environmentId={environmentId}
                                                options={options}
                                                urlTextStyle="t-muted"
                                                protocolTextStyle="text-faded"
                                                isEditingEnvironment={isEditingEnvironment}
                                                editable
                                            />
                                        </span>
                                    )}
                                    {!showEnvironment && environmentBasepath && environmentBasepath !== "/" && (
                                        <span className="t-muted">{environmentBasepath}</span>
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
