import { APIV1Read } from "@fern-api/fdr-sdk";
import { titleCase, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import cn from "clsx";
import { memo, MouseEventHandler } from "react";
import { FernCollapse } from "../../components/FernCollapse";
import {
    dereferenceObjectProperties,
    ResolvedError,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    unwrapReference,
} from "../../util/resolver";
import { type JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { renderTypeShorthand } from "../types/type-shorthand/TypeShorthand";
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
        route: string;
        availability: APIV1Read.Availability | null | undefined;
        defaultExpandAll?: boolean;
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
    route,
    availability,
    defaultExpandAll = false,
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
                <FernCollapse isOpen={isSelected} className="w-full">
                    <div className="space-y-2 pt-2">
                        <div className="t-muted w-full text-start text-sm leading-7">
                            {`This error return ${renderTypeShorthand(error.shape, { withArticle: true }, types)}.`}
                        </div>
                        {shouldHideShape(error.shape, types) ? null : (
                            <div className="w-full text-start">
                                <TypeReferenceDefinitions
                                    isCollapsible
                                    applyErrorStyles
                                    shape={error.shape}
                                    onHoverProperty={onHoverProperty}
                                    anchorIdParts={anchorIdParts}
                                    route={route}
                                    defaultExpandAll={defaultExpandAll}
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
        string: () => true,
        boolean: () => true,
        object: (object) => dereferenceObjectProperties(object, types).length === 0,
        undiscriminatedUnion: () => false,
        discriminatedUnion: () => false,
        enum: () => false,
        integer: () => true,
        double: () => true,
        long: () => true,
        datetime: () => true,
        uuid: () => true,
        base64: () => true,
        date: () => true,
        optional: (value) => shouldHideShape(value.shape, types),
        list: (value) => shouldHideShape(value.shape, types),
        set: (value) => shouldHideShape(value.shape, types),
        map: () => false,
        booleanLiteral: () => true,
        stringLiteral: () => true,
        unknown: () => true,
        alias: (value) => shouldHideShape(value.shape, types),
        _other: () => true,
    });
}
