import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FernCollapse } from "@fern-ui/components";
import { titleCase, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import cn from "clsx";
import { MouseEventHandler, memo } from "react";
import { MdxContent } from "../../mdx/MdxContent";
import {
    ResolvedError,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    dereferenceObjectProperties,
    unwrapReference,
} from "../../resolver/types";
import { type JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderDeprecatedTypeShorthand } from "../types/type-shorthand/TypeShorthand";
import { getErrorNameForStatus } from "../utils/getErrorNameForStatus";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";

export declare namespace EndpointError {
    export interface Props {
        error: ResolvedError;
        isFirst: boolean;
        isLast: boolean;
        isSelected: boolean;
        onClick: MouseEventHandler<HTMLButtonElement>;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        anchorIdParts: readonly string[];
        slug: FernNavigation.Slug;
        availability: APIV1Read.Availability | null | undefined;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

export const EndpointError = memo<EndpointError.Props>(function EndpointErrorUnmemoized({
    error,
    isFirst,
    isLast,
    isSelected,
    onHoverProperty,
    onClick,
    anchorIdParts,
    slug,
    availability,
    types,
}) {
    return (
        <button
            className={cn(
                "space flex flex-col items-start px-3 hover:bg-tag-default-soft transition-colors py-3",
                {
                    "bg-tag-default-soft": isSelected,
                },
                {
                    "border-default border-b": !isLast,
                },
                {
                    "rounded-t-md": isFirst,
                    "rounded-b-md": isLast,
                },
            )}
            onClick={onClick}
        >
            <div className="flex items-baseline space-x-2">
                <div className="rounded-lg bg-tag-danger px-2 py-1 text-xs text-intent-danger">{error.statusCode}</div>
                <div className="t-muted text-xs">
                    {error.name != null ? titleCase(error.name) : getErrorNameForStatus(error.statusCode)}
                </div>
                {availability != null && <EndpointAvailabilityTag availability={availability} minimal={true} />}
            </div>

            {error.shape != null && (
                <FernCollapse open={isSelected} className="w-full">
                    <div className="space-y-2 pt-2">
                        <div className="t-muted w-full text-start text-sm leading-7">
                            <MdxContent
                                mdx={error.description}
                                fallback={`This error returns ${renderDeprecatedTypeShorthand(error.shape, { withArticle: true }, types)}.`}
                            />
                        </div>
                        {shouldHideShape(error.shape, types) ? null : (
                            <div className="w-full text-start">
                                <TypeReferenceDefinitions
                                    isCollapsible
                                    applyErrorStyles
                                    shape={error.shape}
                                    onHoverProperty={onHoverProperty}
                                    anchorIdParts={anchorIdParts}
                                    slug={slug}
                                    types={types}
                                    isResponse={true}
                                />
                            </div>
                        )}
                    </div>
                </FernCollapse>
            )}
        </button>
    );
});

function shouldHideShape(shape: ResolvedTypeShape, types: Record<string, ResolvedTypeDefinition>): boolean {
    return visitDiscriminatedUnion(unwrapReference(shape, types), "type")._visit<boolean>({
        primitive: () => true,
        literal: () => true,
        object: (object) => dereferenceObjectProperties(object, types).length === 0,
        undiscriminatedUnion: () => false,
        discriminatedUnion: () => false,
        enum: () => false,
        optional: (value) => shouldHideShape(value.shape, types),
        list: (value) => shouldHideShape(value.shape, types),
        set: (value) => shouldHideShape(value.shape, types),
        map: () => false,
        unknown: () => true,
        alias: (value) => shouldHideShape(value.shape, types),
        _other: () => true,
    });
}
