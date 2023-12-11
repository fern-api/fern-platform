import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { useRouter } from "next/router";
import { memo, MouseEventHandler, ReactElement, useEffect } from "react";
import { getAnchorId } from "../../util/anchor";
import { toTitleCase } from "../../util/string";
import { type JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinitionContextProvider } from "../types/context/TypeDefinitionContextProvider";
import { InternalTypeDefinitionError } from "../types/type-definition/InternalTypeDefinitionError";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";
import { getErrorNameForStatus } from "../utils/getErrorNameForStatus";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";

export declare namespace EndpointError {
    export interface Props {
        error: FdrAPI.api.v1.read.ErrorDeclarationV2;
        isFirst: boolean;
        isLast: boolean;
        isSelected: boolean;
        onClick: MouseEventHandler<HTMLButtonElement>;
        select: () => void;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: string[];
        route: string;
        availability: APIV1Read.Availability | undefined;
    }
}

export const EndpointError = memo<EndpointError.Props>(function EndpointErrorUnmemoized({
    error,
    isFirst,
    isLast,
    isSelected,
    onHoverProperty,
    onClick,
    select,
    anchorIdParts,
    route,
    availability,
}) {
    const router = useRouter();
    const anchorIdSoFar = getAnchorId(anchorIdParts);

    useEffect(() => {
        if (router.asPath.startsWith(`${route}#${anchorIdSoFar}-`)) {
            select();
        }
    }, [anchorIdSoFar, select, router.asPath, route]);

    return (
        <button
            className={classNames(
                "space flex hover:bg-gray-100/90 dark:hover:bg-background-primary-dark flex-col items-start px-3",
                {
                    "bg-gray-100/90 dark:bg-background-primary-dark": isSelected,
                },
                {
                    "border-border-default-light dark:border-border-default-dark border-b": !isLast,
                },
                {
                    "rounded-t-md": isFirst,
                    "rounded-b-md": isLast,
                },
                {
                    "py-3": !isSelected,
                    "pt-3": isSelected,
                }
            )}
            onClick={onClick}
        >
            <div className="flex items-baseline space-x-2">
                <div className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400">{error.statusCode}</div>
                <div className="t-muted text-xs">
                    {error.name != null ? toTitleCase(error.name) : getErrorNameForStatus(error.statusCode)}
                </div>
                {availability != null && <EndpointAvailabilityTag availability={availability} minimal={true} />}
            </div>

            {isSelected && error.type != null && (
                <div className="w-full pb-3">
                    <div className="t-muted mt-3 w-full text-start text-sm font-light leading-7">
                        This error returns{" "}
                        {visitDiscriminatedUnion(error.type, "type")._visit<string | ReactElement>({
                            alias: (type) => (
                                <>
                                    <TypeShorthand type={type.value} plural={false} withArticle />.
                                </>
                            ),
                            object: () => "an object.",
                            discriminatedUnion: () => "a union.",
                            undiscriminatedUnion: () => "a union.",
                            enum: () => "an enum.",
                            _other: () => "unknown.",
                        })}
                    </div>
                    {error.type.type === "alias" ? (
                        <div className="w-full text-start">
                            <TypeReferenceDefinitions
                                isCollapsible
                                applyErrorStyles
                                type={error.type.value}
                                onHoverProperty={onHoverProperty}
                                anchorIdParts={anchorIdParts}
                                route={route}
                            />
                        </div>
                    ) : error.type.type === "object" ? (
                        <div className="mt-2.5 w-full text-start">
                            <TypeDefinitionContextProvider onHoverProperty={onHoverProperty}>
                                <InternalTypeDefinitionError
                                    isCollapsible
                                    typeShape={error.type}
                                    anchorIdParts={anchorIdParts}
                                    route={route}
                                />
                            </TypeDefinitionContextProvider>
                        </div>
                    ) : null}
                </div>
            )}
        </button>
    );
});
